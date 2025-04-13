import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NotesContext from '../context/NotesContext';
import AuthContext from '../context/AuthContext';
import Spinner from '../components/layout/Spinner';
import NoteItem from '../components/notes/NoteItem';

const Favorites = () => {
  const { isAuthenticated, loading: authLoading } = useContext(AuthContext);
  const { loading: notesLoading, getFavoriteNotes } = useContext(NotesContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Get favorite notes
  const favoriteNotes = getFavoriteNotes();

  if (authLoading || notesLoading) {
    return <Spinner />;
  }

  return (
    <div className="pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-pink-50 to-red-50 rounded-xl shadow-md overflow-hidden mb-8">
            <div className="relative p-8">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-red-200 opacity-10 rounded-full"></div>
              <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-red-200 opacity-10 rounded-full"></div>
              
              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <svg className="h-8 w-8 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  <h1 className="text-3xl font-bold text-gray-800">Your Favorite Notes</h1>
                </div>
                
                <p className="text-gray-600 mb-6">
                  Access your most important notes quickly from one place. Click the heart icon on any note to add or remove it from favorites.
                </p>
              </div>
            </div>
          </div>
          
          {favoriteNotes.length > 0 ? (
            <div className="space-y-4">
              {favoriteNotes.map((note) => (
                <NoteItem key={note._id} note={note} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="mb-4">
                <svg className="h-16 w-16 text-gray-300 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-xl font-medium text-gray-700 mb-2">No favorite notes yet</h2>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                Click the heart icon on any note to add it to your favorites and access it quickly from this page.
              </p>
              <button 
                onClick={() => navigate('/')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Go to Your Notes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Favorites; 