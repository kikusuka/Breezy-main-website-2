# Breezy Research — Truthful Multi-Model Research, IDE & Knowledge Platform

A unified, truth-first research platform, conversational AI, client-side repository IDE (Build), visual card Canvas, and Notes suite powered strictly by real backend SSE debate streams, genuine provider configurations, and sandboxed client runtimes without any simulated or synthetic telemetry.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following non-negotiable architectural mandates have been integrated into this revised plan:

- **Strict Truth-First & Zero-Fake-Data Policy**:
  - Prohibit all invented model names, mock token counts, fake consensus scores/percentages, fake latency numbers, or fabricated active badges.
  - When no model is assigned, the UI honestly displays *"No model assigned"* or *"Not connected"*.
  - Research streaming is driven solely by real SSE events from `/api/debate/stream` (`status`, `notice`, `research_plan`, `round_start`, `token`, `round_complete`, `evidence_graph`, `complete`, `error`).
  - Chat has no fake sources or citations. The output panel in Build is strictly titled **"Console"** (clarifying that no server terminal exists).
- **Comprehensive 11-Screen Hash Routing Architecture**:
  - Native window hash routing (`#landing`, `#chat`, `#research`, `#models`, `#history`, `#docs`, `#settings`, `#profile`, `#build`, `#canvas`, `#notes`) without third-party router bloat.
  - **Landing**: Truthful overview of the multi-perspective methodology and honest architecture.
  - **Research**: Depth selection (Solo = 1 round / solo, Standard = 2 rounds / trio, Deep = 4 rounds / quad), method selector, PDF/text attachments via `pdfService`, 6-stage tracker (Question → Exploration → Proposals → Challenge → Evidence → Synthesis) powered by real SSE, Markdown answer, sources/claims from `evidenceGraph`, and export.
  - **Chat**: Honest conversational Markdown console via `apiClient.chatBreezy`, persisted in local storage, with clear error messaging when no model is connected.
  - **Models**: BYOK key vault and local Ollama URL management via `providerConfigService`, 4-seat allocation (Architect, Skeptic, Verifier, Arbiter), real status from `effectiveProviderService`.
  - **History**: Real saved session management from `sessionStorage` (search, inspect, delete, Markdown/PDF export).
  - **Build (Repository IDE)**: Powered strictly by `ideService.ts` and `gitHubService.ts`. Connects GitHub via token, displays file tree via `GitHubIde.getTree`, opens tabs in `IdeWorkspace` with dirty tracking, commits to default branch, runs Python via Pyodide and JS in Web Worker, generates sandboxed HTML preview, and provides an AI coding agent panel (`askIdeAgent`) with per-file edit application.
  - **Canvas**: Visual workspace with interactive cards (`idea`, `research`, `code`, `task`), tagging, task toggle, filter/search, pinning from History, Markdown export, persisted in localStorage.
  - **Notes**: Distraction-free Markdown notepad and list manager persisted in localStorage.
  - **Docs**: Reference guides for Breezy architecture, debate protocol, and provider setup.
  - **Settings**: Search engine configuration (DuckDuckGo, Brave, SearXNG), research method presets, and heartbeat settings.
  - **Profile**: Account status and storage quota analytics via `storageQuotaService`.
- **Responsive Multi-Tier Layout (Mobile-First)**:
  - *Desktop (≥1024px / ≥1280px)*: Left navigation sidebar. Build workspace operates in 3 full columns (Files tree | Editor | Console/Preview/Agent).
  - *Laptops & Tablets (768px–1279px)*: 2 columns; collapsible file tree drawer with tabbed bottom output panel.
  - *Mobile Devices (<768px, down to 360px)*: Top header + 5-item bottom tab bar (Chat, Research, Models, Docs, More sheet). Build uses a segmented control (Files | Editor | Output | Agent) with 16px input font to prevent mobile viewport zoom, with zero horizontal page scroll.

---

### 1. Overview & Core Concept

- **What It Does**: Breezy provides an uncompromised, truthful research and developer workbench. It turns multi-model debate from a marketing buzzword into a concrete, observable asynchronous protocol where models cross-examine arguments and verify claims against real evidence graphs.
- **Target Audience / Persona**: Researchers, software engineers, and domain analysts who need verifiable technical answers, reproducible code experiments, and structured synthesis without synthetic AI filler.
- **Key Value**: 100% genuine execution. Every token, argument, claim, and commit maps directly to real API responses, browser execution engines (Pyodide, Web Workers), or GitHub commits.

---

### 2. User Experience & Visual Design

#### Navigation & Layout Strategy
- **Desktop Layout**: Fixed 240px dark slate sidebar displaying primary navigation links, active backend status indicator, and workspace controls.
- **Mobile Navigation (<1024px)**: Top bar displaying active workspace title and quick actions, combined with a persistent bottom tab bar (`Chat`, `Research`, `Models`, `Docs`, `More`). Tapping `More` opens a clean bottom drawer revealing `Build`, `Canvas`, `Notes`, `History`, `Settings`, and `Profile`.
- **Build IDE Adaptive Layout**:
  - `≥1280px`: 3 side-by-side columns: File Tree (260px) | Main Monospace Editor (flex-1) | Multi-tab Console & Agent Inspector (380px).
  - `768px–1279px`: 2 columns: Collapsible File Drawer | Editor with expandable bottom tray for Console, HTML Preview, and Agent.
  - `<768px`: Single full-width pane controlled by segmented pill tabs: `[Files | Editor | Output | Agent]`. Textarea styled with `text-base` (16px) to avoid iOS Safari auto-zoom.

