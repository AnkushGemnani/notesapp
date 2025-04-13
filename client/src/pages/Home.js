import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Notes from '../components/notes/Notes';
import NoteForm from '../components/notes/NoteForm';
import Spinner from '../components/layout/Spinner';
import AuthContext from '../context/AuthContext';
import NotesContext from '../context/NotesContext';

const Home = () => {
  const { isAuthenticated, loading: authLoading, user } = useContext(AuthContext);
  const { 
    notes, 
    loading: notesLoading,
    searchTerm,
    setSearch,
    getFavoriteNotes
  } = useContext(NotesContext);
  
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [displayedNotes, setDisplayedNotes] = useState([]);

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Update displayed notes when tab changes or notes/search updates
  useEffect(() => {
    if (!notesLoading && notes) {
      let filteredNotes = notes;
      
      // First filter by search term if present
      if (searchTerm) {
        filteredNotes = notes.filter(note => 
          note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
          note.content.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Then apply tab filtering
      if (activeTab === 'all') {
        setDisplayedNotes(filteredNotes);
      } else if (activeTab === 'recent') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        setDisplayedNotes(
          filteredNotes.filter(note => new Date(note.updatedAt || note.createdAt) > oneWeekAgo)
        );
      } else if (activeTab === 'favorites') {
        setDisplayedNotes(
          filteredNotes.filter(note => getFavoriteNotes().some(fav => fav._id === note._id))
        );
      }
    }
  }, [activeTab, notes, notesLoading, searchTerm, getFavoriteNotes]);

  // Calculate statistics
  const getTotalNotes = () => notes?.length || 0;
  const getRecentNotes = () => {
    if (!notes) return 0;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return notes.filter(note => new Date(note.updatedAt || note.createdAt) > oneWeekAgo).length;
  };
  
  if (authLoading) {
    return <Spinner />;
  }

  return (
    <div className="pt-20 pb-10">
      <div className="container mx-auto px-4">
        {/* Welcome Header with Animation */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-xl overflow-hidden mb-8">
            <div className="relative p-8 md:p-10">
              {/* Animated Circles in Background */}
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full"></div>
              <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white opacity-10 rounded-full"></div>
              
              <div className="relative z-10">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 animate-fadeIn">
                  Welcome to Your Dashboard
                </h1>
                {user && (
                  <p className="text-blue-100 text-lg md:text-xl animate-slideUp">
                    Hello, <span className="font-semibold">{user.name}</span>! Here's what's happening with your notes today.
                  </p>
                )}
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="bg-white bg-opacity-10 px-8 py-6 border-t border-white border-opacity-20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white bg-opacity-25 rounded-lg p-4 backdrop-filter backdrop-blur-sm">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-indigo-500 bg-opacity-75 mr-4">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Total Notes</p>
                      <p className="text-white text-2xl font-bold">{getTotalNotes()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white bg-opacity-25 rounded-lg p-4 backdrop-filter backdrop-blur-sm">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-500 bg-opacity-75 mr-4">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Recent Notes (7 days)</p>
                      <p className="text-white text-2xl font-bold">{getRecentNotes()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white bg-opacity-25 rounded-lg p-4 backdrop-filter backdrop-blur-sm">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-purple-500 bg-opacity-75 mr-4">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Recent Activity</p>
                      <p className="text-white text-2xl font-bold">Active</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Search and Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              {/* Search Bar */}
              <div className="relative w-full md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              
              {/* Tabs */}
              <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'all'
                      ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  All Notes
                </button>
                <button
                  onClick={() => setActiveTab('recent')}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'recent'
                      ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Recent
                </button>
                <button
                  onClick={() => setActiveTab('favorites')}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'favorites'
                      ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Favorites
                </button>
              </div>
            </div>
          </div>
          
          {/* Quick Tips Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg shadow-sm border border-blue-100 dark:border-gray-600 p-4 mb-8">
            <div className="flex items-center text-blue-500 dark:text-blue-400 mb-4">
              <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Quick Tips</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm">
                <div className="text-blue-500 dark:text-blue-400 font-medium mb-1">Create Notes</div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Use the form to quickly create new notes</p>
              </div>
              <div className="bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm">
                <div className="text-blue-500 dark:text-blue-400 font-medium mb-1">Edit Notes</div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Click the edit button to modify existing notes</p>
              </div>
              <div className="bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm">
                <div className="text-blue-500 dark:text-blue-400 font-medium mb-1">Delete Notes</div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Remove notes you no longer need</p>
              </div>
              <div className="bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm">
                <div className="text-blue-500 dark:text-blue-400 font-medium mb-1">Search</div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Use the search box to find specific notes</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 order-2 lg:order-1">
              <NoteForm />
            </div>
            <div className="lg:col-span-7 order-1 lg:order-2">
              {notesLoading ? (
                <Spinner />
              ) : displayedNotes && displayedNotes.length > 0 ? (
                <Notes notes={displayedNotes} />
              ) : searchTerm ? (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
                  <div className="text-gray-400 dark:text-gray-500 mb-4">
                    <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">No notes found</h3>
                  <p className="text-gray-500 dark:text-gray-400">We couldn't find any notes matching your search.</p>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
                  <div className="text-gray-400 dark:text-gray-500 mb-4">
                    <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">No notes yet</h3>
                  <p className="text-gray-500 dark:text-gray-400">Create your first note using the form on the left.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add some animations
const styles = document.createElement('style');
styles.innerHTML = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  .animate-fadeIn {
    animation: fadeIn 0.6s ease-in-out;
  }
  .animate-slideUp {
    animation: fadeIn 0.3s ease-out, slideUp 0.5s ease-out;
  }
`;
document.head.appendChild(styles);

export default Home; 