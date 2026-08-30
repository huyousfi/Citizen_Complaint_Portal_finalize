import express from 'express'
import Complaint from '../models/Complaint.js'
import User from '../models/User.js'
import { verifyToken, requireOfficer, requireCitizen, requireAuth } from '../middleware/auth.js'
import { addPriorityField, addPriorityToMultiple } from '../utils/priority.js'
import { complaintsToCSV } from '../utils/csv.js'
import upload from '../middleware/upload.js'

const router = express.Router()

/**
 * POST /api/complaints
 * Creates a new complaint, linked to the logged-in citizen.
 * Logged-in citizen
 */
router.post('/', requireCitizen, async (req, res) => {
  try {
    const { title, description, category, area, imageUrl } = req.body

    if (!title || !description || !category || !area) {
      return res.status(400).json({ error: 'Title, description, category, and area are required' })
    }

    const complaint = new Complaint({
      title,
      description,
      category,
      area,
      imageUrl: imageUrl || null,
      createdBy: req.user.id,
      status: 'Pending',
    })

    await complaint.save()
    await complaint.populate('createdBy', 'name email')

    req.app.get('io').emit('new_complaint', {
      type: 'new_complaint',
      complaint: addPriorityField(complaint.toObject ? complaint.toObject() : complaint),
    })

    res.status(201).json({
      message: 'Complaint submitted successfully',
      complaint: addPriorityField(complaint),
    })
  } catch (error) {
    console.error('Create complaint error:', error)
    res.status(500).json({ error: error.message || 'Failed to create complaint' })
  }
})

/**
 * POST /api/complaints/upload
 * Uploads an image file for a complaint.
 * Returns the file URL/path for use in complaint form
 */
router.post('/upload', requireCitizen, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' })
    }

    // Return file path relative to server root
    const imageUrl = `/uploads/${req.file.filename}`

    res.json({
      message: 'Image uploaded successfully',
      imageUrl,
      filename: req.file.filename,
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: error.message || 'Failed to upload image' })
  }
})

/**
 * GET /api/complaints
 * Returns all complaints, optionally filtered.
 * Includes computed priority field.
 * Anyone (public), officers see extra detail
 */
router.get('/', async (req, res) => {
  try {
    const { search, category, status, area, priority } = req.query

    // Build filter
    const filter = {}
    if (category && category !== 'All') filter.category = category
    if (status && status !== 'All') filter.status = status
    if (area && area !== 'All') filter.area = area
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { area: { $regex: search, $options: 'i' } },
      ]
    }

    // Fetch complaints
    let complaints = await Complaint.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .lean()

    // Add priority field
    complaints = addPriorityToMultiple(complaints)

    // Filter by priority if requested
    if (priority && priority !== 'All') {
      complaints = complaints.filter((c) => c.priority === priority)
    }

    // Sort by priority if requested
    const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 }
    complaints.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

    res.json({
      total: complaints.length,
      complaints,
    })
  } catch (error) {
    console.error('Get complaints error:', error)
    res.status(500).json({ error: error.message || 'Failed to fetch complaints' })
  }
})

/**
 * GET /api/complaints/mine
 * Returns only the complaints filed by the currently logged-in citizen.
 * Logged-in citizen
 */
router.get('/mine', requireCitizen, async (req, res) => {
  try {
    const complaints = await Complaint.find({ createdBy: req.user.id })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .lean()

    const withPriority = addPriorityToMultiple(complaints)

    res.json({
      total: withPriority.length,
      complaints: withPriority,
    })
  } catch (error) {
    console.error('Get my complaints error:', error)
    res.status(500).json({ error: error.message || 'Failed to fetch complaints' })
  }
})

/**
 * GET /api/complaints/export
 * Returns filtered complaints as a downloadable .csv file.
 * Logged-in officer only
 */
router.get('/export', requireOfficer, async (req, res) => {
  try {
    const { category, status, area, search } = req.query

    // Build filter
    const filter = {}
    if (category && category !== 'All') filter.category = category
    if (status && status !== 'All') filter.status = status
    if (area && area !== 'All') filter.area = area
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ]
    }

    // Fetch complaints
    let complaints = await Complaint.find(filter)
      .populate('createdBy', 'name email')
      .lean()

    // Add priority field
    complaints = addPriorityToMultiple(complaints)

    // Convert to CSV
    const csv = complaintsToCSV(complaints)

    // Send as downloadable file
    const filename = `complaints_export_${new Date().toISOString().split('T')[0]}.csv`
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.send(csv)
  } catch (error) {
    console.error('Export error:', error)
    res.status(500).json({ error: error.message || 'Failed to export complaints' })
  }
})

