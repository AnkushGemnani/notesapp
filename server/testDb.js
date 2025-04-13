const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('Testing MongoDB connection...');
console.log('MONGO_URI present:', !!process.env.MONGO_URI);
console.log('JWT_SECRET present:', !!process.env.JWT_SECRET);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully!');
    console.log('Connection details:');
    console.log('- Host:', mongoose.connection.host);
    console.log('- Database name:', mongoose.connection.name);
    
    // List collections
    return mongoose.connection.db.listCollections().toArray();
  })
  .then(collections => {
    console.log('\nCollections in database:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    console.log('\nDatabase connection test completed successfully.');
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:');
    console.error(err);
    process.exit(1);
  }); 