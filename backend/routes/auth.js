import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const router = express.Router()

/**
 * POST /api/auth/signup
 * Creates a new user account
 * Anyone (public)
 */
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' })
    }

    // Public registrations are always citizens only
    const user = new User({
      name,
      email,
      password,
      role: 'citizen',
    })

    await user.save()

    res.status(201).json({
      message: 'User created successfully. Please log in.',
      user: user.toJSON(),
    })
  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({ error: error.message || 'Signup failed' })
  }
})

/**
 * POST /api/auth/login
 * Authenticates user and returns JWT token
 * Anyone (public)
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    )

    res.json({
      message: 'Login successful',
      token,
      user: user.toJSON(),
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: error.message || 'Login failed' })
  }
})

export default router
