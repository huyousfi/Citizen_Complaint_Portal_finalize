import { useMemo } from 'react'
import { Link } from 'react-router-dom'

export default function OfficerDashboardPage({ complaints, aiSummary, onStatusUpdate, search, setSearch, filters, setFilters, onDownloadCsv }) {
  const visibleComplaints = useMemo(() => {
    return complaints.filter((item) => {
      const matchesSearch =
        !search ||
        `${item.title} ${item.area} ${item.category}`.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = filters.category === 'All' || item.category === filters.category
      const matchesArea = filters.area === 'All' || item.area === filters.area
      const matchesStatus = filters.status === 'All' || item.status === filters.status
      const matchesPriority = filters.priority === 'All' || item.priority === filters.priority

      return matchesSearch && matchesCategory && matchesArea && matchesStatus && matchesPriority
    })
  }, [complaints, search, filters])

  const stats = useMemo(() => {
    const total = complaints.length
    const pending = complaints.filter((item) => item.status === 'Pending').length
    const inProgress = complaints.filter((item) => item.status === 'In Progress').length
    const resolved = complaints.filter((item) => item.status === 'Resolved').length
    const critical = complaints.filter((item) => item.priority === 'Critical').length
    const averageSatisfaction = complaints.length
      ? ((complaints.filter((item) => item.feedbackRating).reduce((sum, item) => sum + (item.feedbackRating || 0), 0) / complaints.filter((item) => item.feedbackRating).length) || 0).toFixed(1)
      : '0.0'

    return { total, pending, inProgress, resolved, critical, averageSatisfaction }
  }, [complaints])

  return (
    <section className="officer-dashboard">
      <div className="panel ai-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Officer briefing</p>
            <h3>AI daily summary</h3>
          </div>
          <button type="button" className="secondary-button" onClick={onDownloadCsv}>Download CSV</button>
        </div>
        <p>{aiSummary || 'Loading briefing...'}</p>
      </div>

      <div className="stats-grid stats-grid--officer">
        <article className="stat-card"><span>Total</span><strong>{stats.total}</strong></article>
        <article className="stat-card"><span>Pending</span><strong>{stats.pending}</strong></article>
        <article className="stat-card"><span>In progress</span><strong>{stats.inProgress}</strong></article>
        <article className="stat-card"><span>Resolved</span><strong>{stats.resolved}</strong></article>
        <article className="stat-card"><span>Critical</span><strong>{stats.critical}</strong></article>
        <article className="stat-card"><span>Avg satisfaction</span><strong>{stats.averageSatisfaction}</strong></article>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Management</p>
            <h3>All complaints</h3>
          </div>
          <span className="tiny-badge">{visibleComplaints.length}</span>
        </div>

        <div className="filter-row">
          <input type="search" placeholder="Search title or area" value={search} onChange={(event) => setSearch(event.target.value)} />
          <select value={filters.category} onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}>
            {['All', 'Road', 'Garbage', 'Water', 'Electricity', 'Other'].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <select value={filters.area} onChange={(event) => setFilters((current) => ({ ...current, area: event.target.value }))}>
            {['All', 'Downtown', 'North Zone', 'South Zone', 'East District', 'West District'].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
            {['All', 'Pending', 'In Progress', 'Resolved'].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <select value={filters.priority} onChange={(event) => setFilters((current) => ({ ...current, priority: event.target.value }))}>
            {['All', 'Low', 'Medium', 'High', 'Critical'].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Area</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {visibleComplaints.map((item) => (
                <tr key={item._id || item.id}>
                  <td>{item.title}</td>
                  <td>{item.category}</td>
                  <td>{item.area}</td>
                  <td><span className={`status-pill-table ${String(item.status).toLowerCase().replace(/\s+/g, '-')}`}>{item.status}</span></td>
                  <td><span className={`priority-pill ${String(item.priority || 'Medium').toLowerCase()}`}>{item.priority || 'Medium'}</span></td>
                  <td>
                    <Link to={`/officer/complaints/${item._id || item.id}`} className="link-button">Review</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
