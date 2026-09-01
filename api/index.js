import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import path from 'path'
import { fileURLToPath } from 'url'
import authRoutes from '../backend/routes/auth.js'
import complaintRoutes from '../backend/routes/complaints.js'
import aiRoutes from '../backend/routes/ai.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootEnvPath = path.resolve(__dirname, '../.env')

// Load environment variables from root .env file
dotenv.config({ path: rootEnvPath })

const app = express()

app.use(cors({
  origin: '*',
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Normalize Vercel rewritten URL
app.use((req, res, next) => {
  // Vercel sets x-matched-path header for rewrites
  if (req.headers['x-matched-path']) {
    req.url = req.headers['x-matched-path']
  }
  // Fallback: check for path in query parameters
  else if (req.query && req.query.path) {
    const p = Array.isArray(req.query.path) ? req.query.path.join('/') : req.query.path
    req.url = p.startsWith('/') ? p : '/' + p
  }
  // Fallback: check for catch-all parameter
  else if (req.query && req.query['0']) {
    const subpath = req.query['0'].startsWith('/') ? req.query['0'] : '/' + req.query['0']
    req.url = '/api' + subpath
  }
  
  next()
})

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return

  const mongoUri = process.env.MONGODB_URI

  if (!mongoUri) {
    console.error('❌ MONGODB_URI is not set in environment variables')
    throw new Error('MongoDB connection string not configured')
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

// Flexible route mounting
app.use(['/api/auth', '/auth'], authRoutes)
app.use(['/api/complaints', '/complaints'], complaintRoutes)
app.use(['/api/ai', '/ai'], aiRoutes)

// Health check
app.get(['/api/health', '/health'], (req, res) => {
  res.json({ status: 'Server is running on Vercel Serverless', timestamp: new Date() })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'API route not found',
    requestedUrl: req.url,
    originalUrl: req.originalUrl,
  })
})

// Error handler
app.use((err, req, res, next) => {
  console.error('API Error:', err.message)
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  })
})

export default app
