import { Link } from 'react-router-dom'

export default function OverviewPage({ complaints, user }) {
  const total = complaints.length
  const pending = complaints.filter((item) => item.status === 'Pending').length
  const inProgress = complaints.filter((item) => item.status === 'In Progress').length
  const resolved = complaints.filter((item) => item.status === 'Resolved').length

  return (
    <>
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="status-pill">Citizen dashboard</span>
          <h1>Welcome back, {user?.name || 'Citizen'}.</h1>
          <p>
            Submit issues, follow progress, and stay informed on how your city is responding to service requests.
          </p>

          <div className="hero-actions">
            <Link to="/complaints/new" className="primary-button">Report a Complaint</Link>
            <Link to="/complaints/mine" className="secondary-button">My Complaints</Link>
            <Link to="/complaints" className="secondary-button">Browse Complaints</Link>
          </div>
        </div>

        <div className="hero-visual" aria-label="Citizen summary">
          <div className="mini-card">
            <span className="mini-label">Your reports</span>
            <strong>{total}</strong>
            <small>total complaints</small>
          </div>
          <div className="ring-card">
            <div className="ring-chart">
              <span>{resolved}</span>
            </div>
            <p>resolved so far</p>
          </div>
        </div>
      </section>

      <section className="stats-grid" aria-label="Citizen statistics">
        <article className="stat-card">
          <span>Total</span>
          <strong>{total}</strong>
        </article>
        <article className="stat-card">
          <span>Pending</span>
          <strong>{pending}</strong>
        </article>
        <article className="stat-card">
          <span>In Progress</span>
          <strong>{inProgress}</strong>
        </article>
        <article className="stat-card">
          <span>Resolved</span>
          <strong>{resolved}</strong>
        </article>
      </section>
    </>
  )
}
