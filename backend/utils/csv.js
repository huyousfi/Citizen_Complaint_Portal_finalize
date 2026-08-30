import { Parser } from 'json2csv'

/**
 * Convert complaints array to CSV string
 */
export const complaintsToCSV = (complaints) => {
  const fields = [
    'id',
    'title',
    'category',
    'area',
    'status',
    'priority',
    'upvotes',
    'filedBy',
    'filedOn',
    'lastUpdated',
    'officerRemark',
  ]

  const data = complaints.map((c) => ({
    id: c._id.toString(),
    title: c.title,
    category: c.category,
    area: c.area,
    status: c.status,
    priority: c.priority || 'Low',
    upvotes: c.upvotes,
    filedBy: c.createdBy?.name || 'Unknown',
    filedOn: new Date(c.createdAt).toISOString().split('T')[0],
    lastUpdated: new Date(c.updatedAt).toISOString().split('T')[0],
    officerRemark: c.officerRemark || '-',
  }))

  try {
    const parser = new Parser({ fields })
    return parser.parse(data)
  } catch (error) {
    console.error('CSV conversion error:', error)
    throw error
  }
}
