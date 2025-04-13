import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { Suspense, lazy } from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
// Import critical components directly
import Home from './pages/Home';
import Landing from './pages/Landing';
import Spinner from './components/layout/Spinner';
import { AuthProvider } from './context/AuthContext';
import { NotesProvider } from './context/NotesContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Lazy load non-critical components
const Register = lazy(() => import('./components/auth/Register'));
const Login = lazy(() => import('./components/auth/Login'));
const Search = lazy(() => import('./pages/Search'));
const Favorites = lazy(() => import('./pages/Favorites'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const ViewNote = lazy(() => import('./pages/ViewNote'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Simple loading component
const LoadingFallback = () => (
  <div className="flex justify-center items-center h-screen">
    <Spinner />
  </div>
);

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Something went wrong</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">We apologize for the inconvenience. Please try refreshing the page.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  // Simple toast configuration
  const toastConfig = {
    position: "bottom-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "colored",
    limit: 3
  };

  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotesProvider>
          <ThemeProvider>
            <Router>
              <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
                <Navbar />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/landing" element={<Landing />} />
                    <Route 
                      path="/register" 
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <Register />
                        </Suspense>
                      } 
                    />
                    <Route 
                      path="/login" 
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <Login />
                        </Suspense>
                      } 
                    />
                    <Route 
                      path="/search" 
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <Search />
                        </Suspense>
                      } 
                    />
                    <Route 
                      path="/favorites" 
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <Favorites />
                        </Suspense>
                      } 
                    />
                    <Route 
                      path="/profile" 
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <Profile />
                        </Suspense>
                      } 
                    />
                    <Route 
                      path="/settings" 
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <Settings />
                        </Suspense>
                      } 
                    />
                    <Route 
                      path="/note/:id" 
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <ViewNote />
                        </Suspense>
                      } 
                    />
                    <Route 
                      path="*" 
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <NotFound />
                        </Suspense>
                      } 
                    />
                  </Routes>
                </main>
                <Footer />
                <ToastContainer {...toastConfig} />
              </div>
            </Router>
          </ThemeProvider>
        </NotesProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
