import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { DebateSession } from '../types';
import { loadSessions, saveSessions } from '../services/sessionStorage';
import { exportTranscriptAsMarkdown } from '../utils/exportTranscript';

export const HistoryWorkspace: React.FC = () => {
  const [sessions, setSessions] = useState<DebateSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<DebateSession | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');
  const [pinnedNotice, setPinnedNotice] = useState<string | null>(null);

  useEffect(() => {
    const list = loadSessions();
    setSessions(list);
    if (list.length > 0) {
      setSelectedSession(list[0]);
    }
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this research session?')) return;
    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    saveSessions(updated);
    if (selectedSession?.id === id) {
      setSelectedSession(updated[0] || null);
      if (updated.length === 0) setMobileView('list');
    }
  };

  const handleExport = (session: DebateSession) => {
    exportTranscriptAsMarkdown(session);
  };

  const handlePinToCanvas = (session: DebateSession) => {
    try {
      const STORAGE_KEY = 'breezy_canvas_cards_v1';
      const existing = localStorage.getItem(STORAGE_KEY);
      const cards = existing ? JSON.parse(existing) : [];
      const brief = session.finalOutput || (session as any).synthesis?.finalAnswer || 'Research transcript';
      const newCard = {
        id: `pin-${session.id}-${Date.now()}`,
        type: 'research',
        title: session.prompt || 'Research Brief',
        content: brief.slice(0, 1500),
        tags: ['History', session.protocol || 'trio'],
        sourceSessionId: session.id,
        createdAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify([newCard, ...cards]));
      setPinnedNotice('Pinned to Research Canvas!');
      setTimeout(() => setPinnedNotice(null), 2500);
    } catch (err: any) {
      alert(`Pin failed: ${err.message}`);
    }
  };

  const filteredSessions = sessions.filter(
    (s) =>
      !searchQuery ||
      s.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.finalOutput && s.finalOutput.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex-1 bg-[#111319] text-[#e1e2e9] flex h-full overflow-hidden select-none">
      {/* Sessions Master List Column */}
      <div
        className={`
          ${mobileView === 'list' ? 'flex' : 'hidden md:flex'}
          w-full md:w-80 border-r border-[#272a30] bg-[#141820]/60 flex-col h-full shrink-0 overflow-hidden
        `}
      >
        <div className="p-4 border-b border-[#272a30] space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#e1e2e9] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4cd6fb] text-lg">folder_open</span>
              <span>Research History</span>
            </h2>
            <span className="text-[11px] font-mono text-[#869398]">({sessions.length})</span>
          </div>

          <div className="flex items-center gap-2 bg-[#191c21] border border-[#272a30] rounded px-2.5 py-1 text-xs">
            <span className="material-symbols-outlined text-sm text-[#869398]">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search previous debates..."
              className="bg-transparent text-[#e1e2e9] placeholder-[#869398] focus:outline-none w-full"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {filteredSessions.length === 0 ? (
            <div className="p-6 text-center text-[#869398] text-xs font-sans">
              No saved research sessions yet. Run an inquiry on the Research screen to populate your history vault.
            </div>
          ) : (
            filteredSessions.map((s) => {
              const isSelected = selectedSession?.id === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => {
                    setSelectedSession(s);
                    setMobileView('detail');
                  }}
                  className={`
                    p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between group
                    ${
                      isSelected
                        ? 'bg-[#191c21] border-[#4cd6fb]/50 text-[#e1e2e9] shadow-md'
                        : 'bg-[#111319] border-[#272a30] text-[#bcc9ce] hover:border-[#3d494d]/60'
                    }
                  `}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-[#e1e2e9] line-clamp-2 leading-snug">
                      {s.prompt}
                    </p>
                    <button
                      onClick={(e) => handleDelete(s.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-[#869398] hover:text-[#ffb4ab] p-0.5 transition-opacity"
                      title="Delete Session"
                    >
                      <span className="material-symbols-outlined text-xs">delete</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#272a30]/50 text-[10px] text-[#869398] font-mono">
                    <span className="uppercase px-1.5 py-0.5 rounded bg-[#272a30] text-[#4cd6fb]">
                      {s.protocol || 'trio'}
                    </span>
                    <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Selected Session Detail Column */}
      <div
        className={`
          ${mobileView === 'detail' ? 'flex' : 'hidden md:flex'}
          flex-1 flex-col h-full overflow-hidden bg-[#111319]
        `}
      >
        {selectedSession ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Top Detail Header */}
            <div className="h-14 px-4 sm:px-6 bg-[#141820] border-b border-[#272a30] flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 overflow-hidden">
                <button
                  onClick={() => setMobileView('list')}
                  className="md:hidden p-1 rounded hover:bg-[#272a30] text-[#bcc9ce]"
                >
                  <span className="material-symbols-outlined text-lg">arrow_back</span>
                </button>
                <div className="overflow-hidden">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#272a30] text-[#4cd6fb] uppercase">
                    {selectedSession.protocol || 'trio'} Protocol
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-[#e1e2e9] truncate mt-0.5 max-w-xl">
                    {selectedSession.prompt}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {pinnedNotice && (
                  <span className="text-xs font-mono text-[#4edea3] hidden sm:inline">
                    {pinnedNotice}
                  </span>
                )}

                <button
                  onClick={() => handlePinToCanvas(selectedSession)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#1d2025] hover:bg-[#272a30] text-[#4edea3] text-xs font-medium border border-[#272a30] transition-colors"
                  title="Pin to Research Canvas"
                >
                  <span className="material-symbols-outlined text-sm">push_pin</span>
                  <span className="hidden sm:inline">Pin to Canvas</span>
                </button>

                <button
                  onClick={() => handleExport(selectedSession)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#4cd6fb] hover:bg-[#7bd0ff] text-[#003642] text-xs font-semibold transition-colors"
                >
                  <span className="material-symbols-outlined text-sm font-bold">download</span>
                  <span className="hidden sm:inline">Export</span>
                </button>
              </div>
            </div>

            {/* Transcript & Evidence Stream */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 max-w-4xl">
              {/* Executive Synthesis */}
              {selectedSession.finalOutput && (
                <div className="p-6 rounded-2xl bg-[#191c21] border border-[#4cd6fb]/40 shadow-xl space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#272a30]">
                    <span className="material-symbols-outlined text-base text-[#4cd6fb]">bolt</span>
                    <h4 className="font-bold text-sm text-[#e1e2e9]">Executive Synthesis</h4>
                  </div>
                  <div className="prose prose-invert max-w-none text-xs sm:text-sm text-[#e1e2e9] leading-relaxed">
                    <ReactMarkdown>{selectedSession.finalOutput}</ReactMarkdown>
                  </div>
                </div>
              )}

              {/* Debate Steps Log */}
              {selectedSession.steps && selectedSession.steps.length > 0 && (
                <div className="space-y-4">
                  <span className="font-mono text-xs text-[#869398] uppercase block font-semibold">
                    Multi-Model Debate Transcript ({selectedSession.steps.length} turns)
                  </span>

                  {selectedSession.steps.map((step, idx) => (
                    <div
                      key={step.stepId || idx}
                      className="p-4 rounded-xl bg-[#191c21] border border-[#272a30] space-y-2"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-[#272a30] text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#e1e2e9] capitalize">{step.agentName}</span>
                          <span className="text-[#869398] font-mono text-[11px]">({step.role})</span>
                        </div>
                        <span className="font-mono text-[11px] text-[#4cd6fb]">
                          {step.model}
                        </span>
                      </div>

                      <div className="prose prose-invert max-w-none text-xs sm:text-sm text-[#bcc9ce] leading-relaxed">
                        <ReactMarkdown>{step.content || ''}</ReactMarkdown>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-[#869398]">
            <span className="material-symbols-outlined text-4xl mb-2 text-[#3d494d]">history_edu</span>
            <p className="text-sm">Select a saved session on the left to inspect transcripts and evidence graphs.</p>
          </div>
        )}
      </div>
    </div>
  );
};
