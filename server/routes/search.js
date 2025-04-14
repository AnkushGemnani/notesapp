const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Note = require('../models/Note');

// @route   GET api/search/notes
// @desc    Search notes by title or content
// @access  Private
router.get('/notes', auth, async (req, res) => {
  const { query } = req.query;
  
  try {
    if (!query) {
      return res.status(400).json({ msg: 'Search query is required' });
    }
    
    const notes = await Note.find({
      user: req.user.id,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 });
    
    res.json(notes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 