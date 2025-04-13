const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Note = require('../models/Note');

// @route   GET api/notes
// @desc    Get all notes for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/notes/:id
// @desc    Get a specific note
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    
    // Check if note exists
    if (!note) {
      return res.status(404).json({ msg: 'Note not found' });
    }
    
    // Make sure user owns the note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    res.json(note);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Note not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/notes
// @desc    Create a note
// @access  Private
router.post('/', auth, async (req, res) => {
  const { title, content } = req.body;
  
  try {
    const newNote = new Note({
      title,
      content,
      user: req.user.id
    });
    
    const note = await newNote.save();
    res.json(note);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/notes/:id
// @desc    Update a note
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { title, content } = req.body;
  
  // Build note object
  const noteFields = {};
  if (title) noteFields.title = title;
  if (content) noteFields.content = content;
  noteFields.updatedAt = Date.now();
  
  try {
    let note = await Note.findById(req.params.id);
    
    // Check if note exists
    if (!note) {
      return res.status(404).json({ msg: 'Note not found' });
    }
    
    // Make sure user owns the note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    // Update note
    note = await Note.findByIdAndUpdate(
      req.params.id,
      { $set: noteFields },
      { new: true }
    );
    
    res.json(note);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Note not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/notes/:id
// @desc    Delete a note
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    
    // Check if note exists
    if (!note) {
      return res.status(404).json({ msg: 'Note not found' });
    }
    
    // Make sure user owns the note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    // Delete note
    await note.deleteOne();
    
    res.json({ msg: 'Note removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Note not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/notes/search
// @desc    Search notes by title or content
// @access  Private
router.get('/search', auth, async (req, res) => {
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