import React from 'react';
import { BreezyLogo } from './BreezyLogo';

export type ActiveTab =
  | 'landing'
  | 'research'
  | 'chat'
  | 'build'
  | 'canvas'
  | 'notes'
  | 'models'
  | 'history'
  | 'docs'
  | 'settings'
  | 'profile';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  backendOnline: boolean;
  activeEndpointName: string;
  onCloseMobileDrawer?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  backendOnline,
  activeEndpointName,
  onCloseMobileDrawer,
}) => {
  const primaryNavItems: Array<{
    id: ActiveTab;
    label: string;
    icon: string;
    tag?: string;
    accentColor?: string;
  }> = [
    { id: 'research', label: 'Research Council', icon: 'psychology', tag: 'SSE', accentColor: '#4cd6fb' },
    { id: 'chat', label: 'Breezy Chat', icon: 'chat_bubble', accentColor: '#4cd6fb' },
    { id: 'build', label: 'Build IDE', icon: 'terminal', tag: 'Repo', accentColor: '#4edea3' },
    { id: 'canvas', label: 'Research Canvas', icon: 'dashboard', accentColor: '#d8b4fe' },
    { id: 'notes', label: 'Notes', icon: 'edit_note', accentColor: '#38bdf8' },
  ];

  const engineNavItems: Array<{
    id: ActiveTab;
    label: string;
    icon: string;
    tag?: string;
  }> = [
    { id: 'models', label: 'Models & Keys', icon: 'vpn_key', tag: 'BYOK' },
    { id: 'history', label: 'History Vault', icon: 'folder_open' },
  ];

  const systemNavItems: Array<{
    id: ActiveTab;
    label: string;
    icon: string;
  }> = [
    { id: 'docs', label: 'Documentation', icon: 'menu_book' },
    { id: 'settings', label: 'Engine Settings', icon: 'settings' },
    { id: 'profile', label: 'Profile & Storage', icon: 'account_circle' },
    { id: 'landing', label: 'Landing Overview', icon: 'home' },
  ];

  const handleItemClick = (id: ActiveTab) => {
    window.location.hash = `#${id}`;
    onSelectTab(id);
    if (onCloseMobileDrawer) {
      onCloseMobileDrawer();
    }
  };

  return (
    <aside className="w-64 bg-[#141820] border-r border-[#272a30] flex flex-col h-full shrink-0 select-none">
      {/* Brand Header with Modern Slick Vector Logo */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-[#272a30] shrink-0 bg-[#111319]/40">
        <a
          href="#landing"
          onClick={() => handleItemClick('landing')}
          className="flex items-center gap-2 group cursor-pointer"
        >
          <BreezyLogo size={32} showWordmark={true} />
        </a>

        {onCloseMobileDrawer && (
          <button
            onClick={onCloseMobileDrawer}
            className="lg:hidden text-[#869398] hover:text-[#e1e2e9] p-1.5 rounded-lg hover:bg-[#191c21] transition-colors"
            aria-label="Close navigation"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {/* Core Workspaces */}
        <div>
          <span className="font-mono text-[10px] text-[#869398] uppercase tracking-wider px-2 block mb-1 font-semibold">
            Workspaces
          </span>
          <nav className="space-y-0.5">
            {primaryNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`
                    w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all
                    ${
                      isActive
                        ? 'bg-[#191c21] text-[#4cd6fb] font-semibold shadow-sm border border-[#4cd6fb]/25 pl-3'
                        : 'text-[#bcc9ce] hover:bg-[#191c21]/60 hover:text-[#e1e2e9] border border-transparent'
                    }
                  `}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`material-symbols-outlined text-lg transition-transform ${
                        isActive ? 'text-[#4cd6fb] scale-105' : 'text-[#869398]'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.tag && (
                    <span
                      className={`font-mono text-[9px] uppercase px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-[#4cd6fb]/15 text-[#4cd6fb] border border-[#4cd6fb]/30 font-bold'
                          : 'bg-[#1d2025] text-[#869398] border border-[#272a30]'
                      }`}
                    >
                      {item.tag}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Engine & Vault */}
        <div>
          <span className="font-mono text-[10px] text-[#869398] uppercase tracking-wider px-2 block mb-1 font-semibold">
            Engine & Memory
          </span>
          <nav className="space-y-0.5">
            {engineNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`
                    w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all
                    ${
                      isActive
                        ? 'bg-[#191c21] text-[#4cd6fb] font-semibold border border-[#4cd6fb]/25 pl-3'
                        : 'text-[#bcc9ce] hover:bg-[#191c21]/60 hover:text-[#e1e2e9] border border-transparent'
                    }
                  `}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`material-symbols-outlined text-lg ${
                        isActive ? 'text-[#4cd6fb]' : 'text-[#869398]'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.tag && (
                    <span
                      className={`font-mono text-[9px] uppercase px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-[#4cd6fb]/15 text-[#4cd6fb] border border-[#4cd6fb]/30 font-bold'
                          : 'bg-[#1d2025] text-[#869398] border border-[#272a30]'
                      }`}
                    >
                      {item.tag}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* System & Support */}
        <div>
          <span className="font-mono text-[10px] text-[#869398] uppercase tracking-wider px-2 block mb-1 font-semibold">
            System
          </span>
          <nav className="space-y-0.5">
            {systemNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`
                    w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all
                    ${
                      isActive
                        ? 'bg-[#191c21] text-[#4cd6fb] font-semibold border border-[#4cd6fb]/25 pl-3'
                        : 'text-[#869398] hover:bg-[#191c21]/60 hover:text-[#e1e2e9] border border-transparent'
                    }
                  `}
                >
                  <span className={`material-symbols-outlined text-lg ${isActive ? 'text-[#4cd6fb]' : ''}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Backend Status Bar */}
      <div className="p-3 border-t border-[#272a30] bg-[#111319] shrink-0">
        <div className="flex items-center justify-between text-[11px] font-mono text-[#bcc9ce]">
          <div className="flex items-center gap-2 truncate">
            <span className="relative flex h-2 w-2 shrink-0">
              {backendOnline && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4edea3] opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  backendOnline ? 'bg-[#4edea3]' : 'bg-[#93000a]'
                }`}
              ></span>
            </span>
            <span className="truncate">{activeEndpointName}</span>
          </div>
          <span
            className={`font-semibold ${
              backendOnline ? 'text-[#4edea3]' : 'text-[#ffb4ab]'
            }`}
          >
            {backendOnline ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>
      </div>
    </aside>
  );
};
