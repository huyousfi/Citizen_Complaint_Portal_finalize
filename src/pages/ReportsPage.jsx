export default function ReportsPage({ complaints }) {
  const resolved = complaints.filter((item) => item.status === 'Resolved').length
  const inReview = complaints.filter((item) => item.status === 'In Review').length
  const critical = complaints.filter((item) => item.priority === 'Critical').length

  return (
    <section className="reports-grid">
      <div className="panel report-card">
        <p className="eyebrow">This month</p>
        <h3>Performance summary</h3>
        <div className="report-stats">
          <div>
            <strong>{resolved}</strong>
            <span>Resolved</span>
          </div>
          <div>
            <strong>{inReview}</strong>
            <span>In review</span>
          </div>
          <div>
            <strong>{critical}</strong>
            <span>Critical</span>
          </div>
        </div>
      </div>

      <div className="panel report-card">
        <p className="eyebrow">Department view</p>
        <h3>Issue distribution</h3>
        <div className="progress-list">
          <div>
            <div className="progress-row"><span>Road maintenance</span><strong>69%</strong></div>
            <div className="progress-bar"><span style={{ width: '69%' }} /></div>
          </div>
          <div>
            <div className="progress-row"><span>Water services</span><strong>81%</strong></div>
            <div className="progress-bar"><span style={{ width: '81%' }} /></div>
          </div>
          <div>
            <div className="progress-row"><span>Waste pickup</span><strong>92%</strong></div>
            <div className="progress-bar"><span style={{ width: '92%' }} /></div>
          </div>
        </div>
      </div>
    </section>
  )
}
