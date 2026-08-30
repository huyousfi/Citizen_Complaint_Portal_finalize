import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import apiClient from '../api/client'

export default function ComplaintDetailPage({ user, isOfficerView = false }) {
  const { id } = useParams()
  const [complaint, setComplaint] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('Pending')
  const [officerRemark, setOfficerRemark] = useState('')

  useEffect(() => {
    const loadComplaint = async () => {
      try {
        const data = await apiClient.getComplaintDetail(id)
        setComplaint(data.complaint || data)
        setStatus(data.complaint?.status || 'Pending')
        setOfficerRemark(data.complaint?.officerRemark || '')
      } catch (err) {
        setError(err.message || 'Unable to load complaint details.')
      } finally {
        setLoading(false)
      }
    }

    loadComplaint()
  }, [id])

  const handleVote = async () => {
    if (!user || user.role !== 'citizen') return
    try {
      const data = await apiClient.upvoteComplaint(id)
      setComplaint((current) => ({ ...current, upvotes: data.complaint?.upvotes ?? (current?.upvotes || 0) }))
    } catch (err) {
      setError(err.message || 'Could not upvote complaint.')
    }
  }

  const handleStatusUpdate = async () => {
    if (!isOfficerView || !user || user.role !== 'officer') return
    try {
      const data = await apiClient.updateComplaintStatus(id, status, officerRemark)
      setComplaint((current) => ({ ...current, ...data.complaint }))
    } catch (err) {
      setError(err.message || 'Could not update complaint status.')
    }
  }

  if (loading) return <div className="panel"><p>Loading complaint...</p></div>
  if (error) return <div className="panel"><p className="message error">{error}</p></div>
  if (!complaint) return null

  return (
    <section className="panel detail-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Complaint detail</p>
          <h3>{complaint.title}</h3>
        </div>
        <div className="detail-actions">
          {user && user.role === 'citizen' && !isOfficerView ? (
            <button type="button" className="primary-button" onClick={handleVote}>Upvote ({complaint.upvotes || 0})</button>
          ) : null}
          {isOfficerView ? <Link to="/officer/dashboard" className="secondary-button">Back to dashboard</Link> : null}
        </div>
      </div>

      <div className="detail-grid">
        <div>
          <p><strong>Category:</strong> {complaint.category}</p>
          <p><strong>Area:</strong> {complaint.area}</p>
          <p><strong>Status:</strong> {complaint.status}</p>
          <p><strong>Priority:</strong> {complaint.priority || 'Medium'}</p>
          <p><strong>Priority score:</strong> {complaint.priorityScore ?? complaint.score ?? 'N/A'}</p>
          <p><strong>Upvotes:</strong> {complaint.upvotes || 0}</p>
        </div>
        <div>
          <p><strong>Filed:</strong> {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : 'N/A'}</p>
          <p><strong>Updated:</strong> {complaint.updatedAt ? new Date(complaint.updatedAt).toLocaleDateString() : 'N/A'}</p>
          <p><strong>Citizen:</strong> {complaint.createdByName || complaint.citizenName || 'Citizen'}</p>
        </div>
      </div>

      <div className="detail-description">
        <h4>Description</h4>
        <p>{complaint.description}</p>
      </div>

      <div className="status-track">
        <span className={complaint.status === 'Pending' ? 'active' : ''}>Pending</span>
        <span className={complaint.status === 'In Progress' ? 'active' : ''}>In Progress</span>
        <span className={complaint.status === 'Resolved' ? 'active' : ''}>Resolved</span>
      </div>

      {isOfficerView ? (
        <div className="officer-review-box">
          <label>
            Status
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              {['Pending', 'In Progress', 'Resolved'].map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>

          <label>
            Officer remark
            <textarea value={officerRemark} onChange={(event) => setOfficerRemark(event.target.value)} rows={4} />
          </label>

          <button type="button" className="primary-button" onClick={handleStatusUpdate}>Update complaint</button>
        </div>
      ) : (
        <div className="detail-remark">
          <h4>Officer remark</h4>
          <p>{complaint.officerRemark || 'No officer update yet.'}</p>
        </div>
      )}
    </section>
  )
}
