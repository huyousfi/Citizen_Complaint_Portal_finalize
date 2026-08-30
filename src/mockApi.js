export const sampleComplaints = [
  {
    _id: 'CMP-2048',
    id: 'CMP-2048',
    title: 'Broken streetlight near Main Market',
    category: 'Electricity',
    area: 'Sector 5',
    description: 'Several streetlights are not working near the market entrance, creating visibility and safety concerns after sunset.',
    status: 'In Progress',
    priority: 'High',
    upvotes: 12,
    createdAt: '2026-08-30T08:15:00.000Z',
    updatedAt: '2026-08-30T09:05:00.000Z',
  },
  {
    _id: 'CMP-2043',
    id: 'CMP-2043',
    title: 'Garbage collection delay in Block B',
    category: 'Garbage',
    area: 'Block B',
    description: 'Bins have not been collected for several days and garbage is spilling onto the road near the housing blocks.',
    status: 'Pending',
    priority: 'Medium',
    upvotes: 8,
    createdAt: '2026-08-29T16:40:00.000Z',
    updatedAt: '2026-08-30T07:35:00.000Z',
  },
  {
    _id: 'CMP-2036',
    id: 'CMP-2036',
    title: 'Damaged road near school gate',
    category: 'Road',
    area: 'Central Area',
    description: 'A large pothole near the school gate is damaging vehicles and creating risk for pedestrians at peak hours.',
    status: 'Resolved',
    priority: 'High',
    upvotes: 21,
    createdAt: '2026-08-27T12:10:00.000Z',
    updatedAt: '2026-08-28T10:20:00.000Z',
  },
  {
    _id: 'CMP-2029',
    id: 'CMP-2029',
    title: 'Water supply interruption in Block 12',
    category: 'Water',
    area: 'North Zone',
    description: 'Residents in the block have had little to no water pressure for more than 48 hours and are struggling to meet basic needs.',
    status: 'Pending',
    priority: 'Critical',
    upvotes: 26,
    createdAt: '2026-08-26T09:00:00.000Z',
    updatedAt: '2026-08-29T14:05:00.000Z',
  },
]

const complaints = sampleComplaints

const users = [
  {
    id: 'admin-1',
    name: 'Ruth Thompson',
    email: 'admin@civicpulse.gov',
    password: 'Admin@123',
    role: 'admin',
  },
  {
    id: 'citizen-1',
    name: 'Olivia Carter',
    email: 'citizen@civicpulse.gov',
    password: 'Citizen@123',
    role: 'citizen',
  },
]

export const loginUser = async ({ email, password }) => {
  await new Promise((resolve) => setTimeout(resolve, 400))

  const user = users.find(
    (entry) => entry.email.toLowerCase() === email.toLowerCase() && entry.password === password,
  )

  if (!user) {
    throw new Error('We could not find a matching account. Please check your email and password.')
  }

  return { ...user }
}

export const getComplaints = async (filters = {}) => {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const { status, category, priority, search } = filters

  return complaints.filter((item) => {
    const matchesStatus = status === 'All' || item.status === status
    const matchesCategory = category === 'All' || item.category === category
    const matchesPriority = priority === 'All' || item.priority === priority
    const haystack = `${item.title} ${item.description} ${item.location} ${item.fullName}`.toLowerCase()
    const matchesSearch = !search || haystack.includes(search.toLowerCase())

    return matchesStatus && matchesCategory && matchesPriority && matchesSearch
  })
}

export const submitComplaint = async (payload) => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const newComplaint = {
    ...payload,
    id: `CMP-${Math.floor(1000 + Math.random() * 9000)}`,
    status: 'Pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  complaints.unshift(newComplaint)
  return newComplaint
}

export const updateComplaintStatus = async (id, status) => {
  await new Promise((resolve) => setTimeout(resolve, 250))

  const found = complaints.find((item) => item.id === id)
  if (!found) return null

  found.status = status
  found.updatedAt = new Date().toISOString()
  return found
}
