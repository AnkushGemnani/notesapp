import { useContext, useEffect } from 'react';
import NotesContext from '../../context/NotesContext';
import NoteItem from './NoteItem';
import Spinner from '../layout/Spinner';

const Notes = ({ notes: filteredNotes }) => {
  const { notes, getNotes, loading } = useContext(NotesContext);
  
  // Use filtered notes if provided as props, otherwise use all notes from context
  const displayNotes = filteredNotes || notes;

  useEffect(() => {
    getNotes();
    // eslint-disable-next-line
  }, []);

  if (loading) {
    return <Spinner />;
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Your Notes</h2>
        <span className="text-sm text-gray-500">{displayNotes.length} note{displayNotes.length !== 1 ? 's' : ''}</span>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {displayNotes.map((note) => (
          <NoteItem key={note._id} note={note} />
        ))}
      </div>
    </div>
  );
};

export default Notes; 