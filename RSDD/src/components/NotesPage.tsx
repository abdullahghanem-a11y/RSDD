import { useState } from 'react';
import { FileText, Plus, Trash2, Save } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Card } from './ui/card';

interface NotesPageProps {
  isDarkMode: boolean;
}

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export function NotesPage({ isDarkMode }: NotesPageProps) {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'Meeting Preparation',
      content: 'Review the agenda for tomorrow\'s faculty meeting. Prepare the annual budget report and department performance metrics.',
      createdAt: new Date('2024-11-08'),
      updatedAt: new Date('2024-11-08'),
    },
    {
      id: '2',
      title: 'Project Ideas',
      content: 'Research collaboration opportunities with international universities. Consider joint research programs in AI and Data Science.',
      createdAt: new Date('2024-11-05'),
      updatedAt: new Date('2024-11-05'),
    },
  ]);

  const [selectedNote, setSelectedNote] = useState<Note | null>(notes[0] || null);
  const [editingTitle, setEditingTitle] = useState(selectedNote?.title || '');
  const [editingContent, setEditingContent] = useState(selectedNote?.content || '');

  const handleNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote);
    setEditingTitle(newNote.title);
    setEditingContent(newNote.content);
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    setEditingTitle(note.title);
    setEditingContent(note.content);
  };

  const handleSaveNote = () => {
    if (selectedNote) {
      const updatedNotes = notes.map(note =>
        note.id === selectedNote.id
          ? { ...note, title: editingTitle, content: editingContent, updatedAt: new Date() }
          : note
      );
      setNotes(updatedNotes);
      setSelectedNote({ ...selectedNote, title: editingTitle, content: editingContent, updatedAt: new Date() });
    }
  };

  const handleDeleteNote = (noteId: string) => {
    const filteredNotes = notes.filter(note => note.id !== noteId);
    setNotes(filteredNotes);
    if (selectedNote?.id === noteId) {
      setSelectedNote(filteredNotes[0] || null);
      setEditingTitle(filteredNotes[0]?.title || '');
      setEditingContent(filteredNotes[0]?.content || '');
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0a0e1a]' : 'bg-[#f8f9fa]'} p-8`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-2xl mb-2 ${isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}`}>Notes</h1>
              <p className={`text-sm ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`}>
                Create and manage your personal notes
              </p>
            </div>
            <Button
              onClick={handleNewNote}
              className="bg-[#2463eb] hover:bg-[#1d4ed8] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Note
            </Button>
          </div>
        </div>

        {/* Notes Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Notes List */}
          <div className={`rounded-lg border p-4 h-[calc(100vh-240px)] overflow-y-auto ${
            isDarkMode ? 'bg-[#1a2332] border-[#2a3544]' : 'bg-white border-[#e5e7eb]'
          }`}>
            <h2 className={`mb-4 ${isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}`}>All Notes</h2>
            
            {notes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <FileText className={`w-12 h-12 mb-3 ${isDarkMode ? 'text-[#2a3544]' : 'text-[#e5e7eb]'}`} />
                <p className={`text-sm ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`}>
                  No notes yet
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {notes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => handleSelectNote(note)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedNote?.id === note.id
                        ? 'bg-[#2463eb] text-white'
                        : isDarkMode
                        ? 'text-[#8b94a8] hover:bg-[#0f1621]'
                        : 'text-[#666666] hover:bg-[#f3f4f6]'
                    }`}
                  >
                    <h3 className={`text-sm mb-1 ${
                      selectedNote?.id === note.id
                        ? 'text-white'
                        : isDarkMode
                        ? 'text-white'
                        : 'text-[#1a1a1a]'
                    }`}>
                      {note.title}
                    </h3>
                    <p className={`text-xs line-clamp-2 ${
                      selectedNote?.id === note.id
                        ? 'text-white/80'
                        : isDarkMode
                        ? 'text-[#8b94a8]'
                        : 'text-[#666666]'
                    }`}>
                      {note.content || 'No content'}
                    </p>
                    <p className={`text-xs mt-1 ${
                      selectedNote?.id === note.id
                        ? 'text-white/60'
                        : isDarkMode
                        ? 'text-[#8b94a8]'
                        : 'text-[#666666]'
                    }`}>
                      {note.updatedAt.toLocaleDateString()}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Note Editor */}
          <div className={`lg:col-span-2 rounded-lg border p-6 h-[calc(100vh-240px)] flex flex-col ${
            isDarkMode ? 'bg-[#1a2332] border-[#2a3544]' : 'bg-white border-[#e5e7eb]'
          }`}>
            {selectedNote ? (
              <>
                <div className="mb-4">
                  <Input
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    placeholder="Note title..."
                    className={`text-xl mb-2 ${
                      isDarkMode
                        ? 'bg-[#0f1621] border-[#2a3544] text-white placeholder:text-[#8b94a8]'
                        : 'bg-[#f8f9fa] border-[#e5e7eb] text-[#1a1a1a] placeholder:text-[#666666]'
                    }`}
                  />
                  <p className={`text-xs ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`}>
                    Last updated: {selectedNote.updatedAt.toLocaleString()}
                  </p>
                </div>

                <Textarea
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  placeholder="Start writing your note..."
                  className={`flex-1 resize-none mb-4 ${
                    isDarkMode
                      ? 'bg-[#0f1621] border-[#2a3544] text-white placeholder:text-[#8b94a8]'
                      : 'bg-[#f8f9fa] border-[#e5e7eb] text-[#1a1a1a] placeholder:text-[#666666]'
                  }`}
                />

                <div className="flex items-center gap-2 justify-end">
                  <Button
                    onClick={() => handleDeleteNote(selectedNote.id)}
                    variant="outline"
                    className={
                      isDarkMode
                        ? 'border-[#2a3544] text-[#dc2626] hover:bg-[#dc2626]/10'
                        : 'border-[#e5e7eb] text-[#dc2626] hover:bg-[#fef2f2]'
                    }
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                  <Button
                    onClick={handleSaveNote}
                    className="bg-[#2463eb] hover:bg-[#1d4ed8] text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center">
                <FileText className={`w-16 h-16 mb-4 ${isDarkMode ? 'text-[#2a3544]' : 'text-[#e5e7eb]'}`} />
                <p className={`text-sm ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`}>
                  Select a note to start editing or create a new one
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
