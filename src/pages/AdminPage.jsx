export default function AdminPage({ complaints, onStatusUpdate }) {
  return (
    <section className="panel admin-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Admin tools</p>
          <h3>Operations queue</h3>
        </div>
        <span className="tiny-badge">{complaints.length} active</span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Resident</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.fullName}</td>
                <td>{item.category}</td>
                <td><span className={`priority-pill ${item.priority.toLowerCase()}`}>{item.priority}</span></td>
                <td><span className={`status-pill-table ${item.status.toLowerCase().replace(/\s+/g, '-')}`}>{item.status}</span></td>
                <td>
                  <select className="mini-select" value={item.status} onChange={(event) => onStatusUpdate(item.id, event.target.value)}>
                    <option>Pending</option>
                    <option>Assigned</option>
                    <option>In Review</option>
                    <option>Resolved</option>
                    <option>Escalated</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
