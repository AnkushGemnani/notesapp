// This is a minimal server for testing deployment on Render
console.log('Starting minimal test server...');

const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Log environment variables (without sensitive info)
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI set:', !!process.env.MONGO_URI);
console.log('JWT_SECRET set:', !!process.env.JWT_SECRET);

// Initialize Express app
const app = express();

// Add middleware
app.use(cors());
app.use(express.json());

// Basic route for testing
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Test server is running', 
    status: 'healthy',
    env: process.env.NODE_ENV,
    mongoConnected: mongoose.connection.readyState === 1,
  });
});

// Optional MongoDB connection
if (process.env.MONGO_URI) {
  try {
    mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => {
      console.error('MongoDB connection error:', err);
      // Continue running the app even if MongoDB fails
    });
  } catch (err) {
    console.error('Error setting up MongoDB connection:', err);
  }
}

// Add a simple notes route
app.get('/api/notes', (req, res) => {
  res.json([
    { _id: '1', title: 'Test Note 1', content: 'This is a test note', createdAt: new Date() },
    { _id: '2', title: 'Test Note 2', content: 'This is another test note', createdAt: new Date() }
  ]);
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, 'client/build')));

  // Any route that doesn't match API will be redirected to index.html
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client/build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Port configuration
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}); 