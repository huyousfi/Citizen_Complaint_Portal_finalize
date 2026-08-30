import { useMemo } from 'react'

export default function AnalyticsDashboardPage({ complaints }) {
  const analytics = useMemo(() => {
    if (!complaints.length) {
      return {
        total: 0,
        byCategory: {},
        byStatus: { Pending: 0, 'In Progress': 0, Resolved: 0 },
        byArea: {},
        byPriority: { Low: 0, Medium: 0, High: 0, Critical: 0 },
        dailyTrend: [],
      }
    }

    const byCategory = {}
    complaints.forEach((c) => {
      byCategory[c.category] = (byCategory[c.category] || 0) + 1
    })

    const byStatus = { Pending: 0, 'In Progress': 0, Resolved: 0 }
    complaints.forEach((c) => {
      if (Object.prototype.hasOwnProperty.call(byStatus, c.status)) {
        byStatus[c.status] += 1
      }
    })

    const byArea = {}
    complaints.forEach((c) => {
      byArea[c.area] = (byArea[c.area] || 0) + 1
    })

    const byPriority = { Low: 0, Medium: 0, High: 0, Critical: 0 }
    complaints.forEach((c) => {
      if (Object.prototype.hasOwnProperty.call(byPriority, c.priority)) {
        byPriority[c.priority] += 1
      }
    })

    const last7Days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const count = complaints.filter((c) => new Date(c.createdAt).toISOString().split('T')[0] === dateStr).length
      last7Days.push({ date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), count })
    }

    return {
      total: complaints.length,
      byCategory,
      byStatus,
      byArea,
      byPriority,
      dailyTrend: last7Days,
    }
  }, [complaints])

  const maxTrendValue = Math.max(...analytics.dailyTrend.map((d) => d.count), 1)

  return (
    <section className="analytics-dashboard">
      <div className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Data insights</p>
            <h3>Complaint Analytics</h3>
          </div>
          <span className="tiny-badge">{analytics.total} total</span>
        </div>

        <div className="stats-summary">
          <article className="stat-card">
            <span>Total Complaints</span>
            <strong>{analytics.total}</strong>
          </article>
          <article className="stat-card">
            <span>Pending</span>
            <strong>{analytics.byStatus.Pending}</strong>
          </article>
          <article className="stat-card">
            <span>In Progress</span>
            <strong>{analytics.byStatus['In Progress']}</strong>
          </article>
          <article className="stat-card">
            <span>Resolved</span>
            <strong>{analytics.byStatus.Resolved}</strong>
          </article>
          <article className="stat-card">
            <span>Critical</span>
            <strong>{analytics.byPriority.Critical}</strong>
          </article>
        </div>
      </div>

      <div className="charts-grid">
        <div className="panel chart-panel">
          <h4>Trend (Last 7 Days)</h4>
          <div className="mini-chart">
            {analytics.dailyTrend.map((point) => (
              <div key={point.date} className="mini-chart-bar-wrap">
                <div
                  className="mini-chart-bar"
                  style={{ height: `${(point.count / maxTrendValue) * 100}%` }}
                  title={`${point.date}: ${point.count}`}
                />
                <span>{point.date}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel chart-panel">
          <h4>By Category</h4>
          <div className="donut-list">
            {Object.entries(analytics.byCategory).map(([category, count]) => (
              <div key={category} className="donut-row">
                <span>{category}</span>
                <div className="donut-bar"><div style={{ width: `${(count / analytics.total) * 100}%` }} /></div>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="panel chart-panel">
          <h4>By Status</h4>
          <div className="status-stack">
            {Object.entries(analytics.byStatus).map(([status, count]) => (
              <div key={status} className="status-row">
                <span>{status}</span>
                <div className="status-bar"><div style={{ width: `${(count / analytics.total) * 100}%` }} /></div>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="panel chart-panel">
          <h4>By Priority Level</h4>
          <div className="priority-stack">
            {Object.entries(analytics.byPriority).map(([priority, count]) => (
              <div key={priority} className="priority-row">
                <span>{priority}</span>
                <div className="priority-bar"><div style={{ width: `${(count / analytics.total) * 100}%` }} /></div>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel">
        <h4>Complaints by Area</h4>
        <div className="area-breakdown">
          {Object.entries(analytics.byArea).map(([area, count]) => (
            <div key={area} className="area-item">
              <span>{area}</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(count / analytics.total) * 100}%` }} />
              </div>
              <strong>{count}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
