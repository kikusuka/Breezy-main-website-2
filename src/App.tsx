import React, { useState, useEffect } from 'react';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { LandingView } from './components/LandingView';
import { ResearchWorkspace } from './components/ResearchWorkspace';
import { ChatWorkspace } from './components/ChatWorkspace';
import { BuildWorkspace } from './components/BuildWorkspace';
import { CanvasWorkspace } from './components/CanvasWorkspace';
import { NotesWorkspace } from './components/NotesWorkspace';
import { VaultWorkspace } from './components/VaultWorkspace';
import { HistoryWorkspace } from './components/HistoryWorkspace';
import { DocsWorkspace } from './components/DocsWorkspace';
import { SettingsWorkspace } from './components/SettingsWorkspace';
import { ProfileWorkspace } from './components/ProfileWorkspace';
import { BreezyLogo } from './components/BreezyLogo';
import { apiClient } from './services/apiClient';

const parseHash = (): ActiveTab => {
  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
  const validTabs: ActiveTab[] = [
    'landing',
    'research',
    'chat',
    'build',
    'canvas',
    'notes',
    'models',
    'history',
    'docs',
    'settings',
    'profile',
  ];
  if (validTabs.includes(hash as ActiveTab)) {
    return hash as ActiveTab;
  }
  return 'landing';
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>(parseHash);
  const [backendOnline, setBackendOnline] = useState<boolean>(true);
  const [endpointName, setEndpointName] = useState<string>('Breezy Backend');
  const [initialSearchQuery, setInitialSearchQuery] = useState<string>('');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);

  // Sync hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const nextTab = parseHash();
      setActiveTab(nextTab);
      setMobileDrawerOpen(false);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Backend Health Check & Ping
  useEffect(() => {
    const checkBackend = async () => {
      const ok = await apiClient.checkHealth(true);
      setBackendOnline(ok);
      const active = apiClient.getActiveEndpoint();
      setEndpointName(active.name);
    };

    checkBackend();
    const interval = setInterval(checkBackend, 30000);

    const unsub = apiClient.subscribe((state) => {
      setBackendOnline(state.isOnline);
      setEndpointName(state.activeName);
    });

    return () => {
      clearInterval(interval);
      unsub();
    };
  }, []);

  const navigateTo = (tab: ActiveTab) => {
    window.location.hash = `#${tab}`;
    setActiveTab(tab);
    setMobileDrawerOpen(false);
  };

  const handleStartSearchWithQuery = (query: string) => {
    setInitialSearchQuery(query);
    navigateTo('research');
  };

  // If on landing, show pure full-bleed landing view
  if (activeTab === 'landing') {
    return (
      <div className="w-full min-h-screen bg-[#111319] text-[#e1e2e9] font-sans antialiased overflow-x-hidden">
        <LandingView onStartSearchWithQuery={handleStartSearchWithQuery} />
      </div>
    );
  }

  const getWorkspaceTitle = (tab: ActiveTab): string => {
    switch (tab) {
      case 'research':
        return 'Research Council';
      case 'chat':
        return 'Breezy Chat';
      case 'build':
        return 'Build IDE';
      case 'canvas':
        return 'Research Canvas';
      case 'notes':
        return 'Notes';
      case 'models':
        return 'Models & Keys';
      case 'history':
        return 'History Vault';
      case 'docs':
        return 'Documentation';
      case 'settings':
        return 'Settings';
      case 'profile':
        return 'Profile';
      default:
        return 'Breezy Research';
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#111319] text-[#e1e2e9] font-sans overflow-hidden select-none relative">
      {/* ============================================================== */}
      {/* Desktop Persistent Sidebar (>=1024px)                          */}
      {/* ============================================================== */}
      <div className="hidden lg:flex h-full shrink-0">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={navigateTo}
          backendOnline={backendOnline}
          activeEndpointName={endpointName}
        />
      </div>

      {/* ============================================================== */}
      {/* Mobile Drawer (Side Drawer triggered from Top Bar menu icon)    */}
      {/* ============================================================== */}
      {mobileDrawerOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex transition-opacity"
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div
            className="w-72 max-w-[85vw] h-full bg-[#141820] shadow-2xl animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar
              activeTab={activeTab}
              onSelectTab={navigateTo}
              backendOnline={backendOnline}
              activeEndpointName={endpointName}
              onCloseMobileDrawer={() => setMobileDrawerOpen(false)}
            />
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* Main Workspace Frame                                           */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        {/* Mobile / Tablet Top Header (<1024px) */}
        <header className="lg:hidden h-14 bg-[#141820] border-b border-[#272a30] px-4 flex items-center justify-between shrink-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="p-1.5 -ml-1 rounded-lg text-[#bcc9ce] hover:text-[#e1e2e9] hover:bg-[#1d2025] transition-colors focus:outline-none"
              aria-label="Open Navigation Sidebar"
            >
              <span className="material-symbols-outlined text-2xl">menu</span>
            </button>
            <div className="flex items-center gap-2">
              <BreezyLogo size={24} />
              <span className="font-bold text-sm text-[#e1e2e9] tracking-tight">
                {getWorkspaceTitle(activeTab)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="#landing"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#191c21] border border-[#272a30] text-xs font-mono text-[#4cd6fb] hover:border-[#4cd6fb]/40 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">home</span>
              <span className="hidden sm:inline">Landing</span>
            </a>
          </div>
        </header>

        {/* Workspace Body (Clean layout, no bottom bar, sidebar is enough) */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {activeTab === 'research' && <ResearchWorkspace initialPrompt={initialSearchQuery} />}
          {activeTab === 'chat' && <ChatWorkspace />}
          {activeTab === 'build' && <BuildWorkspace />}
          {activeTab === 'canvas' && <CanvasWorkspace />}
          {activeTab === 'notes' && <NotesWorkspace />}
          {activeTab === 'models' && <VaultWorkspace />}
          {activeTab === 'history' && <HistoryWorkspace />}
          {activeTab === 'docs' && <DocsWorkspace />}
          {activeTab === 'settings' && <SettingsWorkspace />}
          {activeTab === 'profile' && <ProfileWorkspace />}
        </main>
      </div>
    </div>
  );
}
