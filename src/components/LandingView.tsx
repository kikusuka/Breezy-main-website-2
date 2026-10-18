import React, { useState } from 'react';
import { BreezyLogo } from './BreezyLogo';

interface LandingViewProps {
  onStartSearchWithQuery: (query: string) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onStartSearchWithQuery }) => {
  const [inquiryQuery, setInquiryQuery] = useState('');
  const [isBatterySample, setIsBatterySample] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sampleChips = [
    { label: 'Li-S Batteries', query: 'Quantify polysulfide dissolution suppression mechanisms in room-temperature Lithium-Sulfur cathodes' },
    { label: 'Formal Verification', query: 'Evaluating multi-agent debate protocols vs tree-of-thought search in automated formal verification' },
    { label: 'Sparse MoE', query: 'Compare top-2 gating vs expert-choice routing in sparse mixture-of-experts transformer architectures' },
    { label: 'Hallucination Audits', query: 'Design an adversarial audit loop to eliminate fabricated DOI citations in scientific LLM outputs' },
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inquiryQuery.trim()) {
      onStartSearchWithQuery(inquiryQuery.trim());
    } else {
      window.location.hash = '#research';
    }
  };

  const handleChipClick = (query: string) => {
    setInquiryQuery(query);
    onStartSearchWithQuery(query);
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-[#111319] text-[#e1e2e9] font-sans antialiased selection:bg-[#00414f] selection:text-[#7bd0ff] min-h-screen relative overflow-x-hidden">
      {/* Subtle Ambient Radial Lighting */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[10%] left-1/2 -translate-x-1/2 w-[1100px] h-[550px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,180,216,0.14)_0%,rgba(76,214,251,0.05)_45%,rgba(17,19,25,0)_75%)] blur-3xl"></div>
        <div className="absolute top-[40%] -left-[10%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(0,180,216,0.07)_0%,rgba(17,19,25,0)_70%)] blur-3xl"></div>
      </div>

      {/* Top Header Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#111319]/90 backdrop-blur-xl border-b border-[#272a30]">
        <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-8">
          {/* Zone 1: Modern Slick Logo Mark */}
          <div className="flex items-center gap-3 shrink-0">
            <a href="#landing" className="flex items-center gap-2.5 group">
              <BreezyLogo size={32} showWordmark={true} />
            </a>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-[#bcc9ce]">
            <a href="#research" className="hover:text-[#4cd6fb] transition-colors whitespace-nowrap">
              Research Council
            </a>
            <a href="#chat" className="hover:text-[#4cd6fb] transition-colors whitespace-nowrap">
              Breezy Chat
            </a>
            <a href="#build" className="hover:text-[#4cd6fb] transition-colors whitespace-nowrap">
              Build IDE
            </a>
            <a href="#canvas" className="hover:text-[#4cd6fb] transition-colors whitespace-nowrap">
              Canvas
            </a>
            <a href="#models" className="hover:text-[#4cd6fb] transition-colors whitespace-nowrap">
              Models & Vault
            </a>
            <button
              onClick={() => scrollToSection('four-pillars')}
              className="hover:text-[#e1e2e9] transition-colors cursor-pointer whitespace-nowrap"
            >
              Methodology
            </button>
            <a href="#docs" className="hover:text-[#4cd6fb] transition-colors whitespace-nowrap">
              Documentation
            </a>
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="#research"
              className="px-4 py-2 rounded-lg bg-[#4cd6fb] text-[#003642] font-semibold text-xs hover:bg-[#7bd0ff] transition-all shadow-sm flex items-center gap-1 whitespace-nowrap"
            >
              <span>Launch Council</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </a>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg text-[#bcc9ce] hover:text-[#e1e2e9] hover:bg-[#272a30]"
              aria-label="Toggle Navigation"
            >
              <span className="material-symbols-outlined text-xl">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#141820] border-b border-[#272a30] px-4 py-4 space-y-3 shadow-2xl animate-fade-in">
            <div className="grid grid-cols-2 gap-2 text-xs font-medium">
              <a
                href="#research"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-lg bg-[#191c21] border border-[#272a30] text-[#4cd6fb] flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">psychology</span>
                <span>Research Council</span>
              </a>
              <a
                href="#chat"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-lg bg-[#191c21] border border-[#272a30] text-[#e1e2e9] flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base text-[#4cd6fb]">chat_bubble</span>
                <span>Breezy Chat</span>
              </a>
              <a
                href="#build"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-lg bg-[#191c21] border border-[#272a30] text-[#e1e2e9] flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base text-[#4edea3]">terminal</span>
                <span>Build IDE</span>
              </a>
              <a
                href="#canvas"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-lg bg-[#191c21] border border-[#272a30] text-[#e1e2e9] flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base text-[#d8b4fe]">dashboard</span>
                <span>Canvas</span>
              </a>
              <a
                href="#models"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-lg bg-[#191c21] border border-[#272a30] text-[#e1e2e9] flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base text-[#f59e0b]">vpn_key</span>
                <span>Models & Vault</span>
              </a>
              <a
                href="#history"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-lg bg-[#191c21] border border-[#272a30] text-[#e1e2e9] flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base text-[#bcc9ce]">folder_open</span>
                <span>History Vault</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Main Page Body */}
      <main className="relative z-10 w-full pt-16">
        {/* Hero Section */}
        <section className="relative w-full overflow-hidden px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-20 lg:pb-24">
          <div className="relative max-w-5xl mx-auto flex flex-col items-center text-center">
            {/* Value Header Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#191c21] border border-[#272a30] text-xs font-mono text-[#4cd6fb] mb-5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse"></span>
              <span>TRUTH-FIRST COGNITIVE ARCHITECTURE // MULTI-MODEL SSE</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-[#e1e2e9] max-w-4xl tracking-tight leading-tight">
              Research that <span className="text-[#4cd6fb]">thinks deeper.</span>
            </h1>

            <p className="mt-4 text-sm sm:text-base lg:text-lg text-[#bcc9ce] max-w-2xl leading-relaxed">
              Calm, multi-perspective synthesis for complex scientific, technical, and macroeconomic questions. Multiple models explore, challenge, and verify — delivering definitive consensus without AI theater.
            </p>

            {/* Inquiry Launch Composer */}
            <form onSubmit={handleFormSubmit} className="mt-8 w-full max-w-2xl">
              <div className="flex flex-col sm:flex-row items-center gap-2 p-2 rounded-2xl bg-[#191c21] border border-[#272a30] shadow-2xl focus-within:border-[#4cd6fb]/70 transition-all">
                <div className="flex items-center gap-2.5 flex-1 px-3 w-full">
                  <span className="material-symbols-outlined text-lg text-[#4cd6fb]">search</span>
                  <input
                    type="text"
                    value={inquiryQuery}
                    onChange={(e) => setInquiryQuery(e.target.value)}
                    placeholder="Enter an inquiry to start multi-model research..."
                    className="w-full bg-transparent text-xs sm:text-sm text-[#e1e2e9] placeholder-[#869398] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#4cd6fb] hover:bg-[#7bd0ff] text-[#003642] font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shrink-0"
                >
                  <span>Start Investigation</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </form>

            {/* Sample Inquiry Chips */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 max-w-2xl">
              <span className="text-[11px] font-mono text-[#869398]">Try:</span>
              {sampleChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChipClick(chip.query)}
                  className="px-2.5 py-1 rounded-lg bg-[#141820] hover:bg-[#1f242d] border border-[#272a30] hover:border-[#4cd6fb]/40 text-xs text-[#bcc9ce] hover:text-[#4cd6fb] transition-all cursor-pointer font-mono"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <div className="mt-3 font-mono text-[11px] text-[#869398]">
              No credit card required · Client BYOK vault · Real SSE debate stream · Zero retention
            </div>

            {/* Quick Workspace Nav Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10 w-full max-w-4xl text-left">
              <a
                href="#research"
                className="p-4 rounded-xl bg-[#141820] border border-[#272a30] hover:border-[#4cd6fb]/50 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#191c21] border border-[#272a30] flex items-center justify-center text-[#4cd6fb] mb-2.5 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-base">psychology</span>
                </div>
                <h3 className="font-bold text-xs text-[#e1e2e9] group-hover:text-[#4cd6fb]">Research Council</h3>
                <p className="text-[11px] text-[#869398] mt-0.5 line-clamp-2">6-stage asynchronous debate with real multi-model verification.</p>
              </a>

              <a
                href="#chat"
                className="p-4 rounded-xl bg-[#141820] border border-[#272a30] hover:border-[#4cd6fb]/50 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#191c21] border border-[#272a30] flex items-center justify-center text-[#4cd6fb] mb-2.5 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-base">chat_bubble</span>
                </div>
                <h3 className="font-bold text-xs text-[#e1e2e9] group-hover:text-[#4cd6fb]">Breezy Chat</h3>
                <p className="text-[11px] text-[#869398] mt-0.5 line-clamp-2">Direct conversation with active frontier model and local storage.</p>
              </a>

              <a
                href="#build"
                className="p-4 rounded-xl bg-[#141820] border border-[#272a30] hover:border-[#4edea3]/50 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#191c21] border border-[#272a30] flex items-center justify-center text-[#4edea3] mb-2.5 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-base">terminal</span>
                </div>
                <h3 className="font-bold text-xs text-[#e1e2e9] group-hover:text-[#4edea3]">Build IDE</h3>
                <p className="text-[11px] text-[#869398] mt-0.5 line-clamp-2">In-browser Pyodide, JS worker, and GitHub repository commits.</p>
              </a>

              <a
                href="#canvas"
                className="p-4 rounded-xl bg-[#141820] border border-[#272a30] hover:border-[#d8b4fe]/50 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#191c21] border border-[#272a30] flex items-center justify-center text-[#d8b4fe] mb-2.5 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-base">dashboard</span>
                </div>
                <h3 className="font-bold text-xs text-[#e1e2e9] group-hover:text-[#d8b4fe]">Research Canvas</h3>
                <p className="text-[11px] text-[#869398] mt-0.5 line-clamp-2">Visual card matrix for hypotheses, tasks, and pinned findings.</p>
              </a>
            </div>

            {/* Interactive Mockup Preview (Clearly Labeled Quad Architecture) */}
            <div className="mt-12 w-full max-w-4xl rounded-2xl bg-[#191c21] border border-[#272a30] shadow-2xl p-4 sm:p-6 text-left relative">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-[#272a30]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#93000a]"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4edea3]"></span>
                  <span className="ml-2 font-mono text-[11px] text-[#869398]">
                    Sample Pipeline Architecture // Quad Protocol
                  </span>
                </div>
                <button
                  onClick={() => setIsBatterySample(!isBatterySample)}
                  className="px-2.5 py-1 rounded-lg bg-[#111319] hover:bg-[#272a30] text-xs font-mono text-[#4cd6fb] border border-[#272a30] transition-colors"
                >
                  {isBatterySample ? 'Switch: Formal Verification' : 'Switch: Li-S Batteries'}
                </button>
              </div>

              {/* Inquiry Title */}
              <div className="p-3.5 rounded-xl bg-[#141820] border border-[#272a30] mb-4">
                <span className="font-mono text-[10px] text-[#4cd6fb] uppercase">Sample Research Topic</span>
                <p className="font-semibold text-xs sm:text-sm text-[#e1e2e9] mt-0.5">
                  {isBatterySample
                    ? 'Quantifying polysulfide dissolution suppression mechanisms in room-temperature Lithium-Sulfur cathodes'
                    : 'Evaluating multi-agent debate protocols vs tree-of-thought search in automated formal verification'}
                </p>
              </div>

              {/* 4 Pipeline Stages */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                <div className="p-3 rounded-lg bg-[#111319] border border-[#272a30]">
                  <span className="font-mono text-[10px] text-[#4edea3] block">01. DECOMPOSITION</span>
                  <span className="font-semibold text-xs text-[#e1e2e9] mt-0.5 block">Hypotheses Mapped</span>
                </div>
                <div className="p-3 rounded-lg bg-[#111319] border border-[#272a30]">
                  <span className="font-mono text-[10px] text-[#4edea3] block">02. ADVERSARIAL GAP</span>
                  <span className="font-semibold text-xs text-[#e1e2e9] mt-0.5 block">Assumptions Flagged</span>
                </div>
                <div className="p-3 rounded-lg bg-[#111319] border border-[#272a30]">
                  <span className="font-mono text-[10px] text-[#4edea3] block">03. VERIFICATION</span>
                  <span className="font-semibold text-xs text-[#e1e2e9] mt-0.5 block">DOI Papers Audited</span>
                </div>
                <div className="p-3 rounded-lg bg-[#272a30] border border-[#4cd6fb]/40">
                  <span className="font-mono text-[10px] text-[#4cd6fb] block">04. SYNTHESIS</span>
                  <span className="font-semibold text-xs text-[#4cd6fb] mt-0.5 block">Executive Brief</span>
                </div>
              </div>

              {/* Sample Brief Body */}
              <div className="p-4 rounded-xl bg-[#141820] border border-[#272a30] text-xs sm:text-sm text-[#bcc9ce] leading-relaxed">
                <span className="text-[10px] font-mono text-[#4cd6fb] uppercase block mb-1">
                  Sample Executive Takeaway
                </span>
                {isBatterySample ? (
                  <p>
                    Dual-model audit confirms that while atomic layer deposition of TiO2/graphene limits shuttle diffusion by 82%, cathode cracking accelerates after 350 cycles unless an ether-fluorinated co-solvent is maintained. 4 peer-reviewed DOIs confirmed consensus on reaction kinetics.
                  </p>
                ) : (
                  <p>
                    Multi-agent debate accelerates theorem clause exploration by 38.4% over standard Tree-of-Thought search, but is susceptible to cyclical agreement loops on unsound lemmas. Incorporating a deterministic Lean 4 checker in the loop eliminates false convergence.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 4-Pillar Methodology Section */}
        <section id="four-pillars" className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-[#141820]/50 border-y border-[#272a30]">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center max-w-2xl mx-auto">
              <span className="font-mono text-xs text-[#4cd6fb] uppercase font-semibold">The Architecture</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#e1e2e9] mt-1">The Four-Pillar Methodology</h2>
              <p className="text-xs sm:text-sm text-[#bcc9ce] mt-2">
                Conventional LLMs generate plausible completions. Breezy executes an asynchronous, verified scientific discovery cycle.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-[#191c21] border border-[#272a30] flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-[#111319] border border-[#272a30] flex items-center justify-center text-[#4cd6fb] mb-3">
                    <span className="material-symbols-outlined text-lg">hub</span>
                  </div>
                  <span className="font-mono text-[10px] text-[#4cd6fb] uppercase">Pillar 01</span>
                  <h3 className="font-bold text-sm text-[#e1e2e9] mt-1">Multi-Angle Exploration</h3>
                  <p className="text-xs text-[#bcc9ce] mt-2 leading-relaxed">
                    Independent reasoning engines decompose hypotheses without shared groupthink before any consensus is scheduled.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#191c21] border border-[#272a30] flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-[#111319] border border-[#272a30] flex items-center justify-center text-[#f59e0b] mb-3">
                    <span className="material-symbols-outlined text-lg">gavel</span>
                  </div>
                  <span className="font-mono text-[10px] text-[#f59e0b] uppercase">Pillar 02</span>
                  <h3 className="font-bold text-sm text-[#e1e2e9] mt-1">Adversarial Contradiction</h3>
                  <p className="text-xs text-[#bcc9ce] mt-2 leading-relaxed">
                    Models actively probe premises, pinpointing unstated assumptions, cherry-picked baselines, and logic regressions.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#191c21] border border-[#272a30] flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-[#111319] border border-[#272a30] flex items-center justify-center text-[#4edea3] mb-3">
                    <span className="material-symbols-outlined text-lg">verified</span>
                  </div>
                  <span className="font-mono text-[10px] text-[#4edea3] uppercase">Pillar 03</span>
                  <h3 className="font-bold text-sm text-[#e1e2e9] mt-1">Ground-Truth Verification</h3>
                  <p className="text-xs text-[#bcc9ce] mt-2 leading-relaxed">
                    Factual assertions require real DOI alignment, arXiv source extraction, or theorem validation.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#191c21] border border-[#272a30] flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-[#111319] border border-[#272a30] flex items-center justify-center text-[#4cd6fb] mb-3">
                    <span className="material-symbols-outlined text-lg">auto_stories</span>
                  </div>
                  <span className="font-mono text-[10px] text-[#4cd6fb] uppercase">Pillar 04</span>
                  <h3 className="font-bold text-sm text-[#e1e2e9] mt-1">Calm Synthesis</h3>
                  <p className="text-xs text-[#bcc9ce] mt-2 leading-relaxed">
                    Answer-first resolution of divergent viewpoints with structured citation trails and remaining uncertainties.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full py-10 px-4 sm:px-6 lg:px-8 border-t border-[#272a30] bg-[#111319] text-center text-xs text-[#869398] font-mono">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <BreezyLogo size={26} showWordmark={true} />
            <p>© Breezy Research. Truth-first, multi-model cognitive intelligence workspace.</p>
          </div>
        </footer>
      </main>
    </div>
  );
};
