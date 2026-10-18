import React, { useState, useEffect } from 'react';
import { providerConfigService, CanonicalWorkspaceConfig } from '../services/providerConfigService';

export const SettingsWorkspace: React.FC = () => {
  const [config, setConfig] = useState<CanonicalWorkspaceConfig>(providerConfigService.getConfig());
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    setConfig(providerConfigService.getConfig());
  }, []);

  const handleChange = (partial: Partial<CanonicalWorkspaceConfig>) => {
    const updated = { ...config, ...partial };
    setConfig(updated);
    providerConfigService.saveConfig(updated);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="flex-1 bg-[#111319] text-[#e1e2e9] p-4 sm:p-8 overflow-y-auto select-none">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#272a30]">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#e1e2e9] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4cd6fb]">settings</span>
              <span>Research Engine Settings</span>
            </h2>
            <p className="text-[#bcc9ce] text-xs sm:text-sm mt-0.5">
              Configure search grounding providers, debate methodology, and heartbeat intervals.
            </p>
          </div>
          {savedNotice && (
            <span className="bg-[#4edea3]/20 text-[#4edea3] border border-[#4edea3]/40 text-xs px-2.5 py-1 rounded font-mono flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">check</span> Settings Updated
            </span>
          )}
        </div>

        {/* Configuration Card */}
        <div className="bg-[#191c21] border border-[#272a30] rounded-2xl p-5 sm:p-7 shadow-xl space-y-6">
          {/* Search Engine Provider */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#e1e2e9]">Default Web Search Grounding Provider</label>
            <p className="text-[11px] text-[#bcc9ce]">
              Used by the council to ground assertions against live web articles and arXiv publications.
            </p>
            <select
              value={config.searchEngine || 'duckduckgo'}
              onChange={(e) => handleChange({ searchEngine: e.target.value as any })}
              className="w-full bg-[#111319] border border-[#272a30] rounded-lg px-3 py-2 text-xs text-[#e1e2e9] focus:outline-none focus:border-[#4cd6fb]"
            >
              <option value="duckduckgo">DuckDuckGo (Privacy-first, zero tracking)</option>
              <option value="google">Google Custom Search (Requires key in Vault)</option>
              <option value="brave">Brave Search API (Requires key in Vault)</option>
              <option value="searxng">SearXNG (Open metasearch instance)</option>
              <option value="tavily">Tavily AI Search (Requires key in Vault)</option>
              <option value="serper">Serper Google API (Requires key in Vault)</option>
            </select>
          </div>

          {/* Research Method */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#e1e2e9]">Default Synthesis Methodology</label>
            <p className="text-[11px] text-[#bcc9ce]">
              Governs how conflicting model arguments are cross-referenced and resolved.
            </p>
            <select
              value={config.researchMethod || 'adaptive'}
              onChange={(e) => handleChange({ researchMethod: e.target.value as any })}
              className="w-full bg-[#111319] border border-[#272a30] rounded-lg px-3 py-2 text-xs text-[#e1e2e9] focus:outline-none focus:border-[#4cd6fb]"
            >
              <option value="adaptive">Adaptive Deep Reasoning</option>
              <option value="systematic">Systematic Literature Audit</option>
              <option value="evidence-map">Evidence Node Mapping & Contradiction Resolution</option>
              <option value="comparative">Comparative Multi-Model Contrast</option>
            </select>
          </div>

          {/* Heartbeat Interval */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#e1e2e9]">SSE Stream Heartbeat Interval</span>
              <span className="font-mono text-[#4cd6fb]">{config.heartbeatIntervalSec || 30}s</span>
            </div>
            <p className="text-[11px] text-[#bcc9ce]">
              Sends periodic keep-alive pings over the SSE stream to prevent cloud proxy disconnects during lengthy reasoning passes.
            </p>
            <input
              type="range"
              min="10"
              max="60"
              step="5"
              value={config.heartbeatIntervalSec || 30}
              onChange={(e) => handleChange({ heartbeatIntervalSec: parseInt(e.target.value, 10) })}
              className="w-full accent-[#4cd6fb] cursor-pointer"
            />
          </div>

          {/* Auto Resolve Toggle */}
          <div className="flex items-center justify-between pt-3 border-t border-[#272a30]">
            <div>
              <div className="text-xs font-semibold text-[#e1e2e9]">Auto-Resolve Contradictions</div>
              <div className="text-[11px] text-[#bcc9ce]">
                Permit the arbiter model to reconcile divergent claims during synthesis rounds.
              </div>
            </div>
            <input
              type="checkbox"
              checked={config.autoResolve ?? true}
              onChange={(e) => handleChange({ autoResolve: e.target.checked })}
              className="w-4 h-4 accent-[#4cd6fb] cursor-pointer rounded"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