/**
 * GET /api/complaints/:id
 * Returns full details of one specific complaint.
 * Anyone (public)
 */
router.get('/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .lean()

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' })
    }

    const withPriority = addPriorityField(complaint)
    res.json(withPriority)
  } catch (error) {
    console.error('Get complaint error:', error)
    res.status(500).json({ error: error.message || 'Failed to fetch complaint' })
  }
})

/**
 * PATCH /api/complaints/:id/upvote
 * Increases the upvote count of a complaint by 1.
 * Logged-in citizen
 */
router.patch('/:id/upvote', requireCitizen, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' })
    }

    // Check if user has already upvoted
    if (complaint.upvotedBy.includes(req.user.id)) {
      return res.status(400).json({ error: 'You have already upvoted this complaint' })
    }

    // Add upvote
    complaint.upvotes += 1
    complaint.upvotedBy.push(req.user.id)
    await complaint.save()

    const withPriority = addPriorityField(complaint)
    res.json({
      message: 'Complaint upvoted successfully',
      complaint: withPriority,
    })
  } catch (error) {
    console.error('Upvote error:', error)
    res.status(500).json({ error: error.message || 'Failed to upvote complaint' })
  }
})

/**
 * PATCH /api/complaints/:id/status
 * Updates a complaint's status and remark.
 * Logged-in officer only
 */
router.patch('/:id/status', requireOfficer, async (req, res) => {
  try {
    const { status, officerRemark } = req.body

    if (!status) {
      return res.status(400).json({ error: 'Status is required' })
    }

    const complaint = await Complaint.findById(req.params.id)

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' })
    }

    complaint.status = status
    if (officerRemark) complaint.officerRemark = officerRemark
    complaint.assignedTo = req.user.id
    complaint.updatedAt = new Date()

    // If resolved, set feedbackPending to true and resolvedAt
    if (status === 'Resolved') {
      complaint.feedbackPending = true
      complaint.resolvedAt = new Date()
    }

    await complaint.save()

    req.app.get('io').emit('status_updated', {
      type: 'status_updated',
      complaintId: complaint._id,
      status,
      officerRemark: complaint.officerRemark,
    })

    const withPriority = addPriorityField(complaint)
    res.json({
      message: 'Complaint status updated successfully',
      complaint: withPriority,
    })
  } catch (error) {
    console.error('Update status error:', error)
    res.status(500).json({ error: error.message || 'Failed to update complaint status' })
  }
})

/**
 * PATCH /api/complaints/:id/feedback
 * Saves a citizen's satisfaction rating after resolution.
 * Logged-in citizen (complaint owner)
 */
router.patch('/:id/feedback', requireCitizen, async (req, res) => {
  try {
    const { rating, comment } = req.body

    const complaint = await Complaint.findById(req.params.id)

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' })
    }

    // Verify ownership
    if (complaint.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You can only rate your own complaints' })
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' })
    }

    complaint.feedbackRating = rating
    complaint.feedbackComment = comment || null
    complaint.feedbackGiven = true
    complaint.feedbackPending = false

    await complaint.save()

    res.json({
      message: 'Feedback submitted successfully',
      complaint: addPriorityField(complaint),
    })
  } catch (error) {
    console.error('Feedback error:', error)
    res.status(500).json({ error: error.message || 'Failed to submit feedback' })
  }
})

/**
 * GET /api/complaints/check/duplicates
 * Check for duplicate complaints in same category and area
 * Used by 5.10 - Duplicate Complaint Detection
 */
router.get('/check/duplicates', async (req, res) => {
  try {
    const { category, area } = req.query

    if (!category || !area) {
      return res.status(400).json({ error: 'Category and area are required' })
    }

    const duplicates = await Complaint.find({
      category,
      area,
      status: { $in: ['Pending', 'In Progress'] },
    })
      .populate('createdBy', 'name email')
      .sort({ upvotes: -1 })
      .lean()

    const withPriority = addPriorityToMultiple(duplicates)

    res.json({
      found: duplicates.length > 0,
      count: duplicates.length,
      duplicates: withPriority,
    })
  } catch (error) {
    console.error('Check duplicates error:', error)
    res.status(500).json({ error: error.message || 'Failed to check for duplicates' })
  }
})

export default router
