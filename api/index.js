import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import authRoutes from '../backend/routes/auth.js'
import complaintRoutes from '../backend/routes/complaints.js'
import aiRoutes from '../backend/routes/ai.js'

dotenv.config()

const app = express()

app.use(cors({
  origin: '*',
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return

  const mongoUri = process.env.MONGODB_URI
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not defined in environment variables')
  }

  await mongoose.connect(mongoUri)
}

app.use(async (req, res, next) => {
  try {
    await connectDB()
    next()
  } catch (err) {
    console.error('Serverless database connection error:', err)
    next(err)
  }
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/complaints', complaintRoutes)
app.use('/api/ai', aiRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running on Vercel Serverless', timestamp: new Date() })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'API route not found' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error('API Error:', err.message)
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  })
})

export default app