#### Visual Theme & Tokens
- **Canvas Neutrals**: Deep obsidian and dark slate (`#0c0a09`, `#111319`, `#181b22`).
- **Structural Surfaces**: Subtle slate surfaces with thin hairline borders (`#1d212b`, `border-slate-800`).
- **Functional Accent Tokens**:
  - Primary Cyan (`#00b4d8`, `#4cd6fb`): Active selections, focus rings, primary actions.
  - Emerald Mint (`#10b981`, `#4edea3`): Verified evidence claims, clean git buffers, pass indicators.
  - Amber Warning (`#f59e0b`): Dirty file buffers, unassigned model seats.
- **Typography**:
  - Headings: `Plus Jakarta Sans` (bold, tight tracking).
  - Body Copy: `Inter` (neutral, high legibility).
  - Code, Citations, & Metadata: `JetBrains Mono` with strictly enforced `tabular-nums`.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Zero-Fake-Data Guardrail**
  - *Chosen Approach*: If no model is configured for a seat, display *"No model assigned"* rather than falling back to simulated text or sample scores. If a search produces no sources, show an honest empty list.
  - *Why*: User trust is destroyed when an application mixes simulated metrics with real data.
- **Decision 2: Sandboxed Browser Execution for Build**
  - *Chosen Approach*: Execute Python via in-browser Pyodide CDN runtime and JavaScript via terminateable Web Workers. HTML files render in sandboxed iframes (`sandbox="allow-scripts"`).
  - *Why*: Enables real code execution without requiring dangerous, costly, or non-existent backend remote code execution containers.
- **Decision 3: Plain Monospace Textarea for Editor**
  - *Chosen Approach*: High-performance `<textarea>` with custom Tab-key space insertion and 16px minimum font size.
  - *Why*: Immediate rock-solid mobile compatibility and lightweight bundle footprint before future CodeMirror integration.
- **Decision 4: Client-Side State Persistence for Notes & Canvas**
  - *Chosen Approach*: Save Canvas cards and Notes directly into `localStorage`, with structured Markdown export capabilities.
  - *Why*: Instant offline-first user experience without database migration dependencies.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        BREEZY UNIFIED APP SHELL                        │
│                 (Hash Router: #landing, #research, ...)                │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  Research Council         Breezy Chat            Build IDE (GitHub)    │
│  ┌──────────────────┐   ┌──────────────────┐   ┌─────────────────────┐ │
│  │ • 6-Stage SSE    │   │ • Real Markdown  │   │ • IdeWorkspace      │ │
│  │   Tracker        │   │ • Local Thread   │   │ • GitHub REST API   │ │
│  │ • Evidence Graph │   │ • Honest Model   │   │ • Pyodide / Worker  │ │
│  │ • PDF Attachment │   │   Errors         │   │ • Agent Edits       │ │
│  └─────────┬────────┘   └─────────┬────────┘   └──────────┬──────────┘ │
│            │                      │                       │            │
│  Knowledge & Storage    Models & BYOK Vault     Settings & Profile     │
│  ┌──────────────────┐   ┌──────────────────┐   ┌─────────────────────┐ │
│  │ • Canvas Cards   │   │ • Key Management │   │ • Search Engine     │ │
│  │ • Notes Pad      │   │ • 4 Seat Assign  │   │ • Storage Quotas    │ │
│  │ • Session Vault  │   │ • Ollama Detect  │   │ • Docs Guides       │ │
│  └─────────┬────────┘   └─────────┬────────┘   └──────────┬──────────┘ │
│            │                      │                       │            │
│            └──────────────────────┼───────────────────────┘            │
│                                   ▼                                    │
│                    ┌─────────────────────────────┐                     │
│                    │     Core Service Layer      │                     │
│                    │  • apiClient (Debate/Chat)  │                     │
│                    │  • providerConfigService    │                     │
│                    │  • effectiveProviderService │                     │
│                    │  • sessionStorage           │                     │
│                    │  • ideService & gitHub      │                     │
│                    └──────────────┬──────────────┘                     │
└───────────────────────────────────┼────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       EXPRESS PROXY & SSE SERVER                       │
│  • POST /api/debate/stream (SSE rounds: solo=1, trio=2, quad=4)        │
│  • POST /api/breezy/chat  • GET /api/health  • /api/ollama/*           │
└────────────────────────────────────────────────────────────────────────┘
```

#### Detailed State & Interaction Handling
- **Research Investigation Flow**:
  - Selecting depth configures `protocol` ('solo' | 'trio' | 'quad') and `selectedRound` (1 | 2 | 4).
  - Calling `apiClient.streamDebate` updates `stages` across the 6 milestones: Question formulation, Exploration, Proposals, Adversarial Challenge, Evidence verification, and Final Synthesis.
  - Streaming tokens append live to the active round container; evidence nodes and citations populate directly from `evidence_graph` events.
- **Build Screen Flow**:
  - Token is retrieved/stored via `getGitHubToken()` / `setGitHubToken()`.
  - Fetching repo tree with `GitHubIde.getTree` populates the file hierarchy.
  - Clicking a file invokes `workspace.open(path, content, sha)`.
  - Edits mark buffer dirty (`workspace.isDirty(path)`). Saving calls `workspace.save(token, repo, path)`.
  - Run action executes `runPython(code)` or `runJavaScript(code)` and writes timing and output into Console.
  - Preview renders via `buildPreviewDoc(activePath, allOpenFiles)` in an iframe.
  - Asking the agent calls `askIdeAgent` and displays diff proposals with per-file `Apply` buttons.
- **Canvas & Notes Flow**:
  - Canvas cards categorize items into `idea`, `research`, `code`, and `task` with completion toggles and tag filters.
  - Research sessions in History can be pinned directly into a Canvas card.
  - Notes provide an auto-saving Markdown editor with date-stamped entry list.
