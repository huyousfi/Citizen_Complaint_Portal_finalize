import express from 'express'
import Complaint from '../models/Complaint.js'
import { requireOfficer } from '../middleware/auth.js'
import { generateOfficerBriefing, computeOfficerStats } from '../utils/ai.js'

const router = express.Router()

/**
 * POST /api/ai/officer-summary
 * Fetches complaint stats and returns an AI-generated briefing via Claude API.
 * Logged-in officer only
 */
router.post('/officer-summary', requireOfficer, async (req, res) => {
  try {
    // Fetch all complaints
    const complaints = await Complaint.find()
      .populate('createdBy', 'name email')
      .lean()

    // Compute stats
    const stats = computeOfficerStats(complaints)

    // Generate AI briefing
    const summary = await generateOfficerBriefing(stats)

    res.json({
      summary,
      stats,
    })
  } catch (error) {
    console.error('AI briefing error:', error)
    res.status(500).json({
      error: error.message || 'Failed to generate AI briefing',
      summary: 'Unable to generate briefing at this moment. Please try again later.',
    })
  }
})

export default router
