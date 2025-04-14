// This is a minimal server for testing deployment on Render
console.log('Starting minimal test server...');

const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Log environment variables (without sensitive info)
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI set:', !!process.env.MONGO_URI);
console.log('JWT_SECRET set:', !!process.env.JWT_SECRET);

// Validate MongoDB URI format
if (process.env.MONGO_URI) {
  // Basic validation for MongoDB URI format
  const validMongoURI = /^mongodb(\+srv)?:\/\/[^\/]+\/[^\/]+(\?.*)?$/.test(process.env.MONGO_URI);
  if (!validMongoURI) {
    console.error('ERROR: Invalid MongoDB URI format. URI must include hostname, domain name, and database name.');
    console.error('Example format: mongodb+srv://username:password@cluster0.mongodb.net/database_name');
  } else {
    console.log('MongoDB URI format appears valid');
  }
}

// Initialize Express app
const app = express();

// Add middleware
app.use(cors());
app.use(express.json());

// Define User schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (err) {
    throw err;
  }
};

// Define Note schema
const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create models if MongoDB is connected
let User, Note;
if (mongoose.connection.readyState !== 0) {
  User = mongoose.model('User', userSchema);
  Note = mongoose.model('Note', noteSchema);
}

// Auth middleware
const auth = async (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

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
    console.log('Attempting to connect to MongoDB...');
    
    mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(() => {
      console.log('MongoDB connected successfully');
      // Initialize models after successful connection
      User = mongoose.model('User', userSchema);
      Note = mongoose.model('Note', noteSchema);
    })
    .catch(err => {
      console.error('MongoDB connection error:', err);
      console.error('Connection string format issue. Please check your MONGO_URI environment variable.');
      console.error('Make sure it follows the format: mongodb+srv://username:password@hostname/database_name');
      
      // Set up mock data for development/testing
      setupMockData();
    });
  } catch (err) {
    console.error('Error setting up MongoDB connection:', err);
    
    // Set up mock data for development/testing
    setupMockData();
  }
} else {
  console.warn('MONGO_URI not provided - running with mock data');
  setupMockData();
}

// Function to set up mock data when MongoDB is not available
function setupMockData() {
  console.log('Setting up mock data for testing...');
  
  // Mock User model with in-memory storage
  const mockUsers = [];
  User = {
    findOne: async (query) => {
      return mockUsers.find(u => u.email === query.email);
    },
    findById: async (id) => {
      const user = mockUsers.find(u => u._id === id);
      if (!user) return null;
      const { password, ...userWithoutPassword } = user;
      return {
        ...userWithoutPassword,
        select: () => userWithoutPassword
      };
    }
  };
  
  // Add a mock user creation method
  User.prototype = {};
  User.prototype.save = async function() {
    this._id = Date.now().toString();
    mockUsers.push(this);
    return this;
  };
  
  // Create a mock user for testing
  mockUsers.push({
    _id: '123456789',
    name: 'Test User',
    email: 'test@example.com',
    password: '$2a$10$RJKan6UecUcjiaG7cFmDNuKNxgNPfMuKCpxAplrv.6MJqtLvIvnGS', // hashed "password123"
    createdAt: new Date(),
    comparePassword: async (candidatePassword) => {
      return candidatePassword === 'password123';
    }
  });
  
  // Mock Note model with in-memory storage
  const mockNotes = [
    {
      _id: '1',
      title: 'Welcome to Notes App',
      content: 'This is a test note. The app is currently running in mock mode because MongoDB connection failed.',
      user: '123456789',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  Note = {
    find: async (query) => {
      return {
        sort: () => mockNotes.filter(note => note.user === query.user)
      };
    }
  };
  
  // Add a mock note creation method
  Note.prototype = {};
  Note.prototype.save = async function() {
    this._id = Date.now().toString();
    mockNotes.push(this);
    return this;
  };
  
  console.log('Mock data setup complete. You can login with email: test@example.com and password: password123');
}

// Register route
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if MongoDB is connected
    if (!User) {
      return res.status(500).json({ msg: 'Database connection error' });
    }

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ msg: 'Please provide all required fields' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists with this email' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password
    });

    // Save user to DB (password will be hashed via middleware)
    await user.save();

    // Create payload for JWT
    const payload = {
      user: {
        id: user.id
      }
    };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) {
          console.error('JWT signing error:', err);
          return res.status(500).json({ msg: 'Error creating authentication token' });
        }
        res.json({ token });
      }
    );
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ msg: 'Server error during registration' });
  }
});

// Login route
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if MongoDB is connected
    if (!User) {
      return res.status(500).json({ msg: 'Database connection error' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Create payload for JWT
    const payload = {
      user: {
        id: user.id
      }
    };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get user data
app.get('/api/auth/user', auth, async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (!User) {
      return res.status(500).json({ msg: 'Database connection error' });
    }

    // Get user from DB without password
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Notes routes
app.get('/api/notes', auth, async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (!Note) {
      return res.status(500).json({ msg: 'Database connection error' });
    }

    const notes = await Note.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.post('/api/notes', auth, async (req, res) => {
  const { title, content } = req.body;
  
  try {
    // Check if MongoDB is connected
    if (!Note) {
      return res.status(500).json({ msg: 'Database connection error' });
    }

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