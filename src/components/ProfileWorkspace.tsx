import React, { useState, useEffect } from 'react';
import { getStorageQuotaStatus, StorageQuota } from '../services/storageQuotaService';
import { providerConfigService } from '../services/providerConfigService';
import { getGitHubToken, setGitHubToken } from '../services/ideService';
import { BreezyLogo } from './BreezyLogo';

export const ProfileWorkspace: React.FC = () => {
  const [quota, setQuota] = useState<StorageQuota | null>(null);
  const [quotaLoading, setQuotaLoading] = useState<boolean>(true);
  const [hasGitHubToken, setHasGitHubToken] = useState<boolean>(Boolean(getGitHubToken()));
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  useEffect(() => {
    getStorageQuotaStatus()
      .then((q) => setQuota(q))
      .catch(() => setQuota(null))
      .finally(() => setQuotaLoading(false));
  }, []);

  const handleClearLocalStorage = () => {
    if (window.confirm('Clear all local configuration, notes, and canvas items? This action is irreversible.')) {
      try {
        localStorage.clear();
        setGitHubToken('');
        setHasGitHubToken(false);
        setResetMessage('Local browser storage cleared.');
        setTimeout(() => window.location.reload(), 1500);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const configuredKeys = providerConfigService.getKeys();
  const keysCount = Object.values(configuredKeys).filter(Boolean).length;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#111319] text-[#e1e2e9] overflow-hidden">
      {/* Top Header */}
      <div className="h-14 bg-[#141820] border-b border-[#272a30] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#4cd6fb] text-xl">account_circle</span>
          <span className="font-bold text-sm text-[#e1e2e9]">User & Workspace Profile</span>
        </div>
        <span className="font-mono text-xs text-[#4edea3]">Local-First Client</span>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-4xl space-y-6">
        {/* User Card */}
        <div className="p-6 rounded-2xl bg-[#191c21] border border-[#272a30] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#141820] border border-[#272a30] flex items-center justify-center p-2">
              <BreezyLogo size={40} showWordmark={false} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#e1e2e9]">Breezy Anonymous Analyst</h3>
              <p className="text-xs text-[#bcc9ce] font-mono mt-0.5">Session: Browser Local Storage Session</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 rounded bg-[#111319] text-[#4edea3] font-mono text-[10px] border border-[#4edea3]/30">
                  Zero Cloud Retention
                </span>
                <span className="px-2 py-0.5 rounded bg-[#111319] text-[#4cd6fb] font-mono text-[10px] border border-[#4cd6fb]/30">
                  Client BYOK
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Statuses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* GitHub Status */}
          <div className="p-5 rounded-xl bg-[#191c21] border border-[#272a30] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-xs text-[#e1e2e9] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-[#4cd6fb]">code</span>
                  <span>GitHub Integration (Build IDE)</span>
                </span>
                <span
                  className={`font-mono text-[10px] px-2 py-0.5 rounded ${
                    hasGitHubToken
                      ? 'bg-[#4edea3]/10 text-[#4edea3] border border-[#4edea3]/30'
                      : 'bg-[#272a30] text-[#869398]'
                  }`}
                >
                  {hasGitHubToken ? 'Token Configured' : 'Not Connected'}
                </span>
              </div>
              <p className="text-xs text-[#bcc9ce] leading-relaxed">
                Connect your GitHub Personal Access Token to explore repositories and commit code directly from the Build workspace.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#272a30] flex justify-end">
              <a
                href="#build"
                className="text-xs font-semibold text-[#4cd6fb] hover:underline flex items-center gap-1"
              >
                <span>Go to Build Workspace</span>
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </a>
            </div>
          </div>

          {/* Model Keys Status */}
          <div className="p-5 rounded-xl bg-[#191c21] border border-[#272a30] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-xs text-[#e1e2e9] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-[#4cd6fb]">vpn_key</span>
                  <span>Configured AI Providers</span>
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#272a30] text-[#4cd6fb]">
                  {keysCount} Keys Active
                </span>
              </div>
              <p className="text-xs text-[#bcc9ce] leading-relaxed">
                Manage your Gemini, Anthropic, Groq, or local Ollama endpoints and assign specialized models to council seats.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#272a30] flex justify-end">
              <a
                href="#models"
                className="text-xs font-semibold text-[#4cd6fb] hover:underline flex items-center gap-1"
              >
                <span>Manage Models & Keys</span>
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </a>
            </div>
          </div>
        </div>

        {/* Storage Quota Panel */}
        <div className="p-5 rounded-xl bg-[#191c21] border border-[#272a30] space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-xs text-[#e1e2e9] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#4cd6fb]">folder_zip</span>
              <span>Storage Quota Breakdown</span>
            </span>
            <span className="font-mono text-xs text-[#869398]">
              {quotaLoading ? 'Inspecting...' : quota ? `${quota.usedMB} MB / ${quota.limitMB} MB` : 'Local Quota Active'}
            </span>
          </div>

          <div className="w-full bg-[#111319] h-2 rounded-full overflow-hidden border border-[#272a30]">
            <div
              className="bg-[#4cd6fb] h-full transition-all duration-500"
              style={{ width: `${Math.min(quota?.percentageUsed || 4, 100)}%` }}
            ></div>
          </div>

          <p className="text-xs text-[#bcc9ce]">
            All session transcripts, evidence graph nodes, notes, and canvas cards are stored locally in your browser.
          </p>
        </div>

        {/* Danger Zone */}
        <div className="p-5 rounded-xl bg-[#93000a]/10 border border-[#ffb4ab]/20 space-y-3">
          <span className="font-semibold text-xs text-[#ffdad6] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">warning</span>
            <span>Reset Local Workspace Data</span>
          </span>
          <p className="text-xs text-[#ffb4ab]/80 leading-relaxed">
            Erase all locally persisted API keys, canvas cards, notes, and research session history from this browser.
          </p>
          <div className="pt-2">
            <button
              onClick={handleClearLocalStorage}
              className="px-4 py-2 rounded bg-[#93000a]/40 hover:bg-[#93000a]/70 text-[#ffdad6] text-xs font-semibold border border-[#ffb4ab]/30 transition-colors"
            >
              Clear Local Storage & Reset
            </button>
          </div>
          {resetMessage && <p className="text-xs text-[#4edea3] font-mono mt-1">{resetMessage}</p>}
        </div>
      </div>
    </div>
  );
};
