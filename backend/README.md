# Citizen Complaint Portal - Backend

Express.js + MongoDB backend for the Citizen Complaint Portal with JWT authentication, complaint management, priority scoring, and AI briefings.

## Quick Start

### 1. Setup Environment
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

### 2. MongoDB Setup
- Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a cluster and get the connection string
- Add to `.env`: `MONGODB_URI=mongodb+srv://...`

### 3. Claude API (Optional for AI Briefings)
- Get API key from [Anthropic](https://console.anthropic.com)
- Add to `.env`: `CLAUDE_API_KEY=sk-ant-...`
- Or use a free alternative like Google Gemini or Groq

### 4. Run Server
```bash
npm run dev    # development with auto-reload
npm start      # production
```

Server runs on `http://localhost:5000`

## API Endpoints

### Auth
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Get JWT token

### Complaints
- `GET /api/complaints` - List all complaints (with filters)
- `POST /api/complaints` - Create complaint (citizen only)
- `GET /api/complaints/mine` - My complaints (citizen only)
- `GET /api/complaints/:id` - Complaint details
- `PATCH /api/complaints/:id/upvote` - Upvote complaint
- `PATCH /api/complaints/:id/status` - Update status (officer only)
- `PATCH /api/complaints/:id/feedback` - Submit feedback
- `GET /api/complaints/export` - Download CSV (officer only)
- `GET /api/complaints/check/duplicates` - Check for duplicates

### AI
- `POST /api/ai/officer-summary` - Get AI briefing (officer only)

## Database Schema

### Users
- name, email, password (hashed), role (citizen/officer)

### Complaints
- title, description, category, area, status
- upvotes, upvotedBy[], imageUrl
- createdBy (user ID), assignedTo (officer)
- officerRemark, priority (computed)
- feedbackRating, feedbackComment, feedbackGiven, feedbackPending
- createdAt, updatedAt, resolvedAt

## Features Implemented

✅ User authentication with JWT
✅ Complaint CRUD operations
✅ Role-based access control (citizen/officer)
✅ Priority scoring system (auto-calculated)
✅ Upvoting with duplicate prevention
✅ Complaint status tracking
✅ Feedback/satisfaction ratings
✅ AI-generated officer briefings (Claude API)
✅ CSV export for reports
✅ Duplicate complaint detection

## Deployment

### Frontend (Vercel/Netlify)
```bash
cd ..
npm run build
# Deploy dist folder
```

### Backend (Render/Railway)
1. Push code to GitHub
2. Connect to Render/Railway
3. Set environment variables
4. Deploy

## Development Notes

- JWT expires in 7 days
- Passwords hashed with bcryptjs
- MongoDB Atlas free tier recommended for demos
- CORS enabled for frontend URLs
- Priority auto-calculated on each fetch (no cron needed)
