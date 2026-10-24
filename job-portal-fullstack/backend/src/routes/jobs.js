import { Router } from 'express';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import { protect, allow } from '../middleware/auth.js';
import { isDbConnected } from '../config/db.js';
import { generateSampleJobs } from '../data/seedData.js';

const r = Router();

// Fallback in-memory cache for when MongoDB is connecting or offline
let memoryJobs = generateSampleJobs();

r.get('/', async (req, res, next) => {
  try {
    const { search = '', location = '', type = '', skill = '', minSalary = 0, sort = 'newest', page = 1, limit = 50 } = req.query;
    const p = Math.max(1, Number(page));
    const l = Math.min(150, Math.max(1, Number(limit)));

    if (isDbConnected()) {
      const q = { status: 'open' };
      if (location) q.location = { $regex: location, $options: 'i' };
      if (type) q.type = type;
      if (skill) q.skills = { $regex: skill, $options: 'i' };
      if (minSalary) q.salary = { $gte: Number(minSalary) };
      if (search) {
        q.$or = [
          { title: { $regex: search, $options: 'i' } },
          { company: { $regex: search, $options: 'i' } },
          { skills: { $regex: search, $options: 'i' } }
        ];
      }

      const sortBy = sort === 'salary' ? { salary: -1 } : sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };
      const [items, total] = await Promise.all([
        Job.find(q).populate('employer', 'name').sort(sortBy).skip((p - 1) * l).limit(l),
        Job.countDocuments(q)
      ]);

      if (total > 0) {
        return res.json({ items, total, page: p, pages: Math.ceil(total / l) });
      }
    }

    // Fallback in-memory filter & search
    let filtered = memoryJobs.filter(j => j.status === 'open');
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(j =>
        j.title.toLowerCase().includes(s) ||
        j.company.toLowerCase().includes(s) ||
        j.skills.some(sk => sk.toLowerCase().includes(s))
      );
    }
    if (location) {
      const loc = location.toLowerCase();
      filtered = filtered.filter(j => j.location.toLowerCase().includes(loc));
    }
    if (type) {
      filtered = filtered.filter(j => j.type.toLowerCase() === type.toLowerCase());
    }
    if (minSalary) {
      filtered = filtered.filter(j => j.salary >= Number(minSalary));
    }

    if (sort === 'salary') {
      filtered.sort((a, b) => b.salary - a.salary);
    } else if (sort === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    const total = filtered.length;
    const startIndex = (p - 1) * l;
    const items = filtered.slice(startIndex, startIndex + l);

    res.json({ items, total, page: p, pages: Math.max(1, Math.ceil(total / l)) });
  } catch (e) {
    next(e);
  }
});

r.get('/mine', protect, allow('employer'), async (req, res, next) => {
  try {
    if (isDbConnected()) {
      return res.json(await Job.find({ employer: req.user._id }).sort({ createdAt: -1 }));
    }
    const mine = memoryJobs.filter(j => String(j.employer?._id) === String(req.user._id));
    res.json(mine);
  } catch (e) {
    next(e);
  }
});

r.get('/:id', async (req, res, next) => {
  try {
    if (isDbConnected()) {
      try {
        const j = await Job.findById(req.params.id).populate('employer', 'name');
        if (j) return res.json(j);
      } catch (err) {
        // Not a valid ObjectId, fallback to memoryJobs check
      }
    }
    const found = memoryJobs.find(j => String(j._id) === String(req.params.id));
    if (!found) return res.status(404).json({ message: 'Job not found' });
    res.json(found);
  } catch (e) {
    next(e);
  }
});

r.post('/', protect, allow('employer'), async (req, res, next) => {
  try {
    const { title, company, description, location, type, skills, salary } = req.body;
    if (!title || !company || !description || !location) {
      return res.status(400).json({ message: 'Title, company, description and location are required' });
    }

    if (isDbConnected()) {
      const created = await Job.create({
        title,
        company,
        description,
        location,
        type: type || 'Full-time',
        skills: Array.isArray(skills) ? skills : (skills || '').split(',').map(s => s.trim()).filter(Boolean),
        salary: Number(salary) || 0,
        employer: req.user._id
      });
      return res.status(201).json(created);
    }

    const newJob = {
      _id: `mem-${Date.now()}`,
      title,
      company,
      description,
      location,
      type: type || 'Full-time',
      skills: Array.isArray(skills) ? skills : (skills || '').split(',').map(s => s.trim()).filter(Boolean),
      salary: Number(salary) || 0,
      status: 'open',
      employer: { _id: req.user._id, name: req.user.name },
      createdAt: new Date().toISOString()
    };
    memoryJobs.unshift(newJob);
    res.status(201).json(newJob);
  } catch (e) {
    next(e);
  }
});

r.put('/:id', protect, allow('employer'), async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const j = await Job.findById(req.params.id);
      if (!j) return res.status(404).json({ message: 'Job not found' });
      if (String(j.employer) !== String(req.user._id)) return res.status(403).json({ message: 'You can only edit your own jobs' });
      Object.assign(j, req.body);
      await j.save();
      return res.json(j);
    }
    const idx = memoryJobs.findIndex(j => String(j._id) === String(req.params.id));
    if (idx === -1) return res.status(404).json({ message: 'Job not found' });
    Object.assign(memoryJobs[idx], req.body);
    res.json(memoryJobs[idx]);
  } catch (e) {
    next(e);
  }
});

r.patch('/:id/close', protect, allow('employer'), async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const j = await Job.findById(req.params.id);
      if (!j) return res.status(404).json({ message: 'Job not found' });
      if (String(j.employer) !== String(req.user._id)) return res.status(403).json({ message: 'Not your job' });
      j.status = 'closed';
      await j.save();
      return res.json(j);
    }
    const item = memoryJobs.find(j => String(j._id) === String(req.params.id));
    if (!item) return res.status(404).json({ message: 'Job not found' });
    item.status = 'closed';
    res.json(item);
  } catch (e) {
    next(e);
  }
});

r.delete('/:id', protect, allow('employer'), async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const j = await Job.findById(req.params.id);
      if (!j) return res.status(404).json({ message: 'Job not found' });
      if (String(j.employer) !== String(req.user._id)) return res.status(403).json({ message: 'Not your job' });
      await j.deleteOne();
      await Application.deleteMany({ job: j._id });
      return res.json({ message: 'Job deleted' });
    }
    memoryJobs = memoryJobs.filter(j => String(j._id) !== String(req.params.id));
    res.json({ message: 'Job deleted' });
  } catch (e) {
    next(e);
  }
});

r.post('/:id/apply', protect, allow('candidate'), async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const j = await Job.findById(req.params.id);
      if (!j || j.status !== 'open') return res.status(404).json({ message: 'Open job not found' });
      const a = await Application.create({
        job: j._id,
        candidate: req.user._id,
        resumeUrl: req.body.resumeUrl,
        coverLetter: req.body.coverLetter
      });
      return res.status(201).json(a);
    }
    const j = memoryJobs.find(item => String(item._id) === String(req.params.id));
    if (!j || j.status !== 'open') return res.status(404).json({ message: 'Open job not found' });
    res.status(201).json({
      _id: `app-${Date.now()}`,
      job: j._id,
      candidate: req.user._id,
      status: 'applied',
      createdAt: new Date().toISOString()
    });
  } catch (e) {
    next(e);
  }
});

export default r;
