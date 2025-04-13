import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import NotesContext from '../../context/NotesContext';
import { formatDistanceToNow } from 'date-fns';

const NoteItem = ({ note }) => {
  const { deleteNote, setCurrent, toggleFavorite, isFavorite } = useContext(NotesContext);
  const { _id, title, content, createdAt, updatedAt } = note;
  const [isHovered, setIsHovered] = useState(false);
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);
  
  // Check if this note is a favorite
  const favorite = isFavorite(_id);
  
  // Format the date
  const formattedDate = formatDistanceToNow(new Date(updatedAt || createdAt), {
    addSuffix: true
  });
  
  // Generate a random pastel background color based on the note ID
  const generatePastelColor = () => {
    const hash = _id.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    const hue = hash % 360;
    return `hsla(${hue}, 65%, 95%, 0.8)`;
  };
  
  // Truncate the content if it's too long
  const truncatedContent = content.length > 100
    ? `${content.substring(0, 100)}...`
    : content;
    
  // Handle favorite toggle with animation
  const handleFavoriteToggle = () => {
    setIsHeartAnimating(true);
    toggleFavorite(_id);
    setTimeout(() => setIsHeartAnimating(false), 500);
  };
  
  return (
    <div 
      className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden mb-6 transition-all duration-300 transform hover:-translate-y-1"
      style={{ 
        borderTop: `4px solid ${generatePastelColor()}`,
        boxShadow: isHovered ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="px-6 pt-6 pb-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
          <div className="flex items-center">
            <button 
              onClick={handleFavoriteToggle}
              className={`mr-2 focus:outline-none ${isHeartAnimating ? 'animate-pulse' : ''}`}
            >
              {favorite ? (
                <svg className="h-6 w-6 text-red-500 fill-current" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-6 w-6 text-gray-400 hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              )}
            </button>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
              {formattedDate}
            </span>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{truncatedContent}</p>
        </div>
      </div>
      
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 flex justify-end space-x-2 border-t border-gray-100 dark:border-gray-600">
        <Link
          to={`/note/${_id}`}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          View
        </Link>
        <button
          onClick={() => setCurrent(note)}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit
        </button>
        <button
          onClick={() => deleteNote(_id)}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
        >
          <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete
        </button>
      </div>
    </div>
  );
};

export default NoteItem; 