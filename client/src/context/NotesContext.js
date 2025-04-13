import { createContext, useState, useEffect, useRef } from 'react';
import api from '../utils/api';

const NotesContext = createContext();

export const NotesProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [favoriteNotes, setFavoriteNotes] = useState([]);
  const initialLoadDone = useRef(false);

  // Load notes when component mounts
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Only run once on initial mount
    if (initialLoadDone.current) return;
    
    initialLoadDone.current = true;
    let timeoutId = null;

    const loadData = async () => {
      // Set a timeout to ensure loading state is reset even if the request hangs
      timeoutId = setTimeout(() => {
        if (loading) {
          setLoading(false);
          setError('Connection timeout. Please try again later.');
        }
      }, 5000);

      try {
        // Load favorites from localStorage first (doesn't depend on API)
        try {
          const storedFavorites = localStorage.getItem('favoriteNotes');
          if (storedFavorites) {
            setFavoriteNotes(JSON.parse(storedFavorites));
          }
        } catch (e) {
          console.error('Error loading favorites from localStorage', e);
          setFavoriteNotes([]);
        }

        // Try to get notes from API
        try {
          const res = await api.get('/notes');
          setNotes(res.data);
          setFilteredNotes(res.data);
        } catch (err) {
          setNotes([]);
          setFilteredNotes([]);
          setError(err.response?.data?.msg || 'Error fetching notes');
        }
      } finally {
        setLoading(false);
        if (timeoutId) clearTimeout(timeoutId);
      }
    };

    loadData();

    // Cleanup on unmount
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Filter notes when search term or notes change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (searchTerm !== '') {
      setFilteredNotes(
        notes.filter(
          note =>
            note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.content.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredNotes(notes);
    }
  }, [searchTerm, notes]);

  // Get all notes
  const getNotes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notes');
      setNotes(res.data);
      setFilteredNotes(res.data);
      setLoading(false);
      return true;
    } catch (err) {
      setNotes([]);
      setFilteredNotes([]);
      setError(err.response?.data?.msg || 'Error fetching notes');
      setLoading(false);
      return false;
    }
  };

  // Add a note
  const addNote = async (note) => {
    try {
      setLoading(true);
      const res = await api.post('/notes', note);
      setNotes([res.data, ...notes]);
      setLoading(false);
      return true;
    } catch (err) {
      setError(err.response?.data?.msg || 'Error adding note');
      setLoading(false);
      return false;
    }
  };

  // Delete a note
  const deleteNote = async (id) => {
    try {
      await api.delete(`/notes/${id}`);
      setNotes(notes.filter(note => note._id !== id));
      return true;
    } catch (err) {
      setError(err.response?.data?.msg || 'Error deleting note');
      return false;
    }
  };

  // Update a note
  const updateNote = async (note) => {
    try {
      // Create a clean object with only the necessary fields
      const updateData = {
        title: note.title,
        content: note.content
      };
      
      console.log('Sending update for note ID:', note._id);
      console.log('Update data:', updateData);
      
      // Make API call
      const response = await api.put(`/notes/${note._id}`, updateData);
      const updatedNote = response.data;
      
      console.log('Received updated note from server:', updatedNote);
      
      // Create a new notes array with the updated note
      const updatedNotes = notes.map(n => 
        n._id === updatedNote._id ? updatedNote : n
      );
      
      // Update state
      setNotes(updatedNotes);
      
      // Also update filtered notes to maintain consistency
      if (searchTerm) {
        const newFiltered = updatedNotes.filter(n => 
          n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
          n.content.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredNotes(newFiltered);
      } else {
        setFilteredNotes(updatedNotes);
      }
      
      // If this was the current note, update it too
      if (currentNote && currentNote._id === updatedNote._id) {
        setCurrentNote(updatedNote);
      }
      
      return true;
    } catch (err) {
      console.error('Error updating note:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url,
        method: err.config?.method,
        data: err.config?.data
      });
      
      const errorMsg = err.response?.data?.msg || 'Failed to update note. Please try again.';
      setError(errorMsg);
      return false;
    }
  };

  // Test update a note (for debugging)
  const testUpdateNote = async (note) => {
    try {
      // Create a clean object with only the necessary fields
      const updateData = {
        title: note.title,
        content: note.content
      };
      
      console.log('TEST UPDATE: Sending update for note ID:', note._id);
      console.log('TEST UPDATE: Update data:', updateData);
      
      // Use alternative test endpoint
      const response = await api.post(`/notes/test-update/${note._id}`, updateData);
      console.log('TEST UPDATE: Server response:', response.data);
      
      if (response.data.success) {
        const updatedNote = response.data.note;
        
        // Update local state with the returned note
        const updatedNotes = notes.map(n => 
          n._id === updatedNote._id ? updatedNote : n
        );
        
        setNotes(updatedNotes);
        setFilteredNotes(updatedNotes);
        
        // Also update current note if needed
        if (currentNote && currentNote._id === updatedNote._id) {
          setCurrentNote(updatedNote);
        }
        
        return true;
      } else {
        setError('Test update failed');
        return false;
      }
    } catch (err) {
      console.error('TEST UPDATE: Error:', err);
      setError(err.response?.data?.error || 'Test update failed');
      return false;
    }
  };

  // Set current note for editing
  const setCurrent = (note) => {
    setCurrentNote(note);
  };

  // Clear current note
  const clearCurrent = () => {
    setCurrentNote(null);
  };

  // Set search term
  const setSearch = (term) => {
    setSearchTerm(term);
  };

  // Toggle favorite status of a note
  const toggleFavorite = (noteId) => {
    if (favoriteNotes.includes(noteId)) {
      const newFavorites = favoriteNotes.filter(id => id !== noteId);
      setFavoriteNotes(newFavorites);
      localStorage.setItem('favoriteNotes', JSON.stringify(newFavorites));
    } else {
      const newFavorites = [...favoriteNotes, noteId];
      setFavoriteNotes(newFavorites);
      localStorage.setItem('favoriteNotes', JSON.stringify(newFavorites));
    }
  };

  // Check if a note is favorited
  const isFavorite = (noteId) => {
    return favoriteNotes.includes(noteId);
  };

  // Get favorite notes
  const getFavoriteNotes = () => {
    if (!notes) return [];
    return notes.filter(note => favoriteNotes.includes(note._id));
  };

  // Clear errors
  const clearError = () => {
    setError(null);
  };

  return (
    <NotesContext.Provider
      value={{
        notes,
        currentNote,
        loading,
        error,
        filteredNotes,
        searchTerm,
        getNotes,
        addNote,
        deleteNote,
        updateNote,
        testUpdateNote,
        setCurrent,
        clearCurrent,
        setSearch,
        toggleFavorite,
        isFavorite,
        favoriteNotes,
        getFavoriteNotes,
        clearError
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};

export default NotesContext; 