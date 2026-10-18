import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { apiClient } from '../services/apiClient';
import { providerConfigService } from '../services/providerConfigService';
import { effectiveProviderService } from '../services/effectiveProviderService';
import { ChatMessage } from '../types';
import { BreezyLogo } from './BreezyLogo';

const CHAT_STORAGE_KEY = 'breezy_chat_history_v1';

export const ChatWorkspace: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Real effective routable model
  const activeModel = effectiveProviderService.getActiveRoutableModel();
  const hasActiveModel = Boolean(activeModel);

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch {}
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePromptStarter = (promptText: string) => {
    setInput(promptText);
    if (textareaRef.current) {
      textareaRef.current.value = promptText;
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
      textareaRef.current.focus();
    }
  };

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt !== undefined ? customPrompt : input;
    if (!textToSend.trim() || isLoading) return;

    if (!hasActiveModel) {
      setError('No model is connected. Please add a provider key or local Ollama URL in the Models screen first.');
      return;
    }

    const userMsg = textToSend.trim();
    setInput('');
    setError(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const nextHistory = [...messages, { role: 'user' as const, content: userMsg }];
    setMessages(nextHistory);
    setIsLoading(true);

    try {
      const keys = providerConfigService.getKeys();
      const primaryKey = activeModel ? keys[activeModel.provider] : undefined;

      const res = await apiClient.chatBreezy({
        prompt: userMsg,
        history: nextHistory.map((m) => ({ role: m.role, content: m.content })),
        provider: activeModel?.provider,
        model: activeModel?.model,
        apiKey: primaryKey,
      });

      setMessages([...nextHistory, { role: 'assistant', content: res.text }]);
    } catch (err: any) {
      setError(err.message || 'Failed to get chat response from model');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear conversation history?')) {
      setMessages([]);
      localStorage.removeItem(CHAT_STORAGE_KEY);
    }
  };

  return (
    <div className="flex-1 bg-[#111319] flex flex-col h-full overflow-hidden text-[#e1e2e9] relative select-none">
      {/* Top Header Bar */}
      <div className="h-14 bg-[#141820] border-b border-[#272a30] px-4 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="material-symbols-outlined text-[#4cd6fb] text-xl">chat_bubble</span>
          <span className="font-bold text-sm text-[#e1e2e9]">Breezy Chat</span>
          <span className="hidden sm:inline-block font-mono text-xs text-[#869398] truncate">
            {activeModel ? `(${activeModel.provider}: ${activeModel.model})` : '(No model connected)'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveModel ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1d2025] text-xs font-mono border border-[#272a30] text-[#4edea3]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]"></span>
              <span className="hidden sm:inline">{activeModel?.model}</span>
              <span className="sm:hidden">Ready</span>
            </div>
          ) : (
            <a
              href="#models"
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/30 text-xs font-mono"
            >
              <span className="material-symbols-outlined text-xs">warning</span>
              <span>Connect Model</span>
            </a>
          )}

          {messages.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="text-[#869398] hover:text-[#e1e2e9] p-1 text-xs"
              title="Clear Chat History"
            >
              <span className="material-symbols-outlined text-base">delete_sweep</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Messages Viewport */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="max-w-2xl mx-auto flex flex-col items-center justify-center text-center my-auto py-12 space-y-6">
            <div className="flex items-center justify-center mb-2">
              <BreezyLogo size={56} showWordmark={false} />
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#e1e2e9]">Conversational AI</h2>
              <p className="text-xs sm:text-sm text-[#bcc9ce] mt-1 max-w-md">
                Chat directly with your active frontier model. Chat history is preserved locally on this device.
              </p>
            </div>

            {!hasActiveModel && (
              <div className="p-4 rounded-xl bg-[#1d2025] border border-[#f59e0b]/40 text-left space-y-2 max-w-md">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#f59e0b]">
                  <span className="material-symbols-outlined text-base">info</span>
                  <span>No Model Connected</span>
                </div>
                <p className="text-xs text-[#bcc9ce] leading-relaxed">
                  To chat, configure an API key for Google Gemini, Anthropic, or Groq, or connect a local Ollama server in the Models workspace.
                </p>
                <div className="pt-1">
                  <a
                    href="#models"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#4cd6fb] hover:underline"
                  >
                    <span>Open Models & Keys</span>
                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </a>
                </div>
              </div>
            )}

            {/* Prompt Starters */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-2">
              <button
                onClick={() =>
                  handlePromptStarter('Explain how multi-agent debate differs from standard Tree-of-Thought search.')
                }
                className="p-3.5 rounded-xl bg-[#191c21] hover:bg-[#272a30] border border-[#272a30] transition-colors flex flex-col justify-between h-28 text-left cursor-pointer"
              >
                <span className="font-mono text-[10px] text-[#4cd6fb]">Architecture</span>
                <p className="text-xs font-semibold text-[#e1e2e9] line-clamp-2">
                  Debate vs Tree-of-Thought search
                </p>
                <span className="text-[10px] text-[#869398] font-mono">Click to insert →</span>
              </button>

              <button
                onClick={() =>
                  handlePromptStarter('What are the key trade-offs between local Ollama inference and cloud frontier models?')
                }
                className="p-3.5 rounded-xl bg-[#191c21] hover:bg-[#272a30] border border-[#272a30] transition-colors flex flex-col justify-between h-28 text-left cursor-pointer"
              >
                <span className="font-mono text-[10px] text-[#4edea3]">Local vs Cloud</span>
                <p className="text-xs font-semibold text-[#e1e2e9] line-clamp-2">
                  Trade-offs of local Ollama models
                </p>
                <span className="text-[10px] text-[#869398] font-mono">Click to insert →</span>
              </button>

              <button
                onClick={() =>
                  handlePromptStarter('How does Breezy prevent hallucinated DOI citations in research results?')
                }
                className="p-3.5 rounded-xl bg-[#191c21] hover:bg-[#272a30] border border-[#272a30] transition-colors flex flex-col justify-between h-28 text-left cursor-pointer"
              >
                <span className="font-mono text-[10px] text-[#f59e0b]">Verification</span>
                <p className="text-xs font-semibold text-[#e1e2e9] line-clamp-2">
                  Preventing hallucinated citations
                </p>
                <span className="text-[10px] text-[#869398] font-mono">Click to insert →</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={idx}
                  className={`flex gap-3 max-w-2xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border text-xs font-bold ${
                      isUser
                        ? 'bg-[#4cd6fb] text-[#003642] border-[#4cd6fb]'
                        : 'bg-[#191c21] text-[#4cd6fb] border-[#272a30]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">{isUser ? 'person' : 'smart_toy'}</span>
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-[#1d2025] text-[#e1e2e9] border border-[#272a30] rounded-tr-none'
                        : 'bg-[#191c21] border border-[#272a30] text-[#e1e2e9] rounded-tl-none'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div className="prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-3 max-w-2xl animate-pulse">
                <div className="w-7 h-7 rounded-full bg-[#191c21] text-[#4cd6fb] border border-[#272a30] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#191c21] border border-[#272a30] text-[#bcc9ce] text-xs">
                  Streaming response from {activeModel?.model || 'model'}...
                </div>
              </div>
            )}

            {error && (
              <div className="p-3.5 rounded-xl bg-[#93000a]/20 border border-[#ffb4ab]/30 text-[#ffdad6] text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-[#ffb4ab]">error</span>
                <span>{error}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Docked Input Composer */}
      <div className="p-3 sm:p-4 bg-[#141820] border-t border-[#272a30] shrink-0">
        <div className="max-w-3xl mx-auto flex items-end gap-2 bg-[#191c21] border border-[#272a30] rounded-2xl p-2.5 focus-within:border-[#4cd6fb]/60 transition-colors">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder={
              hasActiveModel
                ? `Ask ${activeModel?.model} anything... (Enter to send, Shift+Enter for newline)`
                : 'Configure a model in Settings to chat...'
            }
            className="flex-1 bg-transparent text-xs sm:text-sm text-[#e1e2e9] placeholder-[#869398] focus:outline-none resize-none leading-relaxed px-1"
          />

          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="w-8 h-8 rounded-full bg-[#4cd6fb] hover:bg-[#7bd0ff] text-[#003642] flex items-center justify-center disabled:opacity-30 transition-all shrink-0 cursor-pointer"
            title="Send Message"
          >
            <span className="material-symbols-outlined text-base font-bold">arrow_upward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
