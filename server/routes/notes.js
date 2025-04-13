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
  try {
    console.log('PUT request received for note ID:', req.params.id);
    console.log('Request body:', req.body);
    
    // Find the note by ID
    let note = await Note.findById(req.params.id);
    
    // Check if note exists
    if (!note) {
      console.log('Note not found with ID:', req.params.id);
      return res.status(404).json({ msg: 'Note not found' });
    }
    
    // Make sure user owns the note
    if (note.user.toString() !== req.user.id) {
      console.log('User not authorized. Note user:', note.user, 'Request user:', req.user.id);
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    // Update note fields directly
    if (req.body.title !== undefined) note.title = req.body.title;
    if (req.body.content !== undefined) note.content = req.body.content;
    note.updatedAt = Date.now();
    
    // Save the updated note
    await note.save();
    
    console.log('Note updated successfully:', note);
    res.json(note);
  } catch (err) {
    console.error('Server error updating note:', err);
    res.status(500).json({ msg: 'Server error updating note', error: err.message });
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

// @route   POST api/notes/test-update/:id
// @desc    Test route for updating notes (for debugging)
// @access  Private
router.post('/test-update/:id', auth, async (req, res) => {
  try {
    console.log('TEST UPDATE route called for note ID:', req.params.id);
    console.log('Request body:', req.body);
    
    // Find the note directly
    let note = await Note.findById(req.params.id);
    
    if (!note) {
      console.log('TEST UPDATE: Note not found');
      return res.status(404).json({ error: 'Note not found' });
    }
    
    // Make sure user owns the note
    if (note.user.toString() !== req.user.id) {
      console.log('TEST UPDATE: User not authorized');
      return res.status(401).json({ error: 'Not authorized' });
    }
    
    // Log current state
    console.log('TEST UPDATE: Current note state:', note);
    
    // Perform direct update
    note.title = req.body.title || note.title;
    note.content = req.body.content || note.content;
    note.updatedAt = Date.now();
    
    // Save the note
    await note.save();
    
    console.log('TEST UPDATE: Note after update:', note);
    
    // Return success
    res.json({
      success: true, 
      message: 'Note updated in test route',
      note
    });
  } catch (err) {
    console.error('TEST UPDATE ERROR:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 