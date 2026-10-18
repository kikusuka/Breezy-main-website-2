import React, { useState, useEffect } from 'react';
import {
  providerConfigService,
  CanonicalWorkspaceConfig,
  AVAILABLE_MODELS,
} from '../services/providerConfigService';
import { effectiveProviderService } from '../services/effectiveProviderService';
import { apiClient } from '../services/apiClient';

export const VaultWorkspace: React.FC = () => {
  const [config, setConfig] = useState<CanonicalWorkspaceConfig>(providerConfigService.getConfig());
  const [testingKey, setTestingKey] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ provider: string; valid: boolean; message?: string } | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);
  const [ollamaUrl, setOllamaUrl] = useState<string>(config.ollamaBaseUrl || 'http://localhost:11434');
  const [ollamaEnabled, setOllamaEnabled] = useState<boolean>(true);

  const activeRoutable = effectiveProviderService.getActiveRoutableModel();

  useEffect(() => {
    setConfig(providerConfigService.getConfig());
  }, []);

  const triggerNotice = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleKeyChange = (provider: string, val: string) => {
    const updatedKeys = { ...config.keys, [provider]: val };
    const updated = { ...config, keys: updatedKeys };
    setConfig(updated);
    providerConfigService.saveConfig(updated);
    triggerNotice();
  };

  const handleSeatChange = (
    role: 'architect' | 'skeptic' | 'verifier' | 'arbiter',
    provider: any,
    model: string
  ) => {
    const updatedRoles = {
      ...config.roles,
      [role]: { provider, model },
    };
    const updated = { ...config, roles: updatedRoles, preset: 'custom' as const };
    setConfig(updated);
    providerConfigService.saveConfig(updated);
    triggerNotice();
  };

  const handleApplyPreset = (presetId: 'fast' | 'balanced' | 'deep') => {
    const updated = providerConfigService.applyPreset(presetId);
    setConfig({ ...updated });
    triggerNotice();
  };

  const handleSaveOllama = () => {
    const updated = {
      ...config,
      ollamaBaseUrl: ollamaUrl.trim(),
    };
    setConfig(updated);
    providerConfigService.saveConfig(updated);
    triggerNotice();
  };

  const handleTestKey = async (provider: string) => {
    const key = config.keys[provider];
    if (!key && provider !== 'ollama') {
      setTestResult({ provider, valid: false, message: 'Please enter an API key first.' });
      return;
    }
    setTestingKey(provider);
    setTestResult(null);
    try {
      const res = await apiClient.verifyKey(provider, key || '');
      setTestResult({
        provider,
        valid: res.valid,
        message: res.message || (res.valid ? 'API Key verified successfully!' : 'Invalid API key or network error.'),
      });
    } catch (e: any) {
      setTestResult({ provider, valid: false, message: e.message || 'Verification failed.' });
    } finally {
      setTestingKey(null);
    }
  };

  const providerFields = [
    { id: 'gemini', label: 'Google Gemini API Key', placeholder: 'AIzaSy...' },
    { id: 'anthropic', label: 'Anthropic Claude API Key', placeholder: 'sk-ant-...' },
    { id: 'groq', label: 'Groq API Key', placeholder: 'gsk_...' },
    { id: 'sambanova', label: 'SambaNova API Key', placeholder: 'samba_...' },
    { id: 'openrouter', label: 'OpenRouter API Key', placeholder: 'sk-or-v1-...' },
    { id: 'tavily', label: 'Tavily Search Key (Optional)', placeholder: 'tvly-...' },
    { id: 'serper', label: 'Serper Search Key (Optional)', placeholder: 'serper_...' },
  ];

  const seatsList: Array<{
    role: 'architect' | 'skeptic' | 'verifier' | 'arbiter';
    label: string;
    description: string;
  }> = [
    {
      role: 'architect',
      label: 'Architect (Analyst)',
      description: 'Primary inquiry formulation, hypothesis deconstruction, and initial proposal formulation.',
    },
    {
      role: 'skeptic',
      label: 'Skeptic (Critic)',
      description: 'Adversarial auditor checking logical fallacies, unstated assumptions, and counterexamples.',
    },
    {
      role: 'verifier',
      label: 'Verifier (Evidence Auditor)',
      description: 'Fact checker validating citations, DOI records, arXiv preprints, and formal logic proofs.',
    },
    {
      role: 'arbiter',
      label: 'Arbiter (Synthesizer)',
      description: 'Synthesizes conflicting arguments into an answer-first, calm definitive executive brief.',
    },
  ];

  return (
    <div className="flex-1 bg-[#111319] text-[#e1e2e9] p-4 sm:p-8 overflow-y-auto select-none">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#272a30]">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#e1e2e9] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4cd6fb]">vpn_key</span>
              <span>Models & Provider Vault</span>
            </h2>
            <p className="text-[#bcc9ce] text-xs sm:text-sm mt-0.5">
              Configure your BYOK credentials and assign specialized models to council debate seats.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeRoutable ? (
              <span className="px-2.5 py-1 rounded bg-[#4edea3]/10 text-[#4edea3] font-mono text-xs border border-[#4edea3]/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]"></span>
                <span>Active: {activeRoutable.model}</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded bg-[#f59e0b]/10 text-[#f59e0b] font-mono text-xs border border-[#f59e0b]/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]"></span>
                <span>No model assigned</span>
              </span>
            )}

            {savedNotice && (
              <span className="bg-[#4edea3]/20 text-[#4edea3] border border-[#4edea3]/40 text-xs px-2.5 py-1 rounded font-mono flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">check</span> Saved
              </span>
            )}
          </div>
        </div>

        {/* Seat Allocations Matrix */}
        <div className="bg-[#191c21] border border-[#272a30] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#272a30]">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#e1e2e9] flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-[#4cd6fb]">groups</span>
                <span>Council Seat Allocation</span>
              </h3>
              <p className="text-xs text-[#bcc9ce]">
                Each round of an investigation calls the model assigned to its respective role.
              </p>
            </div>

            {/* Presets */}
            <div className="hidden sm:flex items-center gap-1 text-xs">
              <span className="text-[#869398] mr-1">Presets:</span>
              <button
                onClick={() => handleApplyPreset('fast')}
                className="px-2.5 py-1 rounded bg-[#111319] hover:bg-[#272a30] text-[#bcc9ce] border border-[#272a30] text-xs font-mono"
              >
                Fast
              </button>
              <button
                onClick={() => handleApplyPreset('balanced')}
                className="px-2.5 py-1 rounded bg-[#111319] hover:bg-[#272a30] text-[#4cd6fb] border border-[#272a30] text-xs font-mono"
              >
                Balanced
              </button>
              <button
                onClick={() => handleApplyPreset('deep')}
                className="px-2.5 py-1 rounded bg-[#111319] hover:bg-[#272a30] text-[#4edea3] border border-[#272a30] text-xs font-mono"
              >
                Deep
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {seatsList.map((seat) => {
              const assigned = config.roles[seat.role];
              const assignedText = assigned ? `${assigned.provider.toUpperCase()} : ${assigned.model}` : 'No model assigned';

              return (
                <div key={seat.role} className="p-4 rounded-xl bg-[#111319] border border-[#272a30] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#e1e2e9]">{seat.label}</span>
                    <span className="font-mono text-[10px] text-[#4cd6fb] bg-[#272a30] px-2 py-0.5 rounded truncate max-w-[160px]">
                      {assignedText}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#bcc9ce] leading-relaxed">{seat.description}</p>
                  <div>
                    <label className="block text-[10px] text-[#869398] mb-1 font-mono uppercase">
                      Select Assigned Model
                    </label>
                    <select
                      value={assigned ? `${assigned.provider}::${assigned.model}` : ''}
                      onChange={(e) => {
                        if (!e.target.value) return;
                        const [p, m] = e.target.value.split('::');
                        handleSeatChange(seat.role, p, m);
                      }}
                      className="w-full bg-[#191c21] border border-[#272a30] rounded px-2.5 py-1.5 text-xs text-[#e1e2e9] focus:outline-none focus:border-[#4cd6fb]"
                    >
                      <option value="">-- Choose Provider Model --</option>
                      {Object.entries(AVAILABLE_MODELS).map(([provider, models]) => (
                        <optgroup key={provider} label={provider.toUpperCase()}>
                          {models.map((m) => (
                            <option key={m.id} value={`${provider}::${m.id}`}>
                              {provider.toUpperCase()} · {m.name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Local Ollama Server Card */}
        <div className="bg-[#191c21] border border-[#272a30] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#272a30]">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#e1e2e9] flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-[#4edea3]">terminal</span>
                <span>Local Ollama Bridge</span>
              </h3>
              <p className="text-xs text-[#bcc9ce]">
                Execute private inference locally without cloud logging or data retention.
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-mono">
              <input
                type="checkbox"
                checked={ollamaEnabled}
                onChange={(e) => {
                  setOllamaEnabled(e.target.checked);
                  handleSaveOllama();
                }}
                className="rounded border-[#272a30] text-[#4cd6fb] focus:ring-0"
              />
              <span>Enable Ollama</span>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={ollamaUrl}
              onChange={(e) => setOllamaUrl(e.target.value)}
              placeholder="http://localhost:11434"
              className="flex-1 bg-[#111319] border border-[#272a30] rounded px-3 py-2 text-xs font-mono text-[#e1e2e9] focus:outline-none focus:border-[#4cd6fb]"
            />
            <button
              onClick={handleSaveOllama}
              className="px-4 py-2 rounded bg-[#272a30] hover:bg-[#32353a] text-xs font-semibold text-[#4cd6fb] border border-[#3d494d]/40"
            >
              Save Endpoint
            </button>
            <button
              onClick={() => handleTestKey('ollama')}
              disabled={testingKey === 'ollama'}
              className="px-4 py-2 rounded bg-[#111319] hover:bg-[#272a30] text-xs font-medium text-[#bcc9ce] border border-[#272a30]"
            >
              {testingKey === 'ollama' ? 'Testing...' : 'Test Connection'}
            </button>
          </div>
        </div>

        {/* BYOK Provider API Keys List */}
        <div className="bg-[#191c21] border border-[#272a30] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="pb-2 border-b border-[#272a30]">
            <h3 className="text-sm sm:text-base font-bold text-[#e1e2e9] flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-[#4cd6fb]">key</span>
              <span>Client Provider Credentials (BYOK)</span>
            </h3>
            <p className="text-xs text-[#bcc9ce]">
              Keys remain stored client-side in localStorage and are passed securely over HTTPS for each inference request.
            </p>
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-lg text-xs font-mono flex items-center gap-2 border ${
                testResult.valid
                  ? 'bg-[#4edea3]/10 border-[#4edea3]/30 text-[#4edea3]'
                  : 'bg-[#93000a]/20 border-[#ffb4ab]/30 text-[#ffdad6]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">
                {testResult.valid ? 'check_circle' : 'error'}
              </span>
              <span>
                [{testResult.provider.toUpperCase()}]: {testResult.message}
              </span>
            </div>
          )}

          <div className="space-y-3">
            {providerFields.map((field) => {
              const val = config.keys[field.id] || '';
              const isTesting = testingKey === field.id;

              return (
                <div key={field.id} className="p-3 rounded-xl bg-[#111319] border border-[#272a30] space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-semibold text-[#e1e2e9]">{field.label}</label>
                    <span className="font-mono text-[10px] text-[#869398]">
                      {val ? 'Key Configured' : 'Empty'}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={val}
                      onChange={(e) => handleKeyChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className="flex-1 bg-[#191c21] border border-[#272a30] rounded px-3 py-1.5 text-xs font-mono text-[#e1e2e9] placeholder-[#869398] focus:outline-none focus:border-[#4cd6fb]"
                    />
                    <button
                      onClick={() => handleTestKey(field.id)}
                      disabled={isTesting || !val}
                      className="px-3 py-1.5 rounded bg-[#272a30] hover:bg-[#32353a] text-xs font-medium text-[#bcc9ce] border border-[#272a30] disabled:opacity-30 transition-colors"
                    >
                      {isTesting ? 'Verifying...' : 'Test Key'}
                    </button>
                    {val && (
                      <button
                        onClick={() => handleKeyChange(field.id, '')}
                        className="px-2 py-1.5 rounded bg-[#93000a]/20 hover:bg-[#93000a]/40 text-[#ffdad6] text-xs border border-[#ffb4ab]/20"
                        title="Remove Key"
                      >
                        <span className="material-symbols-outlined text-xs">delete</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
