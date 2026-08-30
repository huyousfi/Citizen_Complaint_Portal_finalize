import jwt from 'jsonwebtoken'

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret')
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export const requireOfficer = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role !== 'officer') {
      return res.status(403).json({ error: 'Only officers can access this resource' })
    }
    next()
  })
}

export const requireCitizen = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role !== 'citizen') {
      return res.status(403).json({ error: 'Only citizens can access this resource' })
    }
    next()
  })
}

export const requireAuth = verifyToken
