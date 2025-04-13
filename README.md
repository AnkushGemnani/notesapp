# NotesApp - MERN Stack Notes Application

A responsive web application for creating, managing, and searching personal notes built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## Features

- User authentication (Register/Login) using JWT
- Create, read, update, and delete personal notes
- Search and filter notes by title or content
- Responsive UI design using Tailwind CSS
- Secure API with protected routes
- User-specific note management

## Tech Stack

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JSON Web Token (JWT) for authentication
- bcryptjs for password hashing

### Frontend
- React.js with React Router
- Context API for state management
- Tailwind CSS for styling
- Axios for API requests
- date-fns for date formatting

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or Atlas)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd notesapp
   ```

2. Install server dependencies:
   ```
   cd server
   npm install
   ```

3. Install client dependencies:
   ```
   cd ../client
   npm install
   ```

4. Configure environment variables:
   - Create a `.env` file in the server directory with the following variables:
     ```
     MONGO_URI=<your-mongodb-connection-string>
     JWT_SECRET=<your-secret-key>
     PORT=5000
     ```

5. Run the application in development mode:
   - Start server:
     ```
     cd server
     npm run server
     ```
   - Start client:
     ```
     cd client
     npm start
     ```
   - Or run both concurrently:
     ```
     cd server
     npm run dev
     ```

6. Access the application:
   - Backend API: http://localhost:5000
   - Frontend: http://localhost:3000

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login a user
- GET /api/auth/user - Get user data (protected)

### Notes
- GET /api/notes - Get all user notes (protected)
- GET /api/notes/:id - Get a specific note (protected)
- POST /api/notes - Create a note (protected)
- PUT /api/notes/:id - Update a note (protected)
- DELETE /api/notes/:id - Delete a note (protected)
- GET /api/notes/search - Search notes (protected)

## License

MIT 