import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { isDbConnected } from '../config/db.js';

const r = Router();
const tokenFor = u => jwt.sign({ id: u._id, role: u.role, name: u.name, email: u.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Fallback in-memory users list when DB is offline
const memoryUsers = [];

r.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role = 'candidate' } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
    if (!['candidate', 'employer'].includes(role)) return res.status(400).json({ message: 'Invalid role' });

    if (isDbConnected()) {
      const existing = await User.findOne({ email });
      if (existing) return res.status(409).json({ message: 'An account with this email already exists' });
      const user = await User.create({ name, email, password, role });
      return res.status(201).json({
        token: tokenFor(user),
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
      });
    }

    // In-memory fallback
    const normEmail = email.toLowerCase().trim();
    if (memoryUsers.find(u => u.email === normEmail)) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }
    const hash = await bcrypt.hash(password, 10);
    const newUser = {
      _id: `user-${Date.now()}`,
      name: name.trim(),
      email: normEmail,
      password: hash,
      role
    };
    memoryUsers.push(newUser);
    res.status(201).json({
      token: tokenFor(newUser),
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role }
    });
  } catch (e) {
    next(e);
  }
});

r.post('/login', async (req, res, next) => {
  try {
    const { email = '', password = '' } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    if (isDbConnected()) {
      const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: 'Incorrect email or password' });
      }
      return res.json({
        token: tokenFor(user),
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
      });
    }

    const normEmail = email.toLowerCase().trim();
    const user = memoryUsers.find(u => u.email === normEmail);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Incorrect email or password' });
    }

    res.json({
      token: tokenFor(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (e) {
    next(e);
  }
});

r.get('/me', protect, (req, res) => res.json({ user: req.user }));

export default r;
