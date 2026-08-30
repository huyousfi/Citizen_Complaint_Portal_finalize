import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import Layout from './components/Layout'
import NotificationCenter from './components/NotificationCenter'
import { NotificationProvider } from './contexts/NotificationContext'
import apiClient from './api/client'
import { sampleComplaints } from './mockApi'
import HomePage from './pages/HomePage'
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import OverviewPage from './pages/OverviewPage'
import ComplaintsPage from './pages/ComplaintsPage'
import ComplaintDetailPage from './pages/ComplaintDetailPage'
import MyComplaintsPage from './pages/MyComplaintsPage'
import NewComplaintPage from './pages/NewComplaintPage'
import OfficerDashboardPage from './pages/OfficerDashboardPage'
import AnalyticsDashboardPage from './pages/AnalyticsDashboardPage'
import MapViewPage from './pages/MapViewPage'
import './App.css'

function ProtectedRoute({ user, allowedRole, children, fallbackTo }) {
  if (!user) {
    return <Navigate to={fallbackTo || '/login'} replace />
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'officer' ? '/officer/dashboard' : '/dashboard'} replace />
  }

  return children
}

function App() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [complaints, setComplaints] = useState([])
  const [loginError, setLoginError] = useState('')
  const [signupError, setSignupError] = useState('')
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  })
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [aiSummary, setAiSummary] = useState('')
  const [officerFilters, setOfficerFilters] = useState({
    category: 'All',
    area: 'All',
    status: 'All',
    priority: 'All',
  })
  const [officerSearch, setOfficerSearch] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (token && storedUser) {
      try {
        apiClient.setToken(token)
        setUser(JSON.parse(storedUser))
      } catch (error) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
  }, [])

  useEffect(() => {
    if (!user) {
      setComplaints([])
      return
    }

    const loadComplaints = async () => {
      try {
        const data = await apiClient.getComplaints({})
        setComplaints(data.complaints && data.complaints.length ? data.complaints : sampleComplaints)
      } catch (error) {
        console.error('Falling back to sample complaint data for the UI prototype:', error)
        setComplaints(sampleComplaints)
      }
    }

    loadComplaints()
  }, [user])

  useEffect(() => {
    if (!user || user.role !== 'officer') return

    const loadSummary = async () => {
      try {
        const data = await apiClient.getOfficerSummary()
        setAiSummary(data.summary || 'No briefing available at the moment.')
      } catch (error) {
        setAiSummary('Unable to generate AI briefing right now.')
      }
    }

    loadSummary()
  }, [user])

  const handleLoginSubmit = async (event) => {
    event.preventDefault()
    setLoginError('')

    try {
      const data = await apiClient.login(loginData.email, loginData.password)
      apiClient.setToken(data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
      navigate(data.user.role === 'officer' ? '/officer/dashboard' : '/dashboard')
    } catch (error) {
      setLoginError(error.message || 'Login failed. Please try again.')
    }
  }

  const handleSignupSubmit = async (event) => {
    event.preventDefault()
    setSignupError('')

    if (signupData.password !== signupData.confirmPassword) {
      setSignupError('Passwords do not match.')
      return
    }

    try {
      await apiClient.signup(signupData.name, signupData.email, signupData.password, 'citizen')
      setSignupData({ name: '', email: '', password: '', confirmPassword: '' })
      navigate('/login')
    } catch (error) {
      setSignupError(error.message || 'Signup failed. Please try again.')
    }
  }

  const handleLogout = () => {
    apiClient.clearToken()
    localStorage.removeItem('user')
    setUser(null)
    setComplaints([])
    navigate('/login')
  }

  const handleComplaintUpvote = async (complaintId) => {
    if (!user || user.role !== 'citizen') return

    try {
      const data = await apiClient.upvoteComplaint(complaintId)
      setComplaints((current) =>
        current.map((item) => ((item._id || item.id) === complaintId ? { ...item, upvotes: data.complaint?.upvotes ?? item.upvotes } : item))
      )
    } catch (error) {
      console.error('Failed to upvote complaint:', error)
    }
  }

  const handleDownloadCsv = async () => {
    try {
      const params = new URLSearchParams()
      if (officerFilters.category !== 'All') params.append('category', officerFilters.category)
      if (officerFilters.status !== 'All') params.append('status', officerFilters.status)
      if (officerFilters.area !== 'All') params.append('area', officerFilters.area)
      if (officerSearch) params.append('search', officerSearch)

      const query = params.toString() ? `?${params.toString()}` : ''
      const token = localStorage.getItem('token')
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/complaints/export${query}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to export CSV')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'complaints_export.csv'
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('CSV export failed:', error)
    }
  }

  return (
    <NotificationProvider>
      <>
        <NotificationCenter />
        <Routes>
          <Route
            path="/"
            element={
              <Layout user={user} onLogout={handleLogout}>
                <HomePage />
              </Layout>
            }
          />
          <Route
            path="/signup"
            element={
              user ? (
                <Navigate to={user.role === 'officer' ? '/officer/dashboard' : '/dashboard'} replace />
              ) : (
                <Layout user={user} onLogout={handleLogout}>
                  <SignupPage
                    signupData={signupData}
                    setSignupData={setSignupData}
                    onSubmit={handleSignupSubmit}
                    signupError={signupError}
                  />
                </Layout>
              )
            }
          />
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to={user.role === 'officer' ? '/officer/dashboard' : '/dashboard'} replace />
              ) : (
                <Layout user={user} onLogout={handleLogout}>
                  <LoginPage
                    loginData={loginData}
                    setLoginData={setLoginData}
                    loginError={loginError}
                    onSubmit={handleLoginSubmit}
                  />
                </Layout>
              )
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute user={user} allowedRole="citizen" fallbackTo="/login">
                <Layout user={user} onLogout={handleLogout}>
                  <OverviewPage complaints={complaints} user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/complaints/new"
            element={
              <ProtectedRoute user={user} allowedRole="citizen" fallbackTo="/login">
                <Layout user={user} onLogout={handleLogout}>
                  <NewComplaintPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/complaints/mine"
            element={
              <ProtectedRoute user={user} allowedRole="citizen" fallbackTo="/login">
                <Layout user={user} onLogout={handleLogout}>
                  <MyComplaintsPage user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/complaints"
            element={
              <Layout user={user} onLogout={handleLogout}>
                <ComplaintsPage complaints={complaints} user={user} onVote={handleComplaintUpvote} />
              </Layout>
            }
          />
          <Route
            path="/complaints/:id"
            element={
              <Layout user={user} onLogout={handleLogout}>
                <ComplaintDetailPage user={user} />
              </Layout>
            }
          />

          <Route
            path="/officer/dashboard"
            element={
              <ProtectedRoute user={user} allowedRole="officer" fallbackTo="/login">
                <Layout user={user} onLogout={handleLogout}>
                  <OfficerDashboardPage
                    complaints={complaints}
                    aiSummary={aiSummary}
                    search={officerSearch}
                    setSearch={setOfficerSearch}
                    filters={officerFilters}
                    setFilters={setOfficerFilters}
                    onDownloadCsv={handleDownloadCsv}
                  />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/officer/complaints/:id"
            element={
              <ProtectedRoute user={user} allowedRole="officer" fallbackTo="/login">
                <Layout user={user} onLogout={handleLogout}>
                  <ComplaintDetailPage user={user} isOfficerView />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/officer/analytics"
            element={
              <ProtectedRoute user={user} allowedRole="officer" fallbackTo="/login">
                <Layout user={user} onLogout={handleLogout}>
                  <AnalyticsDashboardPage complaints={complaints} />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/officer/map"
            element={
              <ProtectedRoute user={user} allowedRole="officer" fallbackTo="/login">
                <Layout user={user} onLogout={handleLogout}>
                  <MapViewPage complaints={complaints} />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </>
    </NotificationProvider>
  )
}

export default App
