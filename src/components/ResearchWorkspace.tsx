import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { apiClient } from '../services/apiClient';
import { providerConfigService } from '../services/providerConfigService';
import { PRESET_QUESTIONS } from '../data/presets';
import { DebateSession, DebateStep, DebateTone, SearchEngineProvider } from '../types';
import { saveSessions, loadSessions } from '../services/sessionStorage';
import { exportTranscriptAsMarkdown } from '../utils/exportTranscript';
import { pdfService } from '../services/pdfService';

interface ResearchWorkspaceProps {
  initialPrompt?: string;
}

export type StageName = 'Question' | 'Exploration' | 'Proposals' | 'Challenge' | 'Evidence' | 'Synthesis';

interface StageInfo {
  name: StageName;
  status: 'pending' | 'active' | 'completed' | 'skipped';
  summary?: string;
}

export const ResearchWorkspace: React.FC<ResearchWorkspaceProps> = ({ initialPrompt = '' }) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [depthName, setDepthName] = useState<'Solo' | 'Standard' | 'Deep'>('Standard');
  const [tone, setTone] = useState<DebateTone>('balanced');
  const [searchEngine, setSearchEngine] = useState<SearchEngineProvider>('duckduckgo');
  const [researchMethod, setResearchMethod] = useState<'adaptive' | 'systematic' | 'evidence-map' | 'comparative'>('adaptive');
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; content: string }[]>([]);
  const [attaching, setAttaching] = useState<boolean>(false);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentStatus, setCurrentStatus] = useState<string>('Ready for investigation');
  const [runLog, setRunLog] = useState<{ timestamp: string; message: string; type: string }[]>([]);
  const [steps, setSteps] = useState<DebateStep[]>([]);
  const [researchPlan, setResearchPlan] = useState<string[]>([]);
  const [searchGroundingSources, setSearchGroundingSources] = useState<any[]>([]);
  const [evidenceGraph, setEvidenceGraph] = useState<any>(null);
  const [finalOutput, setFinalOutput] = useState<string>('');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 6-Stage Tracker
  const [stages, setStages] = useState<StageInfo[]>([
    { name: 'Question', status: 'pending' },
    { name: 'Exploration', status: 'pending' },
    { name: 'Proposals', status: 'pending' },
    { name: 'Challenge', status: 'pending' },
    { name: 'Evidence', status: 'pending' },
    { name: 'Synthesis', status: 'pending' },
  ]);

  const abortControllerRef = useRef<AbortController | null>(null);
  const feedEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (initialPrompt && !isRunning) {
      setPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [steps, currentStatus, finalOutput]);

  const addLog = (message: string, type: string = 'info') => {
    const time = new Date().toLocaleTimeString();
    setRunLog((prev) => [...prev, { timestamp: time, message, type }]);
  };

  const updateStage = (name: StageName, status: StageInfo['status'], summary?: string) => {
    setStages((prev) =>
      prev.map((s) => (s.name === name ? { ...s, status, summary: summary || s.summary } : s))
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setAttaching(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
          const doc = await pdfService.loadFromFile(file);
          const fullText = doc.pages.map((p) => p.text).join('\n');
          setAttachedFiles((prev) => [...prev, { name: file.name, content: fullText.slice(0, 15000) }]);
        } else {
          const txt = await file.text();
          setAttachedFiles((prev) => [...prev, { name: file.name, content: txt.slice(0, 15000) }]);
        }
      }
    } catch (err: any) {
      alert(`Failed to load file: ${err.message}`);
    } finally {
      setAttaching(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachedFile = (idx: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleStartResearch = async (customPrompt?: string) => {
    const targetPrompt = customPrompt !== undefined ? customPrompt : prompt;
    if (!targetPrompt.trim() || isRunning) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Reset Execution State
    setIsRunning(true);
    setCurrentStatus('Formulating question and initializing council...');
    setRunLog([]);
    setSteps([]);
    setResearchPlan([]);
    setSearchGroundingSources([]);
    setEvidenceGraph(null);
    setFinalOutput('');
    setError(null);

    // Map Depth to selectedRound and protocol
    const roundMapping = {
      Solo: { round: 1, protocol: 'solo' as const },
      Standard: { round: 2, protocol: 'trio' as const },
      Deep: { round: 4, protocol: 'quad' as const },
    };
    const { round: selectedRound, protocol } = roundMapping[depthName];

    // Reset 6-Stage Tracker
    setStages([
      { name: 'Question', status: 'active', summary: targetPrompt.slice(0, 80) },
      { name: 'Exploration', status: 'pending' },
      { name: 'Proposals', status: 'pending' },
      { name: 'Challenge', status: selectedRound === 1 ? 'skipped' : 'pending' },
      { name: 'Evidence', status: selectedRound < 4 ? 'skipped' : 'pending' },
      { name: 'Synthesis', status: 'pending' },
    ]);

    addLog(`Investigation started with protocol: ${protocol.toUpperCase()} (${depthName}, ${selectedRound} rounds)`);
    updateStage('Question', 'completed');
    updateStage('Exploration', 'active');

    const config = providerConfigService.getConfig();
    const seats = providerConfigService.getSeatsPayload(config);
    const keys = providerConfigService.getKeys();

    // Prepare prompt with attachments if any
    let fullPrompt = targetPrompt;
    if (attachedFiles.length > 0) {
      const attachmentsText = attachedFiles
        .map((f) => `--- Attached Document: ${f.name} ---\n${f.content}\n--- End Document ---`)
        .join('\n\n');
      fullPrompt = `${targetPrompt}\n\n${attachmentsText}`;
    }

    const payload = {
      prompt: fullPrompt,
      protocol,
      selectedRound,
      tone,
      searchEngine: config.searchEngine || searchEngine,
      keys,
      seats,
      enableSearchGrounding: true,
      autoResolve: true,
      researchMethod: config.researchMethod || researchMethod,
      heartbeatEnabled: true,
      heartbeatIntervalSec: 30,
    };

    const newSessionId = `deb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setActiveSessionId(newSessionId);

    const liveSteps: DebateStep[] = [];

    try {
      await apiClient.streamDebate(payload, {
        signal: controller.signal,
        onNotice: (msg) => {
          addLog(msg, 'notice');
        },
        onEvent: (event) => {
          if (event.type === 'status') {
            const st = event.message || event.status || 'Processing...';
            setCurrentStatus(st);
            addLog(st, 'status');
          } else if (event.type === 'notice') {
            addLog(event.message, 'notice');
          } else if (event.type === 'research_plan') {
            setResearchPlan(event.plan || []);
            updateStage('Exploration', 'completed', `${(event.plan || []).length} inquiry tracks defined`);
            updateStage('Proposals', 'active');
            addLog(`Plan generated with ${(event.plan || []).length} branches`, 'event');
          } else if (event.type === 'search_grounding') {
            const sources = event.sources || [];
            setSearchGroundingSources(sources);
            addLog(`Grounded against ${sources.length} live search sources`, 'source');
          } else if (event.type === 'round_start') {
            const roundNum = event.round || 1;
            const newStep: DebateStep = {
              stepId: event.stepId || `step_${Date.now()}_${Math.random()}`,
              role: event.role || 'architect',
              agentName: event.agentName || event.role || 'Council Member',
              provider: event.provider || 'gemini',
              model: event.model || 'model',
              status: 'running',
              content: '',
              timestamp: Date.now(),
            };
            liveSteps.push(newStep);
            setSteps([...liveSteps]);

            if (roundNum === 1) {
              updateStage('Proposals', 'active', `Model: ${event.model || event.role}`);
            } else if (roundNum === 2) {
              updateStage('Proposals', 'completed');
              updateStage('Challenge', 'active', `Adversarial audit via ${event.model || event.role}`);
            } else if (roundNum === 3 || roundNum === 4) {
              updateStage('Challenge', 'completed');
              updateStage('Evidence', 'active', `Verification audit via ${event.model || event.role}`);
            }
            addLog(`Round ${roundNum} started: ${event.role} (${event.model || 'active model'})`, 'round');
          } else if (event.type === 'token') {
            const target = liveSteps.find((s) => s.role === event.role || s.stepId === event.stepId) || liveSteps[liveSteps.length - 1];
            if (target) {
              target.content = (target.content || '') + (event.token || '');
              setSteps([...liveSteps]);
            }
          } else if (event.type === 'round_complete') {
            const target = liveSteps.find((s) => s.role === event.role || s.stepId === event.stepId) || liveSteps[liveSteps.length - 1];
            if (target) {
              target.status = 'completed';
              target.content = event.content || target.content;
              target.usage = event.usage;
              setSteps([...liveSteps]);
            }
            addLog(`Round complete for ${event.role}`, 'round');
          } else if (event.type === 'evidence_graph') {
            setEvidenceGraph(event.graph);
            updateStage('Evidence', 'completed', `${event.graph?.claims?.length || 0} assertions mapped`);
            updateStage('Synthesis', 'active');
            addLog(`Evidence graph synthesized: ${event.graph?.claims?.length || 0} claims, ${event.graph?.sources?.length || 0} sources`, 'graph');
          } else if (event.type === 'complete') {
            const fin = event.finalOutput || event.content || '';
            setFinalOutput(fin);
            updateStage('Synthesis', 'completed', 'Final executive brief assembled');
            setCurrentStatus('Investigation Complete');
            addLog('Synthesis successfully committed to session vault', 'done');
          } else if (event.type === 'error') {
            setError(event.message || 'Research pipeline encountered an error');
            addLog(`Error: ${event.message}`, 'error');
          }
        },
      });

      const completedSession: DebateSession = {
        id: newSessionId,
        prompt: targetPrompt,
        protocol,
        tone,
        searchEngine,
        researchMethod,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: 'completed',
        steps: liveSteps,
        finalOutput,
        evidenceGraph,
      };

      const existing = loadSessions();
      saveSessions([completedSession, ...existing]);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Failed to complete research stream');
        addLog(`Stream failure: ${err.message}`, 'error');
      }
    } finally {
      setIsRunning(false);
    }
  };

  const handleStopResearch = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsRunning(false);
    setCurrentStatus('Research Stopped');
    addLog('User aborted the active investigation stream', 'warn');
  };

  const handleExport = () => {
    const session: DebateSession = {
      id: activeSessionId || `deb_${Date.now()}`,
      prompt,
      protocol: depthName === 'Solo' ? 'solo' : depthName === 'Deep' ? 'quad' : 'trio',
      tone,
      createdAt: Date.now(),
      status: 'completed',
      steps,
      finalOutput,
      evidenceGraph,
    };
    exportTranscriptAsMarkdown(session);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#111319] text-[#e1e2e9] overflow-hidden select-none">
      {/* Top Research Header Bar */}
      <div className="h-14 bg-[#141820] border-b border-[#272a30] px-4 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="material-symbols-outlined text-[#4cd6fb] text-xl">psychology</span>
          <span className="font-bold text-sm text-[#e1e2e9] truncate">Research Council</span>
          <span className="hidden sm:inline-block font-mono text-xs text-[#869398] truncate">
            ({depthName} Depth · {currentStatus})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isRunning ? (
            <button
              onClick={handleStopResearch}
              className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#93000a]/30 hover:bg-[#93000a]/50 text-[#ffb4ab] text-xs font-semibold border border-[#ffb4ab]/30 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm font-bold">stop</span>
              <span>Stop</span>
            </button>
          ) : (
            finalOutput && (
              <button
                onClick={handleExport}
                className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#1d2025] hover:bg-[#272a30] text-xs font-medium text-[#bcc9ce] border border-[#272a30] transition-colors"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                <span>Export Brief</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* 6-Stage Real-Time Tracker Strip */}
      <div className="bg-[#0b0e13] border-b border-[#272a30] px-3 py-2 overflow-x-auto shrink-0">
        <div className="flex items-center justify-between min-w-[640px] max-w-6xl mx-auto gap-2 text-xs">
          {stages.map((stage, idx) => {
            const isCompleted = stage.status === 'completed';
            const isActive = stage.status === 'active';
            const isSkipped = stage.status === 'skipped';

            return (
              <div key={stage.name} className="flex items-center gap-2 flex-1">
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border w-full transition-all ${
                    isActive
                      ? 'bg-[#272a30] border-[#4cd6fb] text-[#4cd6fb] shadow-sm'
                      : isCompleted
                      ? 'bg-[#191c21] border-[#4edea3]/40 text-[#4edea3]'
                      : isSkipped
                      ? 'bg-[#141820]/40 border-transparent text-[#869398]/50'
                      : 'bg-[#141820] border-[#272a30] text-[#869398]'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm shrink-0">
                    {isCompleted
                      ? 'check_circle'
                      : isActive
                      ? 'hourglass_top'
                      : isSkipped
                      ? 'block'
                      : 'radio_button_unchecked'}
                  </span>
                  <div className="overflow-hidden truncate">
                    <span className="font-semibold block truncate">{stage.name}</span>
                    {stage.summary && (
                      <span className="text-[10px] text-[#bcc9ce] font-mono block truncate">
                        {stage.summary}
                      </span>
                    )}
                  </div>
                </div>
                {idx < stages.length - 1 && (
                  <span className="material-symbols-outlined text-xs text-[#3d494d] shrink-0">
                    arrow_forward
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Container Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Zero State / Input Form (shown when nothing has run yet, or at the top) */}
        {steps.length === 0 && !isRunning && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-[#191c21] border border-[#272a30] rounded-2xl p-5 sm:p-7 shadow-xl space-y-4">
              <div>
                <h3 className="text-base font-bold text-[#e1e2e9]">Formulate Research Inquiry</h3>
                <p className="text-xs text-[#bcc9ce] mt-0.5">
                  Coordinate multiple frontier models to explore, cross-examine, and ground complex technical questions.
                </p>
              </div>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                placeholder="e.g., Quantify polysulfide dissolution suppression mechanisms in room-temperature Lithium-Sulfur cathodes..."
                className="w-full bg-[#111319] border border-[#272a30] rounded-xl p-3.5 text-sm text-[#e1e2e9] placeholder-[#869398] focus:outline-none focus:border-[#4cd6fb] resize-none leading-relaxed font-sans"
              />

              {/* Attachments List */}
              {attachedFiles.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="font-mono text-[10px] text-[#4cd6fb] uppercase">Attached Documents</span>
                  <div className="flex flex-wrap gap-2">
                    {attachedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#111319] border border-[#272a30] text-xs font-mono text-[#bcc9ce]"
                      >
                        <span className="material-symbols-outlined text-sm text-[#4edea3]">attachment</span>
                        <span className="truncate max-w-[200px]">{file.name}</span>
                        <button
                          onClick={() => removeAttachedFile(idx)}
                          className="text-[#869398] hover:text-[#ffb4ab]"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Protocol Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-[#bcc9ce] mb-1">Investigation Depth</label>
                  <select
                    value={depthName}
                    onChange={(e) => setDepthName(e.target.value as any)}
                    className="w-full bg-[#111319] border border-[#272a30] rounded-lg px-3 py-2 text-xs text-[#e1e2e9] focus:outline-none focus:border-[#4cd6fb]"
                  >
                    <option value="Solo">Solo (1 Round - Fast Scout)</option>
                    <option value="Standard">Standard (2 Rounds - Trio Council)</option>
                    <option value="Deep">Deep (4 Rounds - Quad Adversarial)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#bcc9ce] mb-1">Debate Tone</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as DebateTone)}
                    className="w-full bg-[#111319] border border-[#272a30] rounded-lg px-3 py-2 text-xs text-[#e1e2e9] focus:outline-none focus:border-[#4cd6fb]"
                  >
                    <option value="balanced">Balanced & Objective</option>
                    <option value="rigorous">Rigorous & Technical</option>
                    <option value="diplomatic">Diplomatic Synthesis</option>
                    <option value="aggressive">Adversarial Red-Teaming</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#bcc9ce] mb-1">Research Method</label>
                  <select
                    value={researchMethod}
                    onChange={(e) => setResearchMethod(e.target.value as any)}
                    className="w-full bg-[#111319] border border-[#272a30] rounded-lg px-3 py-2 text-xs text-[#e1e2e9] focus:outline-none focus:border-[#4cd6fb]"
                  >
                    <option value="adaptive">Adaptive Decomposition</option>
                    <option value="systematic">Systematic Literature Audit</option>
                    <option value="evidence-map">Evidence Node Mapping</option>
                    <option value="comparative">Comparative Matrix</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#272a30]">
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.txt,.md"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={attaching}
                    className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#111319] hover:bg-[#272a30] text-xs font-medium text-[#bcc9ce] border border-[#272a30] transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">attach_file</span>
                    <span>{attaching ? 'Parsing...' : 'Attach PDF / Text'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleStartResearch()}
                  disabled={!prompt.trim() || isRunning}
                  className="px-6 py-2.5 rounded-xl bg-[#4cd6fb] hover:bg-[#7bd0ff] text-[#003642] font-semibold text-xs shadow-md transition-all disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">rocket_launch</span>
                  <span>Begin Investigation</span>
                </button>
              </div>
            </div>

            {/* Presets Grid */}
            <div className="space-y-2">
              <span className="font-mono text-[10px] text-[#4cd6fb] uppercase font-semibold">
                Sample Research Inquiries
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {PRESET_QUESTIONS.slice(0, 3).map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setPrompt(preset.prompt);
                      handleStartResearch(preset.prompt);
                    }}
                    className="p-3.5 rounded-xl bg-[#191c21] hover:bg-[#272a30] border border-[#272a30] text-left transition-colors flex flex-col justify-between h-28 cursor-pointer group"
                  >
                    <span className="font-mono text-[10px] text-[#869398] group-hover:text-[#4cd6fb] line-clamp-1">
                      {preset.category}
                    </span>
                    <p className="text-xs font-semibold text-[#e1e2e9] line-clamp-2 mt-1">
                      {preset.title}
                    </p>
                    <span className="text-[10px] text-[#869398] font-mono mt-1">
                      Click to launch →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Live Active Research Feed */}
        {(steps.length > 0 || isRunning) && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Active Inquiry Header Card */}
            <div className="p-4 rounded-xl bg-[#191c21] border border-[#272a30] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-mono text-[10px] text-[#4cd6fb] uppercase">Active Inquiry</span>
                <p className="font-semibold text-sm text-[#e1e2e9] mt-0.5 leading-snug">{prompt}</p>
              </div>
              <div className="shrink-0 flex items-center gap-2 font-mono text-xs text-[#bcc9ce]">
                <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-[#4cd6fb] animate-pulse' : 'bg-[#4edea3]'}`}></span>
                <span>{currentStatus}</span>
              </div>
            </div>

            {/* Research Plan Track (if generated) */}
            {researchPlan.length > 0 && (
              <div className="p-4 rounded-xl bg-[#0b0e13] border border-[#272a30] space-y-2">
                <span className="font-mono text-[10px] text-[#4cd6fb] uppercase font-semibold">
                  Decomposed Research Plan ({researchPlan.length} steps)
                </span>
                <ul className="space-y-1 text-xs text-[#bcc9ce]">
                  {researchPlan.map((track, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-mono text-[10px] text-[#4cd6fb] mt-0.5">{i + 1}.</span>
                      <span>{track}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Live Steps Streams */}
            <div className="space-y-4">
              {steps.map((step, idx) => (
                <div key={step.stepId || idx} className="rounded-xl bg-[#191c21] border border-[#272a30] overflow-hidden shadow-sm">
                  <div className="px-4 py-2.5 bg-[#141820] border-b border-[#272a30] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#4cd6fb]"></span>
                      <span className="font-bold text-[#e1e2e9] capitalize">{step.agentName}</span>
                      <span className="text-[#869398] font-mono text-[11px]">({step.role})</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[11px] text-[#869398]">
                      <span>{step.model}</span>
                      <span>·</span>
                      <span className={step.status === 'running' ? 'text-[#4cd6fb] animate-pulse' : 'text-[#4edea3]'}>
                        {step.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 prose prose-invert max-w-none text-xs sm:text-sm text-[#e1e2e9] leading-relaxed">
                    <ReactMarkdown>{step.content || '*Awaiting output stream...*'}</ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>

            {/* Evidence Graph Claims & Sources (if populated) */}
            {evidenceGraph && (
              <div className="p-5 rounded-2xl bg-[#191c21] border border-[#272a30] space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#272a30]">
                  <span className="font-mono text-xs text-[#4edea3] uppercase font-semibold">
                    Evidence Graph & Assertions
                  </span>
                  <span className="font-mono text-xs text-[#869398]">
                    {evidenceGraph.claims?.length || 0} claims · {evidenceGraph.sources?.length || 0} sources
                  </span>
                </div>

                {evidenceGraph.claims?.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-[#bcc9ce]">Verified Assertions:</span>
                    <div className="space-y-1.5">
                      {evidenceGraph.claims.map((claim: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg bg-[#111319] border border-[#272a30] text-xs flex items-start justify-between gap-3"
                        >
                          <div className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-sm text-[#4edea3] mt-0.5">verified</span>
                            <span className="text-[#e1e2e9]">{claim.text || claim.statement}</span>
                          </div>
                          {claim.confidence !== undefined && (
                            <span className="font-mono text-[10px] text-[#869398] shrink-0">
                              conf: {claim.confidence}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {evidenceGraph.sources?.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-semibold text-[#bcc9ce]">Grounded Sources:</span>
                    <div className="flex flex-wrap gap-2">
                      {evidenceGraph.sources.map((src: any, idx: number) => (
                        <a
                          key={idx}
                          href={src.url || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded bg-[#111319] border border-[#272a30] hover:border-[#4cd6fb] text-[11px] font-mono text-[#4cd6fb] flex items-center gap-1 truncate max-w-sm"
                        >
                          <span className="material-symbols-outlined text-xs">link</span>
                          <span className="truncate">{src.title || src.url || 'Source'}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Final Synthesis Output (Markdown) */}
            {finalOutput && (
              <div className="p-6 rounded-2xl bg-[#141820] border border-[#4cd6fb]/40 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#272a30]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-[#4cd6fb]">bolt</span>
                    <h3 className="font-bold text-base text-[#e1e2e9]">Definitive Synthesis Brief</h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded bg-[#4edea3]/10 text-[#4edea3] font-mono text-xs border border-[#4edea3]/30">
                    Consensus Committed
                  </span>
                </div>

                <div className="prose prose-invert max-w-none text-sm text-[#e1e2e9] leading-relaxed">
                  <ReactMarkdown>{finalOutput}</ReactMarkdown>
                </div>
              </div>
            )}

            {/* Run Log Strip */}
            {runLog.length > 0 && (
              <div className="p-3 rounded-xl bg-[#0c0a09] border border-[#272a30] space-y-1">
                <div className="flex items-center justify-between pb-1 border-b border-[#272a30]/40 text-[10px] font-mono text-[#869398]">
                  <span>Execution Stream Log</span>
                  <span>{runLog.length} events</span>
                </div>
                <div className="max-h-32 overflow-y-auto font-mono text-[11px] text-[#bcc9ce] space-y-0.5">
                  {runLog.map((log, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-[#869398]">{log.timestamp}</span>
                      <span>{log.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-[#93000a]/20 border border-[#ffb4ab]/30 text-[#ffdad6] text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-[#ffb4ab]">error</span>
                <span>{error}</span>
              </div>
            )}

            <div ref={feedEndRef} />
          </div>
        )}
      </div>
    </div>
  );
};
