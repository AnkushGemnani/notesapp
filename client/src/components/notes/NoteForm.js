import { useState, useContext, useEffect } from 'react';
import NotesContext from '../../context/NotesContext';
import { toast } from 'react-toastify';

const NoteForm = () => {
  const { addNote, updateNote, testUpdateNote, currentNote, clearCurrent } = useContext(NotesContext);
  
  const [note, setNote] = useState({
    title: '',
    content: ''
  });
  
  const [error, setError] = useState({
    title: false,
    content: false
  });
  
  useEffect(() => {
    if (currentNote) {
      setNote({
        title: currentNote.title,
        content: currentNote.content
      });
    } else {
      setNote({
        title: '',
        content: ''
      });
    }
    setError({ title: false, content: false });
  }, [currentNote]);
  
  const { title, content } = note;
  
  const onChange = e => {
    setNote({ ...note, [e.target.name]: e.target.value });
    if (e.target.value.trim() !== '') {
      setError({ ...error, [e.target.name]: false });
    }
  };
  
  const onSubmit = async e => {
    e.preventDefault();
    
    const newErrors = {
      title: title.trim() === '',
      content: content.trim() === ''
    };
    
    setError(newErrors);
    
    if (newErrors.title || newErrors.content) {
      return;
    }
    
    if (currentNote) {
      // Create a properly formatted note object with the _id from currentNote
      const updatedNote = {
        _id: currentNote._id,
        title,
        content
      };
      console.log('Submitting note update:', updatedNote);
      
      // Try regular update first
      let success = await updateNote(updatedNote);
      
      // If regular update fails, try the test update as a fallback
      if (!success) {
        console.log('Regular update failed, trying test update method...');
        toast.info('Trying alternative update method...');
        success = await testUpdateNote(updatedNote);
      }
      
      if (success) {
        toast.success('Note updated successfully!');
      } else {
        toast.error('Failed to update note. Please try again.');
        // Don't clear the form if update failed
        return;
      }
    } else {
      const success = await addNote({
        title,
        content
      });
      
      if (success) {
        toast.success('Note created successfully!');
      } else {
        toast.error('Failed to create note. Please try again.');
        return;
      }
    }
    
    // Clear form
    setNote({
      title: '',
      content: ''
    });
    
    clearCurrent();
  };
  
  const clearAll = () => {
    clearCurrent();
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden mb-8 border border-gray-200 dark:border-gray-700">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-5">
        <h2 className="text-xl font-bold text-white flex items-center">
          <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {currentNote ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            )}
          </svg>
          {currentNote ? 'Edit Note' : 'Create New Note'}
        </h2>
        <p className="text-blue-100 mt-1 text-sm">
          {currentNote ? 'Update your note details below' : 'Fill in the details to add a new note'}
        </p>
      </div>
      
      <form onSubmit={onSubmit} className="px-8 py-6 space-y-6">
        <div className="mb-5">
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2" htmlFor="title">
            Title
          </label>
          <input
            type="text"
            name="title"
            id="title"
            value={title}
            onChange={onChange}
            placeholder="Enter a descriptive title..."
            className={`shadow-sm appearance-none border ${
              error.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } rounded-md w-full py-3 px-4 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base bg-white dark:bg-gray-700`}
          />
          {error.title && (
            <p className="text-red-500 text-sm mt-1">Title is required</p>
          )}
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2" htmlFor="content">
            Content
          </label>
          <textarea
            name="content"
            id="content"
            value={content}
            onChange={onChange}
            placeholder="Write your note content here..."
            className={`shadow-sm appearance-none border ${
              error.content ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } rounded-md w-full py-3 px-4 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base h-60 resize-none bg-white dark:bg-gray-700`}
          />
          {error.content && (
            <p className="text-red-500 text-sm mt-1">Content is required</p>
          )}
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
          {currentNote ? (
            <div className="flex space-x-3">
              <button
                type="submit"
                className="inline-flex items-center px-5 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Save Changes
              </button>
              
              <button
                type="button"
                className="inline-flex items-center px-5 py-3 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                onClick={clearAll}
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="submit"
              className="inline-flex items-center px-5 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Note
            </button>
          )}
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {currentNote ? 'Editing note created ' + new Date(currentNote.createdAt).toLocaleDateString() : 'All fields are required'}
          </div>
        </div>
      </form>
    </div>
  );
};

export default NoteForm; 