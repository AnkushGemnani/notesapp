import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NotesContext from '../context/NotesContext';
import AuthContext from '../context/AuthContext';
import NoteItem from '../components/notes/NoteItem';
import Spinner from '../components/layout/Spinner';

const Search = () => {
  const { isAuthenticated, loading: authLoading } = useContext(AuthContext);
  const { notes, loading: notesLoading } = useContext(NotesContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (searchTerm.trim() && notes) {
      const results = notes.filter(
        note => 
          note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
          note.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, notes]);

  if (authLoading || notesLoading) {
    return <Spinner />;
  }

  return (
    <div className="pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-6">Search Your Notes</h1>
              
              <div className="mb-8">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                    placeholder="Search for notes by title or content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              {searchTerm.trim() ? (
                <>
                  <p className="text-gray-600 mb-4">
                    Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchTerm}"
                  </p>
                  
                  {searchResults.length > 0 ? (
                    <div className="space-y-4">
                      {searchResults.map((note) => (
                        <NoteItem key={note._id} note={note} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                      <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No matching notes found</h3>
                      <p className="text-gray-500">Try a different search term or create a new note.</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <svg className="h-24 w-24 text-gray-300 mx-auto mb-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h2 className="text-xl font-medium text-gray-700 mb-2">Enter a search term</h2>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Search through your notes by typing keywords in the search box above.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search; 