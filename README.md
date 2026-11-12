# Pilogram (PSCPP•Gram) 🚢📱

An Instagram-like, mobile-first flashcard & spaced-repetition web application designed for active recall study of the Brazilian Maritime Pilot Exam (**PSCPP** - *Processo Seletivo à Categoria de Praticante de Prático*).

---

## 🌟 Features

- **Instagram-Style Mobile Experience:** Zero login or user authentication required. Optimized for mobile viewports, including iPhone 14 (390px) up to tablet/desktop.
- **Themed Personas by Syllabus Section:** Posts are rendered as if published by fake verified accounts representing the 7 PSCPP sections and classic maritime authors (e.g. `@crenshaw.shiphandling`, `@pna.lewis.sname`, `@maurilio.artenaval`, `@macelrevey.squat`, `@normam12.dpc`, `@miguens.bowditch`, `@imo.smcp.comms`, `@ripeam72.colregs`).
- **Interactive Active Recall Post Formats:**
  - 🔄 **3D Flip Flashcards:** Tap to flip between question prompts, diagrams, answers, and *Foco de Prova* exam tips.
  - 📑 **Multi-Slide Carousels:** Swipe horizontally through step-by-step concepts and formulas.
  - 📍 **Annotated Infographics:** Interactive diagrams with clickable coordinate hotspots.
  - 🎬 **Reels-Style Loops:** Short visual summaries with key takeaways.
- **Smart Timeline Randomization & Spaced Repetition:**
  - Dynamic weighted shuffle ensuring balanced section variety without monotonous clumping.
  - Resurfaces previously seen cards and bookmarked weak spots.
  - Infinite scroll loop: when you finish reviewing all posts in the timeline, the feed reshuffles with a new seed so study flow never stops.
- **External Social Feed Mixer:** Space reserved for interleaving real posts from maritime Instagram and LinkedIn accounts to prevent study fatigue.
- **Lightweight Shared Hosting Architecture:** Built with React + TypeScript (Vite) and backed by a flat-file PHP 8 API. Requires zero database migrations and zero external AI API keys on the server.

---

## 📁 Repository Structure

```text
pilogram/
├── public/
│   ├── api/                  # PHP 8 backend endpoints (feed.php, exhausted.php, status.php, cron_external.php)
│   ├── content/              # Flat-file JSON content store
│   │   ├── personas.json     # Fake author profiles mapped to PSCPP sections
│   │   ├── external_accounts.json # Configured external Instagram/LinkedIn feeds
│   │   ├── state.json        # Server loop & cycle state
│   │   ├── posts/            # Self-contained study post JSON files & diagrams
│   │   └── external/         # Normalized external social media posts
│   ├── .htaccess             # Apache/LiteSpeed routing and cache headers
│   └── manifest.json         # PWA configuration
├── src/                      # Mobile-first React SPA (components, hooks, engine)
├── scripts/
│   ├── build-zip.sh          # Compiles production build into deploy-initial.zip
│   ├── deploy-ftp.sh         # Commits changes to Git and incrementally syncs via FTP
│   └── check-and-loop.sh     # Queries status.php for content generation loops
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PHP 8.0+ (for backend API execution / cPanel shared hosting)

### Local Development

1. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/tttamer/pilogram.git
   cd pilogram
   npm install
   ```

2. Start the local preview dev server:
   ```bash
   npm run dev
   ```

3. Run the automated test suite (Vitest + PHP integration tests):
   ```bash
   npm test
   ```

---

## 📦 Deployment to cPanel / Shared Hosting

### Option 1: Initial Upload via Zip (Recommended for first release)

1. Build the production package:
   ```bash
   npm run build:zip
   ```
2. In your cPanel **File Manager**, navigate to your web root (`public_html/` or a subdomain folder).
3. Upload `deploy-initial.zip` and click **Extract**.

### Option 2: Incremental FTP Deployment

1. Copy `.env.example` to `.env.deploy`:
   ```bash
   cp .env.example .env.deploy
   ```
2. Add your FTP credentials in `.env.deploy` (`.env.deploy` is strictly ignored by git and never committed).
3. Whenever you add new study cards or update code:
   ```bash
   npm run deploy:ftp
   ```

---

## 🔒 Security & Privacy Notice

- All credentials and server configurations must be stored exclusively in `.env.deploy` (which is git-ignored).
- Never commit passwords, private API keys, or personal server paths into this repository.

---

## 📄 License

MIT
