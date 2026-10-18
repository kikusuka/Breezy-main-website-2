import React, { useState, useEffect, useRef } from 'react';
import {
  GitHubIde,
  IdeWorkspace,
  runPython,
  runJavaScript,
  buildPreviewDoc,
  askIdeAgent,
  languageOf,
  isRunnable,
  getGitHubToken,
  setGitHubToken,
  TreeEntry,
  OpenFile,
  RunResult,
  AgentEdit,
  pythonRuntimeState,
} from '../services/ideService';

type TabView = 'files' | 'editor' | 'output' | 'agent';

export const BuildWorkspace: React.FC = () => {
  // Authentication & Repository State
  const [token, setToken] = useState<string>(getGitHubToken());
  const [tokenInput, setTokenInput] = useState<string>(getGitHubToken());
  const [repoInput, setRepoInput] = useState<string>('kikusuka/Breezy-main-website-2');
  const [connectedRepo, setConnectedRepo] = useState<string | null>(null);
  const [defaultBranch, setDefaultBranch] = useState<string>('main');
  const [treeEntries, setTreeEntries] = useState<TreeEntry[]>([]);
  const [treeLoading, setTreeLoading] = useState<boolean>(false);
  const [treeError, setTreeError] = useState<string | null>(null);

  // Workspace & Buffers State
  const [workspace] = useState<IdeWorkspace>(() => new IdeWorkspace());
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([]);
  const [activePath, setActivePath] = useState<string | null>(null);
  const [, setDirtyTick] = useState<number>(0);

  // Responsive Layout Mobile View: 'files' | 'editor' | 'output' | 'agent'
  const [mobileTab, setMobileTab] = useState<TabView>('editor');
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false); // 768-1279px file drawer

  // Console & Preview State
  const [consoleTab, setConsoleTab] = useState<'console' | 'preview' | 'agent'>('console');
  const [consoleLogs, setConsoleLogs] = useState<string>('Console ready. Run .py or .js files to inspect standard output.\n');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [htmlPreviewDoc, setHtmlPreviewDoc] = useState<string | null>(null);

  // Agent State
  const [agentInstruction, setAgentInstruction] = useState<string>('');
  const [agentThinking, setAgentThinking] = useState<boolean>(false);
  const [agentError, setAgentError] = useState<string | null>(null);
  const [agentReplyText, setAgentReplyText] = useState<string | null>(null);
  const [agentEdits, setAgentEdits] = useState<AgentEdit[]>([]);

  // Dialogs
  const [newFilePathInput, setNewFilePathInput] = useState<string>('');
  const [showNewFileDialog, setShowNewFileDialog] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const syncWorkspaceState = () => {
    setOpenFiles([...workspace.list()]);
    setActivePath(workspace.active);
    setDirtyTick((t) => t + 1);
  };

  const handleSaveToken = () => {
    const trimmed = tokenInput.trim();
    setGitHubToken(trimmed);
    setToken(trimmed);
  };

  const loadRepository = async (repoName: string) => {
    if (!token) {
      setTreeError('Please enter a GitHub Personal Access Token first.');
      return;
    }
    setTreeLoading(true);
    setTreeError(null);
    try {
      const { entries, branch } = await GitHubIde.getTree(token, repoName);
      setTreeEntries(entries);
      setDefaultBranch(branch);
      setConnectedRepo(repoName);
      // Auto-open README.md or first file if available
      const readme = entries.find((e) => e.type === 'file' && /readme\.md$/i.test(e.path));
      const firstFile = readme || entries.find((e) => e.type === 'file');
      if (firstFile) {
        await handleOpenFile(firstFile.path);
      }
    } catch (err: any) {
      setTreeError(err.message || 'Failed to fetch repository tree');
      setConnectedRepo(null);
    } finally {
      setTreeLoading(false);
    }
  };

  const handleOpenFile = async (path: string) => {
    const existing = workspace.get(path);
    if (existing) {
      workspace.active = path;
      syncWorkspaceState();
      setMobileTab('editor');
      setDrawerOpen(false);
      return;
    }
    if (!token || !connectedRepo) return;
    try {
      const details = await GitHubIde.readFile(token, connectedRepo, path);
      workspace.open(path, details.content, details.sha);
      syncWorkspaceState();
      setMobileTab('editor');
      setDrawerOpen(false);
    } catch (err: any) {
      setConsoleLogs((prev) => `${prev}\n[Error opening ${path}]: ${err.message}`);
    }
  };

  const handleCreateNewFile = () => {
    const p = newFilePathInput.trim().replace(/^\/+/, '');
    if (!p) return;
    try {
      workspace.create(p, '');
      syncWorkspaceState();
      setNewFilePathInput('');
      setShowNewFileDialog(false);
      setMobileTab('editor');
      setDrawerOpen(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteFile = async (path: string) => {
    const confirmed = window.confirm(`Permanently delete "${path}" on branch ${defaultBranch}?`);
    if (!confirmed) return;
    const file = workspace.get(path);
    if (file?.isNew) {
      workspace.close(path);
      syncWorkspaceState();
      return;
    }
    if (!token || !connectedRepo || !file?.sha) {
      alert('Cannot delete: missing file metadata or SHA.');
      return;
    }
    try {
      await GitHubIde.deleteFile(token, connectedRepo, path, file.sha);
      workspace.close(path);
      syncWorkspaceState();
      setConsoleLogs((prev) => `${prev}\n[Deleted]: ${path} on branch ${defaultBranch}`);
      await loadRepository(connectedRepo);
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleSaveActiveFile = async () => {
    if (!activePath || !token || !connectedRepo) return;
    setSaveStatus('Saving to GitHub default branch...');
    try {
      await workspace.save(token, connectedRepo, activePath);
      syncWorkspaceState();
      setSaveStatus('Saved and committed successfully!');
      setTimeout(() => setSaveStatus(null), 3000);
      setConsoleLogs((prev) => `${prev}\n[Committed]: ${activePath} to branch ${defaultBranch}`);
    } catch (err: any) {
      setSaveStatus(null);
      alert(`Save failed: ${err.message}`);
    }
  };

  const handleEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!activePath) return;
    workspace.edit(activePath, e.target.value);
    syncWorkspaceState();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const val = target.value;
      const nextVal = val.substring(0, start) + '  ' + val.substring(end);
      if (activePath) {
        workspace.edit(activePath, nextVal);
        syncWorkspaceState();
      }
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  const handleRunCode = async () => {
    if (!activePath) return;
    const lang = languageOf(activePath);
    const activeFile = workspace.get(activePath);
    if (!activeFile) return;

    if (lang === 'html') {
      const filesMap: Record<string, string> = {};
      openFiles.forEach((f) => {
        filesMap[f.path] = f.content;
      });
      try {
        const doc = buildPreviewDoc(activePath, filesMap);
        setHtmlPreviewDoc(doc);
        setConsoleTab('preview');
        setMobileTab('output');
      } catch (err: any) {
        setConsoleLogs((prev) => `${prev}\n[Preview Error]: ${err.message}`);
        setConsoleTab('console');
        setMobileTab('output');
      }
      return;
    }

    if (lang !== 'python' && lang !== 'javascript') {
      alert(`Execution not supported for language: ${lang}. Supported: python, javascript, html preview.`);
      return;
    }

    setIsRunning(true);
    setConsoleTab('console');
    setMobileTab('output');
    setConsoleLogs((prev) => `${prev}\n--- Running ${activePath} (${lang}) ---`);

    try {
      let res: RunResult;
      if (lang === 'python') {
        setConsoleLogs((prev) => `${prev}\n[Pyodide]: Initializing Python runtime (may take a few seconds on first run)...`);
        res = await runPython(activeFile.content);
      } else {
        res = await runJavaScript(activeFile.content, 5000);
      }

      let logOut = `Execution completed in ${res.durationMs}ms\n`;
      if (res.stdout) logOut += `[stdout]\n${res.stdout}\n`;
      if (res.stderr) logOut += `[stderr]\n${res.stderr}\n`;
      if (res.error) logOut += `[error]\n${res.error}\n`;
      setConsoleLogs((prev) => `${prev}\n${logOut}`);
    } catch (err: any) {
      setConsoleLogs((prev) => `${prev}\n[Runtime Failure]: ${err.message}\n`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleAskAgent = async () => {
    if (!agentInstruction.trim()) return;
    setAgentThinking(true);
    setAgentError(null);
    setAgentReplyText(null);
    setAgentEdits([]);
    setConsoleTab('agent');

    const filesMap: Record<string, string> = {};
    openFiles.slice(0, 8).forEach((f) => {
      filesMap[f.path] = f.content;
    });

    try {
      const result = await askIdeAgent({
        instruction: agentInstruction.trim(),
        activePath: activePath || undefined,
        files: filesMap,
      });
      setAgentReplyText(result.text);
      setAgentEdits(result.edits);
    } catch (err: any) {
      setAgentError(err.message || 'Failed to get agent suggestions.');
    } finally {
      setAgentThinking(false);
    }
  };

  const handleApplyAgentEdit = (edit: AgentEdit) => {
    const existing = workspace.get(edit.path);
    if (existing) {
      workspace.edit(edit.path, edit.content);
      workspace.active = edit.path;
    } else {
      workspace.create(edit.path, edit.content);
    }
    syncWorkspaceState();
    setConsoleLogs((prev) => `${prev}\n[Agent Applied]: Updated buffer for ${edit.path} (press Save to commit).`);
  };

  const currentActiveFile = activePath ? workspace.get(activePath) : null;
  const isRunnableFile = activePath ? isRunnable(activePath) : false;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0c0a09] text-[#e1e2e9] overflow-hidden select-none">
      {/* Top IDE Toolbar */}
      <div className="h-14 bg-[#141820] border-b border-[#272a30] px-3 sm:px-4 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1d2025] border border-[#272a30]">
            <span className="material-symbols-outlined text-sm text-[#4cd6fb]">terminal</span>
            <span className="font-mono text-xs font-semibold text-[#e1e2e9]">Build IDE</span>
          </div>

          {connectedRepo ? (
            <div className="flex items-center gap-1.5 text-xs text-[#bcc9ce] font-mono truncate">
              <span className="text-[#869398]">/</span>
              <span className="text-[#4cd6fb] font-medium truncate">{connectedRepo}</span>
              <span className="text-[10px] text-[#869398]">({defaultBranch})</span>
            </div>
          ) : (
            <span className="text-xs text-[#869398] truncate hidden sm:inline">No repository loaded</span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {saveStatus && (
            <span className="text-xs font-mono text-[#4edea3] truncate hidden md:inline">
              {saveStatus}
            </span>
          )}

          {activePath && (
            <button
              onClick={handleSaveActiveFile}
              disabled={!workspace.isDirty(activePath)}
              className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#1d2025] hover:bg-[#272a30] text-xs font-medium text-[#e1e2e9] border border-[#3d494d]/40 disabled:opacity-40 transition-colors"
              title="Commit file changes to GitHub default branch"
            >
              <span className="material-symbols-outlined text-sm text-[#4cd6fb]">save</span>
              <span className="hidden sm:inline">Save</span>
              {workspace.isDirty(activePath) && <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]"></span>}
            </button>
          )}

          {isRunnableFile && (
            <button
              onClick={handleRunCode}
              disabled={isRunning}
              className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#4cd6fb] hover:bg-[#7bd0ff] text-[#003642] text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm font-bold">
                {languageOf(activePath!) === 'html' ? 'visibility' : 'play_arrow'}
              </span>
              <span>{languageOf(activePath!) === 'html' ? 'Preview' : isRunning ? 'Running...' : 'Run'}</span>
            </button>
          )}

          {/* 768-1279px File Drawer Toggle */}
          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="hidden md:flex lg:hidden items-center gap-1 px-2.5 py-1.5 rounded bg-[#1d2025] text-xs text-[#bcc9ce] border border-[#272a30]"
          >
            <span className="material-symbols-outlined text-sm">folder</span>
            <span>Files</span>
          </button>
        </div>
      </div>

      {/* Mobile-Only Segmented Control (<768px) */}
      <div className="md:hidden flex items-center bg-[#141820] border-b border-[#272a30] p-1 gap-1">
        {(['files', 'editor', 'output', 'agent'] as TabView[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={`flex-1 py-1.5 text-xs font-medium rounded capitalize transition-colors ${
              mobileTab === tab
                ? 'bg-[#272a30] text-[#4cd6fb] font-semibold shadow-sm'
                : 'text-[#869398] hover:text-[#e1e2e9]'
            }`}
          >
            {tab === 'output' ? 'Console' : tab}
          </button>
        ))}
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ============================================================== */}
        {/* COLUMN 1: File Tree (Desktop >=1280px or Drawer 768-1279px or Mobile tab) */}
        {/* ============================================================== */}
        <div
          className={`
            ${drawerOpen ? 'flex fixed inset-y-14 left-0 z-40 w-72 shadow-2xl bg-[#141820]' : 'hidden'}
            lg:flex lg:static lg:w-64 lg:shadow-none
            ${mobileTab === 'files' ? '!flex fixed inset-x-0 bottom-14 top-24 z-30 w-full' : ''}
            flex-col bg-[#111319] border-r border-[#272a30] shrink-0 overflow-hidden
          `}
        >
          {/* GitHub Connection Box */}
          <div className="p-3 border-b border-[#272a30] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#4cd6fb] uppercase tracking-wider font-semibold">
                GitHub Repository
              </span>
              {drawerOpen && (
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="lg:hidden text-[#869398] hover:text-[#e1e2e9]"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              <input
                type="password"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="GitHub PAT (repo scope)"
                className="w-full bg-[#191c21] border border-[#272a30] rounded px-2.5 py-1 text-xs text-[#e1e2e9] placeholder-[#869398] focus:outline-none focus:border-[#4cd6fb]"
              />
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={repoInput}
                  onChange={(e) => setRepoInput(e.target.value)}
                  placeholder="owner/repo"
                  className="flex-1 bg-[#191c21] border border-[#272a30] rounded px-2.5 py-1 text-xs text-[#e1e2e9] placeholder-[#869398] focus:outline-none focus:border-[#4cd6fb]"
                />
                <button
                  onClick={() => {
                    handleSaveToken();
                    loadRepository(repoInput.trim());
                  }}
                  disabled={treeLoading || !repoInput.trim()}
                  className="px-2.5 py-1 rounded bg-[#272a30] hover:bg-[#32353a] text-xs font-semibold text-[#4cd6fb] border border-[#3d494d]/40 disabled:opacity-40"
                >
                  {treeLoading ? '...' : 'Load'}
                </button>
              </div>
            </div>

            {treeError && <p className="text-[11px] text-[#ffb4ab] leading-snug">{treeError}</p>}
          </div>

          {/* File Operations Bar */}
          <div className="px-3 py-1.5 bg-[#141820] border-b border-[#272a30] flex items-center justify-between text-xs text-[#bcc9ce]">
            <span className="font-mono text-[11px] uppercase tracking-wider">Tree Explorer</span>
            <button
              onClick={() => setShowNewFileDialog(true)}
              className="p-1 rounded hover:bg-[#272a30] text-[#4cd6fb] flex items-center gap-1 text-[11px]"
              title="New File"
            >
              <span className="material-symbols-outlined text-sm">note_add</span>
              <span>New</span>
            </button>
          </div>

          {/* New File Input Overlay */}
          {showNewFileDialog && (
            <div className="p-2.5 bg-[#1d2025] border-b border-[#272a30] space-y-1.5">
              <span className="text-[10px] text-[#bcc9ce] font-mono">Create new file:</span>
              <div className="flex gap-1">
                <input
                  type="text"
                  value={newFilePathInput}
                  onChange={(e) => setNewFilePathInput(e.target.value)}
                  placeholder="e.g. src/utils.py"
                  className="flex-1 bg-[#0c0a09] border border-[#272a30] rounded px-2 py-1 text-xs text-[#e1e2e9]"
                />
                <button
                  onClick={handleCreateNewFile}
                  className="px-2 py-1 rounded bg-[#4cd6fb] text-[#003642] text-xs font-bold"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowNewFileDialog(false)}
                  className="px-2 py-1 rounded bg-[#272a30] text-xs text-[#bcc9ce]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Files List */}
          <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 text-xs font-mono">
            {treeEntries.length === 0 && !treeLoading && (
              <p className="p-3 text-[11px] text-[#869398] text-center font-sans">
                Connect your GitHub repository to inspect and edit code.
              </p>
            )}

            {treeEntries.map((entry) => {
              const isDir = entry.type === 'dir';
              const isOpen = openFiles.some((f) => f.path === entry.path);
              const isActive = activePath === entry.path;
              const isDirty = workspace.isDirty(entry.path);

              return (
                <div
                  key={entry.path}
                  onClick={() => !isDir && handleOpenFile(entry.path)}
                  className={`
                    group flex items-center justify-between px-2 py-1 rounded cursor-pointer transition-colors
                    ${isActive ? 'bg-[#272a30] text-[#4cd6fb]' : 'text-[#bcc9ce] hover:bg-[#1d2025] hover:text-[#e1e2e9]'}
                    ${isDir ? 'opacity-60 cursor-default' : ''}
                  `}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="material-symbols-outlined text-[15px] text-[#869398]">
                      {isDir ? 'folder' : 'description'}
                    </span>
                    <span className="truncate">{entry.path}</span>
                  </div>

                  {!isDir && (
                    <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100">
                      {isDirty && <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]"></span>}
                      {isOpen && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFile(entry.path);
                          }}
                          className="text-[#869398] hover:text-[#ffb4ab] p-0.5"
                          title="Delete file"
                        >
                          <span className="material-symbols-outlined text-xs">delete</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ============================================================== */}
        {/* COLUMN 2: Editor Center Column */}
        {/* ============================================================== */}
        <div
          className={`
            ${mobileTab === 'editor' ? 'flex' : 'hidden md:flex'}
            flex-1 flex-col overflow-hidden bg-[#111319] min-w-0
          `}
        >
          {/* Open Tabs Strip */}
          <div className="h-10 bg-[#141820] border-b border-[#272a30] flex items-center overflow-x-auto px-2 gap-1 shrink-0">
            {openFiles.length === 0 ? (
              <span className="text-xs text-[#869398] px-2 font-mono">No files open</span>
            ) : (
              openFiles.map((file) => {
                const isActive = file.path === activePath;
                const dirty = workspace.isDirty(file.path);
                return (
                  <div
                    key={file.path}
                    onClick={() => {
                      workspace.active = file.path;
                      syncWorkspaceState();
                    }}
                    className={`
                      flex items-center gap-2 px-3 py-1.5 rounded-t text-xs font-mono cursor-pointer border-t-2 shrink-0
                      ${
                        isActive
                          ? 'bg-[#191c21] text-[#4cd6fb] border-[#4cd6fb]'
                          : 'bg-[#111319] text-[#869398] border-transparent hover:text-[#e1e2e9]'
                      }
                    `}
                  >
                    <span>{file.path.split('/').pop()}</span>
                    {dirty && <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]"></span>}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        workspace.close(file.path);
                        syncWorkspaceState();
                      }}
                      className="text-[#869398] hover:text-[#e1e2e9] text-xs ml-1"
                    >
                      ×
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Plain Textarea Editor (Monospace, Tab space insertion, text-base 16px min for mobile) */}
          <div className="flex-1 relative overflow-hidden bg-[#0c0a09]">
            {currentActiveFile ? (
              <textarea
                ref={textareaRef}
                value={currentActiveFile.content}
                onChange={handleEditorChange}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                className="w-full h-full p-4 bg-transparent text-[#e1e2e9] font-mono text-base sm:text-sm leading-relaxed resize-none focus:outline-none selection:bg-[#00414f] selection:text-[#7bd0ff]"
                placeholder="Write code here..."
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-[#869398]">
                <span className="material-symbols-outlined text-4xl mb-2 text-[#3d494d]">code</span>
                <p className="text-sm font-sans">Select a file from the explorer or create a new file to start editing.</p>
                <p className="text-xs font-mono text-[#4cd6fb] mt-2">Commits will be committed directly to default branch ({defaultBranch})</p>
              </div>
            )}
          </div>

          {/* Active File Metadata Bar */}
          {currentActiveFile && (
            <div className="h-7 bg-[#141820] border-t border-[#272a30] px-3 flex items-center justify-between text-[11px] font-mono text-[#869398] shrink-0">
              <div className="flex items-center gap-2">
                <span>{currentActiveFile.path}</span>
                <span>·</span>
                <span className="text-[#4cd6fb] uppercase">{languageOf(currentActiveFile.path)}</span>
              </div>
              <div>
                <span>{currentActiveFile.content.split('\n').length} lines</span>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* COLUMN 3: Console / Preview / Agent Panel */}
        {/* (Desktop >=1280px = right column; 768-1279px = toggleable bottom panel; <768px = mobileTab) */}
        {/* ============================================================== */}
        <div
          className={`
            ${mobileTab === 'output' || mobileTab === 'agent' ? '!flex fixed inset-x-0 bottom-14 top-24 z-30 w-full' : 'hidden'}
            xl:flex xl:w-96 xl:static
            flex-col bg-[#111319] border-l border-[#272a30] shrink-0 overflow-hidden
          `}
        >
          {/* Subtabs for Panel */}
          <div className="h-10 bg-[#141820] border-b border-[#272a30] px-2 flex items-center gap-1 shrink-0">
            <button
              onClick={() => setConsoleTab('console')}
              className={`px-3 py-1.5 rounded text-xs font-medium capitalize flex items-center gap-1.5 ${
                consoleTab === 'console'
                  ? 'bg-[#272a30] text-[#4cd6fb] font-semibold'
                  : 'text-[#869398] hover:text-[#e1e2e9]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">terminal</span>
              <span>Console</span>
            </button>
            <button
              onClick={() => setConsoleTab('preview')}
              className={`px-3 py-1.5 rounded text-xs font-medium capitalize flex items-center gap-1.5 ${
                consoleTab === 'preview'
                  ? 'bg-[#272a30] text-[#4cd6fb] font-semibold'
                  : 'text-[#869398] hover:text-[#e1e2e9]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">visibility</span>
              <span>HTML Preview</span>
            </button>
            <button
              onClick={() => setConsoleTab('agent')}
              className={`px-3 py-1.5 rounded text-xs font-medium capitalize flex items-center gap-1.5 ${
                consoleTab === 'agent'
                  ? 'bg-[#272a30] text-[#4cd6fb] font-semibold'
                  : 'text-[#869398] hover:text-[#e1e2e9]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">smart_toy</span>
              <span>Coding Agent</span>
            </button>
          </div>

          {/* Tab 1: Console Output */}
          {consoleTab === 'console' && (
            <div className="flex-1 flex flex-col p-3 overflow-hidden bg-[#0c0a09]">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#272a30] text-[11px] font-mono text-[#869398]">
                <span>Pyodide & Worker Runtime</span>
                <button
                  onClick={() => setConsoleLogs('Console cleared.\n')}
                  className="hover:text-[#e1e2e9]"
                >
                  Clear
                </button>
              </div>
              <pre className="flex-1 overflow-y-auto font-mono text-xs text-[#bcc9ce] leading-relaxed whitespace-pre-wrap selection:bg-[#00414f]">
                {consoleLogs}
              </pre>
              <div className="pt-2 border-t border-[#272a30] text-[10px] text-[#869398] font-mono">
                Note: Browser sandbox only. Python downloads on first run and long loops may freeze the tab.
              </div>
            </div>
          )}

          {/* Tab 2: HTML Sandboxed Preview */}
          {consoleTab === 'preview' && (
            <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
              {htmlPreviewDoc ? (
                <iframe
                  title="HTML Preview Sandbox"
                  sandbox="allow-scripts"
                  srcDoc={htmlPreviewDoc}
                  className="w-full h-full border-0"
                />
              ) : (
                <div className="flex-1 flex items-center justify-center p-6 text-center text-slate-500 font-sans text-xs">
                  Open an .html file and click "Preview" to inspect rendered HTML with inlined assets.
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Coding Agent */}
          {consoleTab === 'agent' && (
            <div className="flex-1 flex flex-col p-3 bg-[#111319] overflow-hidden space-y-3">
              <div className="space-y-1">
                <span className="font-mono text-[10px] text-[#4cd6fb] uppercase font-semibold">
                  Breezy AI Agent (askIdeAgent)
                </span>
                <p className="text-xs text-[#bcc9ce] leading-snug">
                  Ask configured frontier models to inspect open buffers and suggest complete file replacements.
                </p>
              </div>

              <div className="space-y-2">
                <textarea
                  value={agentInstruction}
                  onChange={(e) => setAgentInstruction(e.target.value)}
                  placeholder="e.g. Add input validation and error handling to this script..."
                  rows={3}
                  className="w-full bg-[#191c21] border border-[#272a30] rounded p-2 text-xs text-[#e1e2e9] placeholder-[#869398] focus:outline-none focus:border-[#4cd6fb] resize-none"
                />
                <button
                  onClick={handleAskAgent}
                  disabled={agentThinking || !agentInstruction.trim()}
                  className="w-full py-2 rounded bg-[#4cd6fb] text-[#003642] font-semibold text-xs hover:bg-[#7bd0ff] disabled:opacity-40 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">psychology</span>
                  <span>{agentThinking ? 'Synthesizing Edits...' : 'Propose Changes'}</span>
                </button>
              </div>

              {agentError && (
                <div className="p-2.5 rounded bg-[#93000a]/20 border border-[#ffb4ab]/30 text-[#ffdad6] text-xs">
                  {agentError}
                </div>
              )}

              {/* Agent Reply & Diff Cards */}
              <div className="flex-1 overflow-y-auto space-y-3 pt-2">
                {agentReplyText && (
                  <div className="p-2.5 rounded bg-[#191c21] border border-[#272a30] text-xs text-[#e1e2e9] leading-relaxed">
                    <p className="font-semibold text-[#4cd6fb] mb-1">Agent Rationale:</p>
                    <p className="whitespace-pre-wrap">{agentReplyText.replace(/```file:[^\n`]+\n[\s\S]*?\n```/g, '').trim()}</p>
                  </div>
                )}

                {agentEdits.length > 0 && (
                  <div className="space-y-2">
                    <span className="font-mono text-[10px] text-[#4edea3] uppercase font-semibold">
                      Proposed File Blocks ({agentEdits.length})
                    </span>
                    {agentEdits.map((edit, idx) => (
                      <div key={idx} className="p-2.5 rounded bg-[#191c21] border border-[#272a30] space-y-2">
                        <div className="flex items-center justify-between font-mono text-xs">
                          <span className="text-[#4cd6fb] truncate">{edit.path}</span>
                          <button
                            onClick={() => handleApplyAgentEdit(edit)}
                            className="px-2 py-0.5 rounded bg-[#4edea3] text-[#003822] text-[11px] font-bold hover:bg-[#6cf2b6]"
                          >
                            Apply to Buffer
                          </button>
                        </div>
                        <pre className="p-2 rounded bg-[#0c0a09] font-mono text-[11px] text-[#bcc9ce] max-h-36 overflow-y-auto whitespace-pre-wrap">
                          {edit.content}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
