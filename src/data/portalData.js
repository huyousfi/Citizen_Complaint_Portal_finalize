export const stats = [
  { label: 'Open cases', value: '1,284', trend: '+12.4%', tone: 'emerald' },
  { label: 'Resolved today', value: '328', trend: '+8.1%', tone: 'blue' },
  { label: 'Avg. response time', value: '2.4h', trend: '-18 min', tone: 'amber' },
  { label: 'Satisfaction score', value: '94%', trend: '+3.2%', tone: 'violet' },
  { label: 'Urgent cases', value: '28', trend: 'Priority watch', tone: 'rose' },
]

export const categories = [
  { name: 'Roads & Traffic', count: '304', icon: '🛣️' },
  { name: 'Water Supply', count: '216', icon: '💧' },
  { name: 'Public Safety', count: '189', icon: '🚨' },
  { name: 'Waste Management', count: '162', icon: '🗑️' },
]

export const statusOptions = ['All', 'Pending', 'Assigned', 'In Review', 'Resolved', 'Escalated']
export const categoryOptions = ['All', 'Roads & Traffic', 'Water Supply', 'Public Safety', 'Waste Management']
export const priorityOptions = ['All', 'Low', 'Medium', 'High', 'Critical']

export const defaultFilters = {
  status: 'All',
  category: 'All',
  priority: 'All',
  search: '',
}

export const defaultForm = {
  fullName: '',
  email: '',
  title: '',
  category: 'Roads & Traffic',
  location: '',
  priority: 'Medium',
  description: '',
}
