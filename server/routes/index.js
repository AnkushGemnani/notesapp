const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const notesRoutes = require('./notes');
const searchRoutes = require('./search');

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Use search routes first (these must come before notes routes)
router.use('/search', searchRoutes);

// Use auth routes
router.use('/auth', authRoutes);

// Use notes routes
router.use('/notes', notesRoutes);

module.exports = router; 