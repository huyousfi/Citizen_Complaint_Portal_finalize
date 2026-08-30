const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5001/api'
    : '/api')

class APIClient {
  constructor() {
    this.baseURL = API_BASE_URL
    this.token = localStorage.getItem('token') || null
  }

  setToken(token) {
    this.token = token
    localStorage.setItem('token', token)
  }

  clearToken() {
    this.token = null
    localStorage.removeItem('token')
  }

  getHeaders() {
    const headers = { 'Content-Type': 'application/json' }
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }
    return headers
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      ...options,
      headers: this.getHeaders(),
    }

    try {
      const response = await fetch(url, config)

      let data = {}
      try {
        data = await response.json()
      } catch {
        data = {}
      }

      if (!response.ok) {
        throw new Error(data.error || `API error: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error)

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('The backend server is not reachable. Start the API server and try again.')
      }

      throw new Error(error.message || 'Request failed. Please try again.')
    }
  }

  // Auth endpoints
  signup(name, email, password, role = 'citizen') {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    })
  }

  login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  // Complaint endpoints
  createComplaint(title, description, category, area, imageUrl = null) {
    return this.request('/complaints', {
      method: 'POST',
      body: JSON.stringify({ title, description, category, area, imageUrl }),
    })
  }

  getComplaints(filters = {}) {
    const params = new URLSearchParams()
    if (filters.search) params.append('search', filters.search)
    if (filters.category && filters.category !== 'All') params.append('category', filters.category)
    if (filters.status && filters.status !== 'All') params.append('status', filters.status)
    if (filters.area && filters.area !== 'All') params.append('area', filters.area)
    if (filters.priority && filters.priority !== 'All') params.append('priority', filters.priority)

    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/complaints${query}`, { method: 'GET' })
  }

  getMyComplaints() {
    return this.request('/complaints/mine', { method: 'GET' })
  }

  getComplaintDetail(id) {
    return this.request(`/complaints/${id}`, { method: 'GET' })
  }

  upvoteComplaint(id) {
    return this.request(`/complaints/${id}/upvote`, { method: 'PATCH' })
  }

  updateComplaintStatus(id, status, officerRemark = null) {
    return this.request(`/complaints/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, officerRemark }),
    })
  }

  submitFeedback(id, rating, comment = null) {
    return this.request(`/complaints/${id}/feedback`, {
      method: 'PATCH',
      body: JSON.stringify({ rating, comment }),
    })
  }

  exportComplaints(filters = {}) {
    const params = new URLSearchParams()
    if (filters.category && filters.category !== 'All') params.append('category', filters.category)
    if (filters.status && filters.status !== 'All') params.append('status', filters.status)
    if (filters.area && filters.area !== 'All') params.append('area', filters.area)
    if (filters.search) params.append('search', filters.search)

    const query = params.toString() ? `?${params.toString()}` : ''
    return `${this.baseURL}/complaints/export${query}${this.token ? `&token=${this.token}` : ''}`
  }

  checkDuplicates(category, area) {
    return this.request(`/complaints/check/duplicates?category=${category}&area=${area}`, {
      method: 'GET',
    })
  }

  // Upload image for complaint
  uploadComplaintImage(file) {
    const formData = new FormData()
    formData.append('image', file)

    const url = `${this.baseURL}/complaints/upload`
    const config = {
      method: 'POST',
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      body: formData,
    }

    return fetch(url, config)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Upload failed: ${response.status}`)
        }
        return response.json()
      })
      .catch((error) => {
        console.error('Image upload failed:', error)
        throw new Error(error.message || 'Failed to upload image')
      })
  }

  // AI endpoints
  getOfficerSummary() {
    return this.request('/ai/officer-summary', {
      method: 'POST',
      body: JSON.stringify({}),
    })
  }
}

export default new APIClient()
