import React, { useState } from 'react';

interface DocSection {
  id: string;
  title: string;
  category: string;
  content: React.ReactNode;
}

export const DocsWorkspace: React.FC = () => {
  const [activeSectionId, setActiveSectionId] = useState<string>('methodology');

  const docs: DocSection[] = [
    {
      id: 'methodology',
      title: 'Four-Pillar Research Methodology',
      category: 'Architecture',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-[#bcc9ce] leading-relaxed">
          <p>
            Breezy Research discards the traditional single-model monologue. Standard LLMs prioritize conversational fluency, which often leads to plausible but unsubstantiated hallucinations. Breezy introduces an asynchronous multi-stage scientific method:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-4">
            <div className="p-3.5 rounded-xl bg-[#191c21] border border-[#272a30]">
              <span className="font-mono text-xs text-[#4cd6fb] font-semibold">01. Multi-Angle Exploration</span>
              <p className="text-xs text-[#bcc9ce] mt-1">
                Hypotheses are decomposed into atomic logical assertions across isolated reasoning engines before any consensus is attempted.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#191c21] border border-[#272a30]">
              <span className="font-mono text-xs text-[#f59e0b] font-semibold">02. Adversarial Contradiction</span>
              <p className="text-xs text-[#bcc9ce] mt-1">
                The Critic / Skeptic model examines the premises, isolating unstated assumptions, cherry-picked baselines, and circular logic.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#191c21] border border-[#272a30]">
              <span className="font-mono text-xs text-[#4edea3] font-semibold">03. Ground-Truth Verification</span>
              <p className="text-xs text-[#bcc9ce] mt-1">
                Claims must resolve to real DOI literature, direct arXiv papers, or formal logical proofs. Unsubstantiated claims are explicitly tagged or pruned.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#191c21] border border-[#272a30]">
              <span className="font-mono text-xs text-[#4cd6fb] font-semibold">04. Calm Synthesis</span>
              <p className="text-xs text-[#bcc9ce] mt-1">
                The Arbiter consolidates substantiated truth into an answer-first executive brief with transparent citation trails.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'protocols',
      title: 'Debate Protocols: Solo, Trio, Quad',
      category: 'Research Engine',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-[#bcc9ce] leading-relaxed">
          <p>
            The depth selector on the Research screen directly governs the multi-model topology sent to <code>/api/debate/stream</code>:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>
              <strong className="text-[#e1e2e9]">Solo (1 Round)</strong>: Dispatches the primary Architect model with web search grounding for rapid inquiries.
            </li>
            <li>
              <strong className="text-[#e1e2e9]">Standard / Trio (2 Rounds)</strong>: Executes a two-turn adversarial cycle between the Architect and Skeptic, synthesized by the Arbiter.
            </li>
            <li>
              <strong className="text-[#e1e2e9]">Deep / Quad (4 Rounds)</strong>: Adds a formal Verifier role to audit empirical evidence and contradiction graphs before final synthesis.
            </li>
          </ul>
          <div className="p-3 rounded-lg bg-[#0c0a09] border border-[#272a30] font-mono text-xs text-[#4cd6fb]">
            Payload mapping: selectedRound: 1 (solo) | selectedRound: 2 (trio) | selectedRound: 4 (quad)
          </div>
        </div>
      ),
    },
    {
      id: 'models-vault',
      title: 'BYOK & Local Ollama Setup',
      category: 'Configuration',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-[#bcc9ce] leading-relaxed">
          <p>
            Breezy is fully client-authoritative for model credentials. Your API keys are stored in your browser's local storage and passed directly over HTTPS to the proxy routes.
          </p>
          <h4 className="font-semibold text-[#e1e2e9]">Connecting Local Ollama</h4>
          <p>
            To use local models (like Llama 3, DeepSeek-R1, or Mistral) without cloud telemetry, ensure Ollama is running locally:
          </p>
          <pre className="p-3 rounded-lg bg-[#0c0a09] text-xs font-mono text-[#bcc9ce]">
            # Terminal command to launch Ollama with CORS enabled for Breezy:
            OLLAMA_ORIGINS="*" ollama serve
          </pre>
          <p>
            Then in Breezy <strong>Models</strong>, enter <code>http://localhost:11434</code> and click "Test Connection".
          </p>
        </div>
      ),
    },
    {
      id: 'ide-build',
      title: 'Build IDE & Browser Runtimes',
      category: 'Developer Tools',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-[#bcc9ce] leading-relaxed">
          <p>
            The Build workspace allows editing and running code against your GitHub repositories directly in the browser:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>
              <strong className="text-[#e1e2e9]">Python Execution (Pyodide)</strong>: Runs in WebAssembly via Pyodide. Packages are dynamically imported from PyPI. Note: Execution is client-side in the browser.
            </li>
            <li>
              <strong className="text-[#e1e2e9]">JavaScript Execution (Web Worker)</strong>: Executed in an isolated Web Worker with a 5000ms infinite loop safety timeout and standard console interception.
            </li>
            <li>
              <strong className="text-[#e1e2e9]">HTML Preview</strong>: Inlines local CSS/JS references from your open repository buffers into a <code>sandbox="allow-scripts"</code> iframe.
            </li>
            <li>
              <strong className="text-[#e1e2e9]">GitHub Commits</strong>: Commits are saved directly to the repository's default branch using the GitHub REST API.
            </li>
          </ul>
        </div>
      ),
    },
  ];

  const activeDoc = docs.find((d) => d.id === activeSectionId) || docs[0];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#111319] text-[#e1e2e9] overflow-hidden">
      {/* Top Header */}
      <div className="h-14 bg-[#141820] border-b border-[#272a30] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#4cd6fb] text-xl">menu_book</span>
          <span className="font-bold text-sm text-[#e1e2e9]">Documentation & Guides</span>
        </div>
        <span className="font-mono text-xs text-[#869398]">Breezy v2.4</span>
      </div>

      {/* Main Content Split */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Navigation Sidebar */}
        <div className="w-full md:w-64 bg-[#141820]/60 border-r border-[#272a30] p-3 space-y-1 shrink-0 overflow-y-auto">
          <span className="font-mono text-[10px] text-[#869398] uppercase tracking-wider block px-2 mb-2 font-semibold">
            Guides & Topics
          </span>
          {docs.map((doc) => (
            <button
              key={doc.id}
              onClick={() => setActiveSectionId(doc.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                doc.id === activeSectionId
                  ? 'bg-[#272a30] text-[#4cd6fb] font-semibold'
                  : 'text-[#bcc9ce] hover:bg-[#191c21] hover:text-[#e1e2e9]'
              }`}
            >
              <span>{doc.title}</span>
              <span className="material-symbols-outlined text-sm opacity-60">chevron_right</span>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-4xl">
          <div className="mb-4 pb-3 border-b border-[#272a30]">
            <span className="font-mono text-xs text-[#4cd6fb] uppercase">{activeDoc.category}</span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#e1e2e9] mt-1">{activeDoc.title}</h2>
          </div>
          {activeDoc.content}
        </div>
      </div>
    </div>
  );
};
