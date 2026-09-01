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

const corsOrigin = process.env.FRONTEND_URL || 'http://localhost:5173'
console.log('CORS Origin:', corsOrigin)

app.use(cors({
  origin: corsOrigin,
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Normalize Vercel rewritten URL and strip /api prefix
app.use((req, res, next) => {
  // On Vercel, the request path might include /api prefix that needs to be stripped
  if (req.url.startsWith('/api/')) {
    req.url = req.url.slice(4) // Remove '/api' prefix
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
