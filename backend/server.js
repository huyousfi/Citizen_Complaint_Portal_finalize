import http from 'http'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import path from 'path'
import { fileURLToPath } from 'url'
import { Server } from 'socket.io'
import { MongoMemoryServer } from 'mongodb-memory-server'
import authRoutes from './routes/auth.js'
import complaintRoutes from './routes/complaints.js'
import aiRoutes from './routes/ai.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootEnvPath = path.resolve(__dirname, '../.env')

dotenv.config({ path: rootEnvPath })

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
  },
})
const PORT = Number(process.env.PORT) || 5001

app.set('io', io)

app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

const startDatabase = async () => {
  let mongoUri = process.env.MONGODB_URI

  const connectWithFallback = async () => {
    if (!mongoUri) {
      const memoryServer = await MongoMemoryServer.create()
      mongoUri = memoryServer.getUri()
      console.log('✓ Using in-memory MongoDB for local development')
      await mongoose.connect(mongoUri)
      return
    }

    try {
      await mongoose.connect(mongoUri)
      console.log('✓ MongoDB connected using configured URI')
    } catch (primaryError) {
      console.warn('⚠️ Primary MongoDB connection failed. Falling back to in-memory MongoDB for local development.')
      console.warn(primaryError.message)

      const memoryServer = await MongoMemoryServer.create()
      const fallbackUri = memoryServer.getUri()
      await mongoose.connect(fallbackUri)
      console.log('✓ MongoDB connected using in-memory fallback')
    }
  }

  await connectWithFallback()
}

startDatabase().catch((err) => {
  console.error('✗ MongoDB connection error:', err.message)
  process.exit(1)
})

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id)

  socket.on('join-officer-room', () => {
    socket.join('officers')
  })

  socket.on('join-citizen-room', () => {
    socket.join('citizens')
  })

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id)
  })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/complaints', complaintRoutes)
app.use('/api/ai', aiRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message)
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  })
})

server.listen(PORT, () => {
  console.log(`\n🚀 Citizen Complaint Portal API`)
  console.log(`📡 Server running on http://localhost:${PORT}`)
  console.log(`📌 API Base: http://localhost:${PORT}/api\n`)
})
