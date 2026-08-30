import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../api/client'

export default function MyComplaintsPage({ user }) {
  const [complaints, setComplaints] = useState([])
  const [feedbackMap, setFeedbackMap] = useState({})

  useEffect(() => {
    const loadMyComplaints = async () => {
      try {
        const data = await apiClient.getMyComplaints()
        setComplaints(data.complaints || [])
      } catch (error) {
        console.error('Failed to load my complaints:', error)
      }
    }

    loadMyComplaints()
  }, [user])

  const submitFeedback = async (complaintId, rating) => {
    const comment = feedbackMap[complaintId] || ''
    try {
      const data = await apiClient.submitFeedback(complaintId, rating, comment)
      setComplaints((current) =>
        current.map((item) => ((item._id || item.id) === complaintId ? { ...item, feedbackPending: false, ...data.complaint } : item))
      )
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    }
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">My reports</p>
          <h3>Complaint history</h3>
        </div>
      </div>

      <div className="complaint-card-list">
        {complaints.length === 0 ? (
          <p>You have not submitted any complaints yet.</p>
        ) : (
          complaints.map((item) => (
            <article className="complaint-card" key={item._id || item.id}>
              <div className="complaint-card-header">
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.area} • {item.category}</p>
                </div>
                <span className={`priority-pill ${String(item.priority || 'Medium').toLowerCase()}`}>{item.priority || 'Medium'}</span>
              </div>

              <div className="complaint-card-meta">
                <span className={`status-pill-table ${String(item.status).toLowerCase().replace(/\s+/g, '-')}`}>{item.status}</span>
                <span>{item.upvotes || 0} upvotes</span>
                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>

              <p className="complaint-card-description">{item.officerRemark || 'No officer remark yet.'}</p>

              {item.feedbackPending ? (
                <div className="feedback-box">
                  <label>
                    Rating
                    <select onChange={(event) => submitFeedback(item._id || item.id, Number(event.target.value))} defaultValue="">
                      <option value="" disabled>Select rating</option>
                      <option value="5">5 - Excellent</option>
                      <option value="4">4 - Good</option>
                      <option value="3">3 - Okay</option>
                      <option value="2">2 - Poor</option>
                      <option value="1">1 - Very poor</option>
                    </select>
                  </label>
                  <label>
                    Comment
                    <textarea
                      rows={3}
                      value={feedbackMap[item._id || item.id] || ''}
                      onChange={(event) =>
                        setFeedbackMap((current) => ({ ...current, [item._id || item.id]: event.target.value }))
                      }
                      placeholder="Share your feedback"
                    />
                  </label>
                </div>
              ) : null}

              <div className="complaint-card-actions">
                <Link to={`/complaints/${item._id || item.id}`} className="secondary-button small-button">Open</Link>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  )
}
