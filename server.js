// This is a minimal server for testing deployment on Render
console.log('Starting minimal test server...');

const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');

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
  
  // Create a mock user for testing
  const testUser = {
    _id: '123456789',
    name: 'Test User',
    email: 'test@example.com',
    password: '$2a$10$RJKan6UecUcjiaG7cFmDNuKNxgNPfMuKCpxAplrv.6MJqtLvIvnGS', // hashed "password123"
    createdAt: new Date(),
    comparePassword: async (candidatePassword) => {
      // For simplicity, directly compare with 'password123'
      return candidatePassword === 'password123';
    }
  };
  
  mockUsers.push(testUser);
  
  // Define the User mock model
  User = {
    findOne: async (query) => {
      console.log('Mock findOne query:', query);
      const user = mockUsers.find(u => u.email === query.email);
      console.log('Mock user found:', user ? 'Yes' : 'No');
      return user;
    },
    findById: async (id) => {
      console.log('Mock findById:', id);
      const user = mockUsers.find(u => u._id === id);
      
      if (!user) {
        console.log('No user found with ID:', id);
        return null;
      }
      
      console.log('Mock user found by ID');
      
      // Create a user object with select method
      const userObj = { ...user };
      
      // Add a select method that returns the user without password
      userObj.select = () => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      };
      
      return userObj;
    }
  };
  
  // Mock User prototype and constructor
  User.prototype = {};
  User.prototype.save = async function() {
    console.log('Mock saving user:', this);
    this._id = Date.now().toString();
    mockUsers.push(this);
    return this;
  };
  
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
      console.log('Mock notes query:', query);
      const filteredNotes = mockNotes.filter(note => note.user === query.user);
      console.log(`Found ${filteredNotes.length} mock notes`);
      
      // Return an object with sort method
      return {
        sort: () => filteredNotes
      };
    },
    findById: async (id) => {
      console.log('Mock findById for note:', id);
      return mockNotes.find(note => note._id === id);
    }
  };
  
  // Add a mock note creation method
  Note.prototype = {};
  Note.prototype.save = async function() {
    console.log('Mock saving note:', this);
    if (!this._id) {
      this._id = Date.now().toString();
    }
    mockNotes.push(this);
    return this;
  };
  
  // Debug info for testing
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
  console.log('Login attempt with:', { email: req.body.email, passwordProvided: !!req.body.password });
  
  const { email, password } = req.body;

  try {
    // Check if required fields are provided
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ msg: 'Please provide email and password' });
    }
    
    // Check if MongoDB is connected
    if (!User) {
      console.log('User model not available');
      return res.status(500).json({ msg: 'Database connection error' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('User not found with email:', email);
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    console.log('User found, checking password');
    
    // Verify password
    try {
      const isMatch = await user.comparePassword(password);
      console.log('Password match result:', isMatch);
      
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }
    } catch (passwordErr) {
      console.error('Error comparing password:', passwordErr);
      return res.status(500).json({ msg: 'Error verifying credentials' });
    }

    // Create payload for JWT
    const payload = {
      user: {
        id: user._id
      }
    };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'defaultsecret',
      { expiresIn: '24h' },
      (err, token) => {
        if (err) {
          console.error('JWT signing error:', err);
          return res.status(500).json({ msg: 'Error creating token' });
        }
        console.log('Login successful, token generated');
        res.json({ token });
      }
    );
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Server error during login', error: err.message });
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

  // Check if client/build directory exists
  const clientBuildPath = path.resolve(__dirname, 'client/build');
  const indexPath = path.resolve(clientBuildPath, 'index.html');
  
  let clientBuildExists = false;
  try {
    clientBuildExists = fs.existsSync(clientBuildPath) && fs.existsSync(indexPath);
    console.log(`Client build directory ${clientBuildExists ? 'exists' : 'does not exist'}`);
  } catch (err) {
    console.error('Error checking for client build directory:', err);
  }

  // Any route that doesn't match API will be redirected to index.html if it exists
  // or show a fallback page if not
  app.get('*', (req, res) => {
    if (clientBuildExists) {
      res.sendFile(path.resolve(__dirname, 'client/build', 'index.html'));
    } else {
      // Send a basic HTML page if client build doesn't exist
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Notes App API</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #2c3e50; }
            .card { background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            pre { background: #f1f1f1; padding: 10px; border-radius: 4px; overflow-x: auto; }
            .alert { background: #f8d7da; color: #721c24; padding: 10px; border-radius: 4px; }
            .info { background: #d1ecf1; color: #0c5460; padding: 10px; border-radius: 4px; }
            .success { background: #d4edda; color: #155724; padding: 10px; border-radius: 4px; }
          </style>
        </head>
        <body>
          <h1>Notes App API</h1>
          <div class="card info">
            <h2>API is Running</h2>
            <p>The API server is running correctly, but the client build was not found.</p>
            <p>This is likely because:</p>
            <ul>
              <li>The build process didn't complete correctly</li>
              <li>The build files are in a different location</li>
            </ul>
          </div>
          
          <div class="card success">
            <h2>Available Endpoints</h2>
            <ul>
              <li><code>/api/auth/register</code> - Register a new user</li>
              <li><code>/api/auth/login</code> - Login with email/password</li>
              <li><code>/api/auth/user</code> - Get current user info</li>
              <li><code>/api/notes</code> - Get all notes or create new ones</li>
              <li><code>/api/health</code> - API health check</li>
            </ul>
          </div>
          
          <div class="card">
            <h2>Test Account</h2>
            <p>You can use these credentials for testing:</p>
            <pre>Email: test@example.com\nPassword: password123</pre>
          </div>
        </body>
        </html>
      `);
    }
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