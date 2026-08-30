import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

export default function ComplaintsPage({ complaints, user, onVote }) {
  const [filters, setFilters] = useState({
    search: '',
    category: 'All',
    status: 'All',
    area: 'All',
    priority: 'All',
    sort: 'Newest',
  })

  const visibleComplaints = useMemo(() => {
    const filtered = complaints.filter((item) => {
      const normalizedSearch = filters.search.trim().toLowerCase()
      const matchesSearch =
        !normalizedSearch ||
        `${item.title} ${item.area} ${item.category} ${item.description}`
          .toLowerCase()
          .includes(normalizedSearch)
      const matchesCategory = filters.category === 'All' || item.category === filters.category
      const matchesStatus = filters.status === 'All' || item.status === filters.status
      const matchesArea = filters.area === 'All' || item.area === filters.area
      const matchesPriority = filters.priority === 'All' || item.priority === filters.priority

      return matchesSearch && matchesCategory && matchesStatus && matchesArea && matchesPriority
    })

    return [...filtered].sort((a, b) => {
      if (filters.sort === 'Newest') return new Date(b.createdAt) - new Date(a.createdAt)
      if (filters.sort === 'Oldest') return new Date(a.createdAt) - new Date(b.createdAt)
      if (filters.sort === 'Most upvoted') return (b.upvotes || 0) - (a.upvotes || 0)
      return 0
    })
  }, [complaints, filters])

  return (
    <div className="page-shell">
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Public feed</p>
            <h3>Browse complaints</h3>
          </div>
          <span className="tiny-badge">{visibleComplaints.length}</span>
        </div>

        <div className="filter-row">
          <input
            type="search"
            placeholder="Search complaints"
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
          />
          <select value={filters.category} onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}>
            {['All', 'Road', 'Garbage', 'Water', 'Electricity', 'Other'].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
            {['All', 'Pending', 'In Progress', 'Resolved'].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <select value={filters.area} onChange={(event) => setFilters((current) => ({ ...current, area: event.target.value }))}>
            {['All', 'Downtown', 'North Zone', 'South Zone', 'East District', 'West District'].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <select value={filters.priority} onChange={(event) => setFilters((current) => ({ ...current, priority: event.target.value }))}>
            {['All', 'Low', 'Medium', 'High', 'Critical'].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <select value={filters.sort} onChange={(event) => setFilters((current) => ({ ...current, sort: event.target.value }))}>
            {['Newest', 'Oldest', 'Most upvoted'].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="complaint-card-list">
          {visibleComplaints.length === 0 ? (
            <p>No complaints match the current filters.</p>
          ) : (
            visibleComplaints.map((item) => (
              <article className="complaint-card" key={item._id || item.id}>
                <div className="complaint-card-header">
                  <div>
                    <h4>{item.title}</h4>
                    <p>
                      {item.area} • {item.category}
                    </p>
                  </div>
                  <span className={`priority-pill ${String(item.priority || 'Medium').toLowerCase()}`}>
                    {item.priority || 'Medium'}
                  </span>
                </div>

                <p className="complaint-card-description">{item.description}</p>

                <div className="complaint-card-meta">
                  <span className={`status-pill-table ${String(item.status).toLowerCase().replace(/\s+/g, '-')}`}>
                    {item.status}
                  </span>
                  <span>{item.upvotes || 0} upvotes</span>
                </div>

                <div className="complaint-card-actions">
                  <Link to={`/complaints/${item._id || item.id}`} className="secondary-button small-button">
                    View details
                  </Link>
                  {user && user.role === 'citizen' ? (
                    <button type="button" className="primary-button small-button" onClick={() => onVote(item._id || item.id)}>
                      Upvote
                    </button>
                  ) : null}
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
