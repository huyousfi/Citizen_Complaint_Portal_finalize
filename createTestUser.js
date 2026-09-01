import mongoose from 'mongoose'
import bcryptjs from 'bcryptjs'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '.env') })

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true, trim: true },
  password: String,
  role: { type: String, enum: ['citizen', 'officer'], default: 'citizen' },
  createdAt: { type: Date, default: Date.now },
})

userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  return obj
}

const User = mongoose.model('User', userSchema)

async function createTestUser() {
  try {
    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not set in .env')
      process.exit(1)
    }

    console.log('Connecting to MongoDB...')
    await mongoose.connect(mongoUri)
    console.log('✅ Connected to MongoDB')

    // Check if user exists
    const existingUser = await User.findOne({ email: 'hussain@gmail.com' })
    if (existingUser) {
      console.log('⚠️ User already exists:', existingUser.toJSON())
      await mongoose.disconnect()
      process.exit(0)
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash('hus12345', 10)

    // Create user
    const user = new User({
      name: 'hussain',
      email: 'hussain@gmail.com',
      password: hashedPassword,
      role: 'citizen',
    })

    await user.save()
    console.log('✅ Test user created successfully!')
    console.log('User:', user.toJSON())

    await mongoose.disconnect()
    console.log('✅ Disconnected from MongoDB')
  } catch (error) {
    console.error('❌ Error creating user:', error.message)
    process.exit(1)
  }
}

createTestUser()
