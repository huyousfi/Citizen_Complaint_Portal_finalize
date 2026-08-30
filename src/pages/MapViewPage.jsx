import { useMemo, useState } from 'react'

// Area coordinates used for a lightweight map layout without external map dependencies.
const AREA_COORDINATES = {
  Downtown: { x: 58, y: 42 },
  'North Zone': { x: 72, y: 22 },
  'South Zone': { x: 46, y: 68 },
  'East District': { x: 78, y: 52 },
  'West District': { x: 36, y: 34 },
}

const PRIORITY_COLORS = {
  Low: '#4caf50',
  Medium: '#ffc107',
  High: '#ff9800',
  Critical: '#f44336',
}

export default function MapViewPage({ complaints }) {
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [filters, setFilters] = useState({
    category: 'All',
    status: 'All',
    area: 'All',
  })

  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      if (filters.category !== 'All' && c.category !== filters.category) return false
      if (filters.status !== 'All' && c.status !== filters.status) return false
      if (filters.area !== 'All' && c.area !== filters.area) return false
      return true
    })
  }, [complaints, filters])

  const getMarkerColor = (priority) => PRIORITY_COLORS[priority] || '#1e4a6e'

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <section className="map-view-page">
      <div className="map-sidebar">
        <div className="panel filter-panel">
          <h4>Filters</h4>
          <div className="filter-controls">
            <label>
              Category
              <select value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)}>
                <option value="All">All Categories</option>
                {['Road', 'Garbage', 'Water', 'Electricity', 'Other'].map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </label>

            <label>
              Status
              <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </label>

            <label>
              Area
              <select value={filters.area} onChange={(e) => handleFilterChange('area', e.target.value)}>
                <option value="All">All Areas</option>
                {['Downtown', 'North Zone', 'South Zone', 'East District', 'West District'].map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="legend">
            <h5>Priority Legend</h5>
            {Object.entries(PRIORITY_COLORS).map(([priority, color]) => (
              <div key={priority} className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: color }} />
                <span>{priority}</span>
              </div>
            ))}
          </div>

          <div className="map-stats">
            <strong>{filteredComplaints.length}</strong>
            <span>Complaints shown</span>
          </div>
        </div>
      </div>

      <div className="map-container">
        <div className="city-map">
          <div className="map-grid-overlay" />
          {filteredComplaints.map((complaint) => {
            const coords = AREA_COORDINATES[complaint.area] || AREA_COORDINATES.Downtown
            return (
              <button
                key={complaint._id || complaint.id}
                type="button"
                className="map-marker"
                style={{
                  left: `${coords.x}%`,
                  top: `${coords.y}%`,
                  backgroundColor: getMarkerColor(complaint.priority),
                }}
                onClick={() => setSelectedComplaint(complaint)}
                aria-label={`Open complaint ${complaint.title}`}
              >
                <span>{complaint.upvotes || 0}</span>
              </button>
            )
          })}

          {selectedComplaint && (
            <div className="complaint-popup">
              <h6>{selectedComplaint.title}</h6>
              <p><strong>Area:</strong> {selectedComplaint.area}</p>
              <p><strong>Category:</strong> {selectedComplaint.category}</p>
              <p>
                <strong>Status:</strong>{' '}
                <span className={`status-badge ${selectedComplaint.status.replace(' ', '-').toLowerCase()}`}>
                  {selectedComplaint.status}
                </span>
              </p>
              <p>
                <strong>Priority:</strong>{' '}
                <span style={{ color: getMarkerColor(selectedComplaint.priority), fontWeight: 'bold' }}>
                  {selectedComplaint.priority}
                </span>
              </p>
              <p><strong>Upvotes:</strong> {selectedComplaint.upvotes || 0}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
