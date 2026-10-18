import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

const STORAGE_KEY = 'breezy_notes_v1';

export const NotesWorkspace: React.FC = () => {
  const [notes, setNotes] = useState<NoteItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'note-1',
        title: 'Empirical Verification Notes',
        content: '# Research Methodology\n\n- Multi-agent debate eliminates lone-model hallucination traps.\n- Deterministic DOI lookups protect against phantom citations.\n- Always verify temperature bounds and additive conditions in electrochemistry papers.',
        updatedAt: Date.now(),
      },
    ];
  });

  const [activeNoteId, setActiveNoteId] = useState<string | null>(notes[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch {}
  }, [notes]);

  const activeNote = notes.find((n) => n.id === activeNoteId) || null;

  const handleCreateNote = () => {
    const newNote: NoteItem = {
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: 'Untitled Note',
      content: '',
      updatedAt: Date.now(),
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
    setMobileView('detail');
  };

  const handleUpdateActiveNote = (updates: Partial<NoteItem>) => {
    if (!activeNoteId) return;
    setNotes((prev) =>
      prev.map((n) =>
        n.id === activeNoteId ? { ...n, ...updates, updatedAt: Date.now() } : n
      )
    );
  };

  const handleDeleteNote = (id: string) => {
    if (window.confirm('Delete this note permanently?')) {
      const remaining = notes.filter((n) => n.id !== id);
      setNotes(remaining);
      if (activeNoteId === id) {
        setActiveNoteId(remaining[0]?.id || null);
        if (remaining.length === 0) {
          setMobileView('list');
        }
      }
    }
  };

  const filteredNotes = notes.filter(
    (n) =>
      !searchQuery ||
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-[#111319] text-[#e1e2e9] overflow-hidden">
      {/* Top Bar */}
      <div className="h-14 bg-[#141820] border-b border-[#272a30] px-4 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          {mobileView === 'detail' && (
            <button
              onClick={() => setMobileView('list')}
              className="md:hidden p-1 rounded hover:bg-[#272a30] text-[#bcc9ce]"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
            </button>
          )}
          <span className="material-symbols-outlined text-[#4cd6fb] text-xl">edit_note</span>
          <span className="font-bold text-sm text-[#e1e2e9]">Notes</span>
          <span className="text-xs font-mono text-[#869398] hidden sm:inline">
            ({notes.length} saved)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {activeNote && (
            <div className="flex items-center bg-[#1d2025] rounded p-0.5 border border-[#272a30]">
              <button
                onClick={() => setViewMode('edit')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  viewMode === 'edit' ? 'bg-[#272a30] text-[#4cd6fb]' : 'text-[#869398]'
                }`}
              >
                Edit
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  viewMode === 'preview' ? 'bg-[#272a30] text-[#4cd6fb]' : 'text-[#869398]'
                }`}
              >
                Preview
              </button>
            </div>
          )}

          <button
            onClick={handleCreateNote}
            className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#4cd6fb] hover:bg-[#7bd0ff] text-[#003642] text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm font-bold">add</span>
            <span>New Note</span>
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Notes List Column */}
        <div
          className={`
            ${mobileView === 'list' ? 'flex' : 'hidden md:flex'}
            w-full md:w-80 flex-col bg-[#141820]/50 border-r border-[#272a30] shrink-0 overflow-hidden
          `}
        >
          {/* Search Box */}
          <div className="p-3 border-b border-[#272a30]">
            <div className="flex items-center gap-2 bg-[#191c21] border border-[#272a30] rounded px-2.5 py-1 text-xs">
              <span className="material-symbols-outlined text-sm text-[#869398]">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                className="bg-transparent text-[#e1e2e9] placeholder-[#869398] focus:outline-none w-full"
              />
            </div>
          </div>

          {/* Notes List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredNotes.length === 0 ? (
              <p className="p-4 text-xs text-[#869398] text-center">No notes found.</p>
            ) : (
              filteredNotes.map((note) => {
                const isActive = note.id === activeNoteId;
                return (
                  <div
                    key={note.id}
                    onClick={() => {
                      setActiveNoteId(note.id);
                      setMobileView('detail');
                    }}
                    className={`
                      group p-3 rounded-lg cursor-pointer transition-colors border
                      ${
                        isActive
                          ? 'bg-[#191c21] border-[#4cd6fb]/50 text-[#e1e2e9]'
                          : 'bg-[#111319] border-transparent hover:bg-[#191c21] text-[#bcc9ce]'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-xs truncate">{note.title || 'Untitled Note'}</h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-[#869398] hover:text-[#ffb4ab] p-0.5"
                        title="Delete note"
                      >
                        <span className="material-symbols-outlined text-xs">delete</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-[#869398] truncate line-clamp-1">
                      {note.content ? note.content.slice(0, 80) : 'Empty note'}
                    </p>
                    <span className="text-[10px] text-[#869398] font-mono mt-1 block">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Note Editor Column */}
        <div
          className={`
            ${mobileView === 'detail' ? 'flex' : 'hidden md:flex'}
            flex-1 flex-col overflow-hidden bg-[#111319]
          `}
        >
          {activeNote ? (
            <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-hidden space-y-3">
              <input
                type="text"
                value={activeNote.title}
                onChange={(e) => handleUpdateActiveNote({ title: e.target.value })}
                placeholder="Note Title"
                className="w-full bg-transparent text-xl sm:text-2xl font-bold text-[#e1e2e9] placeholder-[#869398] focus:outline-none pb-2 border-b border-[#272a30]"
              />

              {viewMode === 'edit' ? (
                <textarea
                  value={activeNote.content}
                  onChange={(e) => handleUpdateActiveNote({ content: e.target.value })}
                  placeholder="Write in Markdown..."
                  className="flex-1 w-full bg-transparent text-sm text-[#e1e2e9] font-mono leading-relaxed placeholder-[#869398] focus:outline-none resize-none selection:bg-[#00414f]"
                />
              ) : (
                <div className="flex-1 overflow-y-auto prose prose-invert max-w-none text-sm text-[#e1e2e9] leading-relaxed">
                  <ReactMarkdown>{activeNote.content || '*Empty note*'}</ReactMarkdown>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-[#869398]">
              <span className="material-symbols-outlined text-4xl mb-2 text-[#3d494d]">note_stack</span>
              <p className="text-sm">Select a note or create a new one to start writing.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
