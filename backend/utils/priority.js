/**
 * Calculate priority score for a complaint
 * Formula: Score = upvotes × 2 + daysSinceCreated
 * Score < 5 → Low
 * Score 5–15 → Medium
 * Score 16–30 → High
 * Score > 30 → Critical
 */
export const calculatePriority = (complaint) => {
  const createdDate = new Date(complaint.createdAt)
  const now = new Date()
  const daysSinceCreated = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24))

  const score = complaint.upvotes * 2 + daysSinceCreated

  let priority = 'Low'
  if (score >= 30) {
    priority = 'Critical'
  } else if (score >= 16) {
    priority = 'High'
  } else if (score >= 5) {
    priority = 'Medium'
  }

  return { priority, score }
}

/**
 * Add priority field to a complaint or array of complaints
 */
export const addPriorityField = (complaint) => {
  const { priority, score } = calculatePriority(complaint)
  return {
    ...complaint.toObject ? complaint.toObject() : complaint,
    priority,
    priorityScore: score,
  }
}

export const addPriorityToMultiple = (complaints) => {
  return complaints.map((c) => addPriorityField(c))
}
