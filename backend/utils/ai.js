import { Anthropic } from '@anthropic-ai/sdk'

const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY
const client = apiKey ? new Anthropic({ apiKey }) : null

const buildFallbackSummary = (stats) => {
  const categoryText = stats.topCategoryCount ? `${stats.topCategory} with ${stats.topCategoryCount} complaints` : 'no major category trend'
  const hotspotText = stats.hotspotArea && stats.hotspotArea !== 'None' ? `${stats.hotspotArea}` : 'no hotspot area'

  return `Today: ${stats.total} complaints are active in the system, with ${stats.newToday} new today and ${stats.overdue} overdue by more than 3 days. The most common issue is ${categoryText}, while ${hotspotText} is the main hotspot. ${stats.resolvedThisWeek} complaints were resolved this week, and ${stats.critical} are in critical priority.`
}

/**
 * Generate AI briefing for officer dashboard
 * Uses Anthropic Claude API to create a natural language summary
 */
export const generateOfficerBriefing = async (stats) => {
  const prompt = `You are a concise government operations assistant. Given these complaint statistics, generate a brief 3-5 sentence summary for an officer. Make it plain English, actionable, and focused on the most critical information.

Statistics:
- Total complaints: ${stats.total}
- New complaints today: ${stats.newToday}
- Overdue complaints (>3 days): ${stats.overdue}
- Resolved this week: ${stats.resolvedThisWeek}
- Top category: ${stats.topCategory} (${stats.topCategoryCount} complaints)
- Critical priority complaints: ${stats.critical}
- Hotspot area: ${stats.hotspotArea} (${stats.hotspotCount} complaints)

Generate the briefing now:`

  try {
    if (!client) {
      return buildFallbackSummary(stats)
    }

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const summary = message.content[0].type === 'text' ? message.content[0].text : ''
    return summary || buildFallbackSummary(stats)
  } catch (error) {
    console.error('AI briefing error:', error.message)
    return buildFallbackSummary(stats)
  }
}

/**
 * Compute statistics for AI briefing
 */
export const computeOfficerStats = (complaints) => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000)

  const stats = {
    total: complaints.length,
    newToday: complaints.filter((c) => new Date(c.createdAt) >= today).length,
    overdue: complaints.filter(
      (c) => c.status !== 'Resolved' && new Date(c.createdAt) <= threeDaysAgo
    ).length,
    resolvedThisWeek: complaints.filter(
      (c) => c.status === 'Resolved' && new Date(c.resolvedAt || c.updatedAt) >= weekAgo
    ).length,
    critical: complaints.filter((c) => c.priority === 'Critical' || (c.upvotes * 2 + 7) > 30).length,
  }

  // Top category
  const categoryCount = {}
  complaints.forEach((c) => {
    categoryCount[c.category] = (categoryCount[c.category] || 0) + 1
  })
  const topCategoryEntry = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]
  stats.topCategory = topCategoryEntry ? topCategoryEntry[0] : 'None'
  stats.topCategoryCount = topCategoryEntry ? topCategoryEntry[1] : 0

  // Hotspot area
  const areaCount = {}
  complaints.forEach((c) => {
    areaCount[c.area] = (areaCount[c.area] || 0) + 1
  })
  const hotspotEntry = Object.entries(areaCount).sort((a, b) => b[1] - a[1])[0]
  stats.hotspotArea = hotspotEntry ? hotspotEntry[0] : 'None'
  stats.hotspotCount = hotspotEntry ? hotspotEntry[1] : 0

  return stats
}
