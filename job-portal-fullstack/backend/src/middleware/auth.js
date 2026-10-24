import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isDbConnected } from '../config/db.js';

export async function protect(req, res, next) {
  try {
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null;
    if (!token) return res.status(401).json({ message: 'Authentication required' });

    const data = jwt.verify(token, process.env.JWT_SECRET);
    if (isDbConnected()) {
      try {
        const dbUser = await User.findById(data.id).select('-password');
        if (dbUser) {
          req.user = dbUser;
          return next();
        }
      } catch (err) {
        // Fallback to token payload
      }
    }

    req.user = {
      _id: data.id,
      name: data.name || 'User',
      email: data.email || 'user@example.com',
      role: data.role || 'candidate'
    };
    next();
  } catch (e) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export const allow = (...roles) => (req, res, next) =>
  roles.includes(req.user?.role) ? next() : res.status(403).json({ message: 'Not permitted' });
