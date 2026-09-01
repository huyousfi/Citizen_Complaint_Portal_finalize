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

const corsOrigin = process.env.FRONTEND_URL || ['http://localhost:5173', 'http://127.0.0.1:5173']
console.log('CORS Origin:', corsOrigin)

app.use(cors({
  origin: corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Request logging and debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  next()
})

// Normalize paths - Vercel might send requests with or without /api prefix
app.use((req, res, next) => {
  // If URL starts with /api/, remove it (Vercel routes /api/X to this function as /X)
  if (req.url.startsWith('/api/')) {
    req.url = req.url.slice(4)
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
    console.error('❌ Database connection error:', err.message)
    res.status(503).json({
      error: 'Database connection failed',
      message: err.message,
    })
  }
})

// Mount routes - on Vercel, requests come without /api prefix
app.use('/auth', authRoutes)
app.use('/complaints', complaintRoutes)
app.use('/ai', aiRoutes)

// Health check
app.get(['/api/health', '/health'], (req, res) => {
  res.json({ status: 'Server is running on Vercel Serverless', timestamp: new Date() })
})

// 404 handler
app.use((req, res) => {
  console.log(`[404] No route found for ${req.method} ${req.url}`)
  console.log('Available routes: /auth, /complaints, /ai, /health')
  res.status(404).json({
    error: 'API route not found',
    message: `No handler for ${req.method} ${req.url}`,
    availableRoutes: ['/auth', '/complaints', '/ai', '/health'],
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
