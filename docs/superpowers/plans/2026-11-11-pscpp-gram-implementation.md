# PSCPP-Gram Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the mobile-first Instagram-like PSCPP study web app (`pscpp-gram`) with fake section personas, 4 study post formats (3D flip flashcard, carousel flashcard, interactive infographic, short video reel), external social feed mixer, weighted spaced-repetition randomization, cycle exhaustion loop, PHP 8 cPanel API, initial `.zip` bundler, and FTP deploy scripts.

**Architecture:** A mobile-first React 18 + TypeScript + Tailwind CSS Single-Page Application compiled via Vite into static assets (`dist/`), paired with a zero-dependency PHP 8 flat-file API (`public/api/*.php`) reading self-contained JSON posts from `public/content/posts/` and `public/content/external/`. Client memorization state (`seen_ids`, `bookmarked_ids`, `liked_ids`, `cycle`) persists in `localStorage` with an automatic client-side fallback engine when running statically or offline, while `api/exhausted.php` and `api/status.php` coordinate the local Antigravity content-generation loop.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, Lucide React icons, Vitest + Testing Library, PHP 8 CLI/CGI, Bash + Python FTP/Zip deployment scripts.

**Spec:** `/Users/ttamer/Documents/PSCPP/pscpp-gram/docs/superpowers/specs/2026-11-11-pscpp-gram-design.md`

## Global Constraints

- Zero authentication or user management: app opens directly into the timeline on iPhone Safari / Home Screen PWA (`max-w-[430px]` mobile shell, dark mode native Instagram aesthetic).
- Zero LLM API keys or external AI dependencies on the cPanel server: PHP 8 scripts only read/write flat JSON files in `content/`.
- Every study post is a self-contained JSON file in `public/content/posts/<id>.json` linked to a fake persona in `public/content/personas.json` representing one of the 7 PSCPP syllabus sections.
- Reaching `unseen_remaining === 0` must immediately reshuffle the timeline for uninterrupted infinite scrolling AND notify `api/exhausted.php` (`needs_generation: true`, `completed_cycles++`).
- Must include `npm run build:zip` (creates `deploy-initial.zip` for first cPanel upload), `npm run deploy:ftp` (commits to Git and syncs via FTP without clobbering server `content/state.json`), and `npm run loop:check` (checks `api/status.php` for local Antigravity loop).

## Review Focus

1. **Corrupted JSON file in `content/posts/` or `content/external/`:** If a broken `.json` file is uploaded to `content/posts/`, `api/feed.php` must skip that file gracefully and still return a valid HTTP 200 JSON feed of the remaining valid posts.
2. **All posts seen in current cycle (`unseen_remaining === 0`):** When `seen_ids` covers every post in the pool, the timeline engine must automatically reset the cycle's seen-list, increment the cycle counter, and return a newly shuffled non-empty batch instead of an empty feed.
3. **Corrupted or quota-exceeded `localStorage` on iPhone Safari (Private Browsing):** `useStudyMemory` must catch JSON parse and `localStorage.setItem` errors and fall back to in-memory state without crashing the UI.
4. **Section filter with only seen posts or empty external feed:** Selecting a Stories section ring (`sec-1`..`sec-7` or `bookmarks`) when all matching posts were already seen in the current cycle must still surface those section posts (in review mode) or show a clear empty-bookmarks state rather than triggering a false global cycle exhaustion.
5. **Monotonous consecutive section clumping:** When posts from multiple sections are available, the weighted shuffler must avoid placing 3+ posts from the exact same `section_id` back-to-back.

---

### Task 1: Project Scaffolding, TypeScript Schemas, Seed Content & Personas

**Files:**
- Create: `/Users/ttamer/Documents/PSCPP/pscpp-gram/package.json`
- Create: `/Users/ttamer/Documents/PSCPP/pscpp-gram/tsconfig.json`
- Create: `/Users/ttamer/Documents/PSCPP/pscpp-gram/vite.config.ts`
- Create: `/Users/ttamer/Documents/PSCPP/pscpp-gram/postcss.config.js`
- Create: `/Users/ttamer/Documents/PSCPP/pscpp-gram/tailwind.config.js`
- Create: `/Users/ttamer/Documents/PSCPP/pscpp-gram/index.html`
- Create: `/Users/ttamer/Documents/PSCPP/pscpp-gram/.gitignore`
- Create: `/Users/ttamer/Documents/PSCPP/pscpp-gram/.env.example`
- Create: `/Users/ttamer/Documents/PSCPP/pscpp-gram/public/manifest.json`
- Create: `/Users/ttamer/Documents/PSCPP/pscpp-gram/public/.htaccess`
- Create: `/Users/ttamer/Documents/PSCPP/pscpp-gram/src/types/post.ts`
- Create: `/Users/ttamer/Documents/PSCPP/pscpp-gram/public/content/personas.json`
- Create: `/Users/ttamer/Documents/PSCPP/pscpp-gram/public/content/state.json`
- Create: `/Users/ttamer/Documents/PSCPP/pscpp-gram/public/content/external_accounts.json`
- Create: `/Users/ttamer/Documents/PSCPP/pscpp-gram/public/content/posts/media/ship-vectors.svg`
- Create: `/Users/ttamer/Documents/PSCPP/pscpp-gram/public/content/posts/media/turning-circle.svg`
- Create: `/Users/ttamer/Documents/PSCPP/pscpp-gram/public/content/posts/2026-11-11-sec1-crenshaw-001.json`
- Create: `/Users/ttamer/Documents/PSCPP/pscpp-gram/public/content/posts/2026-11-11-sec1-pna-002.json`
- Create: `/Users/ttamer/Documents/PSCPP/pscpp-gram/public/content/posts/2026-11-11-sec2-artenaval-003.json`
- Create: `/Users/ttamer/Documents/PSCPP/pscpp-gram/public/content/posts/2026-11-11-sec3-squat-004.json`
- Create: `/Users/ttamer/Documents/PSCPP/pscpp-gram/public/content/posts/2026-11-11-sec4-normam-005.json`
- Create: `/Users/ttamer/Documents/PSCPP/pscpp-gram/public/content/posts/2026-11-11-sec5-bowditch-006.json`
- Create: `/Users/ttamer/Documents/PSCPP/pscpp-gram/public/content/posts/2026-11-11-sec6-cis-007.json`
- Create: `/Users/ttamer/Documents/PSCPP/pscpp-gram/public/content/posts/2026-11-11-sec7-colregs-008.json`
- Create: `/Users/ttamer/Documents/PSCPP/pscpp-gram/public/content/external/ext-linkedin-pilot-001.json`
- Create: `/Users/ttamer/Documents/PSCPP/pscpp-gram/public/content/external/ext-ig-shiphandling-002.json`
- Test: `/Users/ttamer/Documents/PSCPP/pscpp-gram/src/types/__tests__/seedContent.test.ts`

**Interfaces:**
- Produces:
  - `Persona`, `StudyPost`, `ExternalPost`, `TimelinePost`, `FeedRequest`, `FeedResponse`, `ServerLoopState`, `SectionFilter` in `src/types/post.ts`
  - `isValidStudyPost(raw: unknown): raw is StudyPost` and `isValidExternalPost(raw: unknown): raw is ExternalPost` in `src/types/post.ts`

- [ ] **Step 1: Create `package.json`, TypeScript/Vite/Tailwind configs, `.gitignore`, `.env.example`, `index.html`, `manifest.json`, and `.htaccess`**

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/package.json`:
```json
{
  "name": "pscpp-gram",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "build:zip": "bash scripts/build-zip.sh",
    "deploy:ftp": "bash scripts/deploy-ftp.sh",
    "loop:check": "bash scripts/check-and-loop.sh"
  },
  "dependencies": {
    "lucide-react": "^0.454.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.0.1",
    "@types/node": "^22.9.0",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.3",
    "autoprefixer": "^10.4.20",
    "jsdom": "^25.0.1",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.14",
    "typescript": "^5.6.3",
    "vite": "^5.4.10",
    "vitest": "^2.1.4"
  }
}
```

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "types": ["vitest/globals", "@testing-library/jest-dom", "node"]
  },
  "include": ["src", "scripts"]
}
```

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/vite.config.ts`:
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
```

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/postcss.config.js`:
```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/tailwind.config.js`:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/.gitignore`:
```text
node_modules/
dist/
deploy-initial.zip
.env.deploy
.DS_Store
```

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/.env.example`:
```text
# Copy to .env.deploy and fill with your cPanel FTP credentials
FTP_HOST=ftp.yourdomain.com
FTP_USER=cpanel_user@yourdomain.com
FTP_PASS=your_ftp_password
FTP_REMOTE_DIR=/public_html/pscpp-gram
SITE_URL=https://yourdomain.com/pscpp-gram
```

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/index.html`:
```html
<!doctype html>
<html lang="pt-BR" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
    />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="theme-color" content="#000000" />
    <link rel="manifest" href="./manifest.json" />
    <title>PSCPP•Gram — Praticagem Active Recall</title>
  </head>
  <body class="bg-black text-zinc-100 antialiased selection:bg-sky-500 selection:text-white">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/public/manifest.json`:
```json
{
  "name": "PSCPP•Gram Study Feed",
  "short_name": "PSCPP•Gram",
  "start_url": "./index.html",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#000000",
  "orientation": "portrait"
}
```

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/public/.htaccess`:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]
  RewriteRule ^ index.html [L]
</IfModule>

<IfModule mod_headers.c>
  <FilesMatch "\.(json)$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
  </FilesMatch>
</IfModule>
```

- [ ] **Step 2: Write the failing test `src/types/__tests__/seedContent.test.ts`**

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/src/types/__tests__/seedContent.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  isValidStudyPost,
  isValidExternalPost,
  type Persona,
  type ServerLoopState,
} from '../post';

const contentRoot = path.resolve(__dirname, '../../../public/content');

describe('Seed Content & Schema Validators', () => {
  it('validates personas covering all 7 PSCPP sections', () => {
    const raw = fs.readFileSync(path.join(contentRoot, 'personas.json'), 'utf-8');
    const personas = JSON.parse(raw) as Persona[];
    expect(Array.isArray(personas)).toBe(true);
    expect(personas.length).toBeGreaterThanOrEqual(7);

    const sections = new Set(personas.map((p) => p.section_id));
    for (let i = 1; i <= 7; i++) {
      expect(sections.has(`sec-${i}`)).toBe(true);
    }
  });

  it('validates all seed study posts in public/content/posts/*.json', () => {
    const postsDir = path.join(contentRoot, 'posts');
    const files = fs.readdirSync(postsDir).filter((f) => f.endsWith('.json'));
    expect(files.length).toBeGreaterThanOrEqual(8);

    const formats = new Set<string>();
    for (const file of files) {
      const data = JSON.parse(fs.readFileSync(path.join(postsDir, file), 'utf-8'));
      expect(isValidStudyPost(data)).toBe(true);
      formats.add(data.format);
    }

    expect(formats.has('flashcard_flip')).toBe(true);
    expect(formats.has('flashcard_carousel')).toBe(true);
    expect(formats.has('infographic')).toBe(true);
    expect(formats.has('short_video')).toBe(true);
  });

  it('rejects malformed study post objects', () => {
    expect(isValidStudyPost(null)).toBe(false);
    expect(isValidStudyPost({ id: 'bad-post' })).toBe(false);
    expect(isValidExternalPost({ id: 'missing-fields' })).toBe(false);
  });

  it('validates seed external posts and server state.json', () => {
    const extDir = path.join(contentRoot, 'external');
    const extFiles = fs.readdirSync(extDir).filter((f) => f.endsWith('.json'));
    expect(extFiles.length).toBeGreaterThanOrEqual(2);

    for (const file of extFiles) {
      const data = JSON.parse(fs.readFileSync(path.join(extDir, file), 'utf-8'));
      expect(isValidExternalPost(data)).toBe(true);
    }

    const state = JSON.parse(
      fs.readFileSync(path.join(contentRoot, 'state.json'), 'utf-8')
    ) as ServerLoopState;
    expect(typeof state.needs_generation).toBe('boolean');
    expect(typeof state.completed_cycles).toBe('number');
  });
});
```

- [ ] **Step 3: Install dependencies and run the test to verify it fails**

Run: `cd /Users/ttamer/Documents/PSCPP/pscpp-gram && npm install && npx vitest run src/types/__tests__/seedContent.test.ts`
Expected: FAIL because `../post` and seed JSON files do not exist yet.

- [ ] **Step 4: Create `src/types/post.ts` and seed content files in `public/content/`**

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/src/types/post.ts`:
```ts
export type SectionId =
  | 'sec-1'
  | 'sec-2'
  | 'sec-3'
  | 'sec-4'
  | 'sec-5'
  | 'sec-6'
  | 'sec-7';

export type SectionFilter = 'all' | SectionId | 'external' | 'bookmarks';

export type StudyPostFormat =
  | 'flashcard_flip'
  | 'flashcard_carousel'
  | 'infographic'
  | 'short_video';

export interface Persona {
  id: string;
  handle: string;
  display_name: string;
  avatar_color: string;
  avatar_initials: string;
  section_id: SectionId;
  section_name: string;
  bio: string;
  verified: boolean;
}

export interface StudySlide {
  type: 'question' | 'answer' | 'concept' | 'trap';
  title: string;
  prompt?: string;
  body?: string;
  exam_tip?: string;
  media_url?: string | null;
}

export interface InfographicHotspot {
  id: string;
  x: number;
  y: number;
  label: string;
  detail: string;
}

export interface InfographicPayload {
  image_url: string;
  summary: string;
  hotspots: InfographicHotspot[];
}

export interface VideoReelPayload {
  video_url?: string | null;
  animated_svg_url?: string | null;
  duration_seconds: number;
  hook_overlay: string;
  key_takeaways: string[];
}

export interface StudyPost {
  id: string;
  created_at: string;
  batch_cycle: number;
  persona_id: string;
  section_id: SectionId;
  source: {
    book: string;
    chapter: string;
    pages: string;
    anchor_concept: string;
  };
  format: StudyPostFormat;
  slides: StudySlide[];
  infographic: InfographicPayload | null;
  video: VideoReelPayload | null;
  caption: string;
  tags: string[];
  difficulty: 1 | 2 | 3;
  is_external?: false;
}

export interface ExternalPost {
  id: string;
  created_at: string;
  is_external: true;
  platform: 'instagram' | 'linkedin';
  author: {
    handle: string;
    display_name: string;
    role: string;
    profile_url: string;
  };
  media_url: string | null;
  headline: string;
  caption: string;
  external_url: string;
  tags: string[];
}

export type TimelinePost = StudyPost | ExternalPost;

export interface ServerLoopState {
  needs_generation: boolean;
  completed_cycles: number;
  last_exhausted_at: string | null;
  last_generated_at: string;
  total_study_posts: number;
}

export interface FeedRequest {
  seed: number;
  section_filter: SectionFilter;
  seen_ids: string[];
  bookmarked_ids: string[];
  limit?: number;
}

export interface FeedResponse {
  posts: TimelinePost[];
  personas: Record<string, Persona>;
  unseen_remaining: number;
  total_study_posts: number;
  cycle_reset_triggered: boolean;
  server_state: ServerLoopState;
}

export function isValidStudyPost(raw: unknown): raw is StudyPost {
  if (!raw || typeof raw !== 'object') return false;
  const obj = raw as Record<string, unknown>;
  const validFormats = [
    'flashcard_flip',
    'flashcard_carousel',
    'infographic',
    'short_video',
  ];
  return (
    typeof obj.id === 'string' &&
    typeof obj.created_at === 'string' &&
    typeof obj.persona_id === 'string' &&
    typeof obj.section_id === 'string' &&
    typeof obj.format === 'string' &&
    validFormats.includes(obj.format) &&
    typeof obj.source === 'object' &&
    obj.source !== null &&
    Array.isArray(obj.slides) &&
    typeof obj.caption === 'string'
  );
}

export function isValidExternalPost(raw: unknown): raw is ExternalPost {
  if (!raw || typeof raw !== 'object') return false;
  const obj = raw as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    obj.is_external === true &&
    (obj.platform === 'instagram' || obj.platform === 'linkedin') &&
    typeof obj.author === 'object' &&
    obj.author !== null &&
    typeof obj.caption === 'string' &&
    typeof obj.external_url === 'string'
  );
}
```

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/public/content/personas.json`:
```json
[
  {
    "id": "crenshaw.shiphandling",
    "handle": "crenshaw.shiphandling",
    "display_name": "Capt. R. S. Crenshaw Jr.",
    "avatar_color": "from-sky-500 to-blue-700",
    "avatar_initials": "RC",
    "section_id": "sec-1",
    "section_name": "Seção I – Manobrabilidade",
    "bio": "O Prático Militar Clássico • Forces Affecting the Ship",
    "verified": true
  },
  {
    "id": "pna.lewis",
    "handle": "pna.lewis.sname",
    "display_name": "Lewis • PNA (Vol. II & III)",
    "avatar_color": "from-indigo-500 to-purple-700",
    "avatar_initials": "PNA",
    "section_id": "sec-1",
    "section_name": "Seção I – Manobrabilidade",
    "bio": "SNAME • Resistência, Propulsão e Controlabilidade",
    "verified": true
  },
  {
    "id": "arte.naval",
    "handle": "maurilio.artenaval",
    "display_name": "Comte. Maurílio • Arte Naval",
    "avatar_color": "from-amber-500 to-orange-700",
    "avatar_initials": "AN",
    "section_id": "sec-2",
    "section_name": "Seção II – Arte Naval",
    "bio": "Marinha do Brasil • Amarração, Fundeio e Cabos",
    "verified": true
  },
  {
    "id": "aguas.restritas",
    "handle": "macelrevey.squat",
    "display_name": "MacElrevey & Tug Use in Port",
    "avatar_color": "from-emerald-500 to-teal-700",
    "avatar_initials": "AR",
    "section_id": "sec-3",
    "section_name": "Seção III – Águas Restritas",
    "bio": "Squat, Bank Effect, Interação e Rebocadores ASD",
    "verified": true
  },
  {
    "id": "legislacao.normam",
    "handle": "normam12.dpc",
    "display_name": "DPC • LESTA & NORMAM-311",
    "avatar_color": "from-rose-500 to-red-700",
    "avatar_initials": "DP",
    "section_id": "sec-4",
    "section_name": "Seção IV – Legislação",
    "bio": "LESTA, RLESTA e Normas da Autoridade Marítima",
    "verified": true
  },
  {
    "id": "migueles.bowditch",
    "handle": "miguens.bowditch",
    "display_name": "Miguens & Bowditch • Nav",
    "avatar_color": "from-cyan-500 to-sky-700",
    "avatar_initials": "MB",
    "section_id": "sec-5",
    "section_name": "Seção V – Meteo e Navegação",
    "bio": "Navegação Eletrônica, Radar/ARPA, Marés e Meteorologia",
    "verified": true
  },
  {
    "id": "imo.smcp.cis",
    "handle": "imo.smcp.comms",
    "display_name": "IMO SMCP & Código CIS",
    "avatar_color": "from-yellow-500 to-amber-700",
    "avatar_initials": "CI",
    "section_id": "sec-6",
    "section_name": "Seção VI – Comunicações",
    "bio": "Fraseologia Padrão IMO e Sinais Internacionais",
    "verified": true
  },
  {
    "id": "ripeam.colregs",
    "handle": "ripeam72.colregs",
    "display_name": "RIPEAM-72 • COLREGs",
    "avatar_color": "from-fuchsia-500 to-pink-700",
    "avatar_initials": "72",
    "section_id": "sec-7",
    "section_name": "Seção VII – Conhecimentos Gerais",
    "bio": "Regras de Governo, Luzes, Marcas e Sinais Sonoros",
    "verified": true
  }
]
```

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/public/content/state.json`:
```json
{
  "needs_generation": false,
  "completed_cycles": 0,
  "last_exhausted_at": null,
  "last_generated_at": "2026-11-11T22:00:00Z",
  "total_study_posts": 8
}
```

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/public/content/external_accounts.json`:
```json
{
  "accounts": [
    {
      "id": "linkedin-maritime-pilots",
      "platform": "linkedin",
      "handle": "brazilian-maritime-pilots",
      "display_name": "Praticagem do Brasil • LinkedIn",
      "feed_url": "",
      "enabled": true
    },
    {
      "id": "instagram-shiphandling",
      "platform": "instagram",
      "handle": "shiphandling.pro",
      "display_name": "Shiphandling & Tug Ops • IG",
      "feed_url": "",
      "enabled": true
    }
  ]
}
```

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/public/content/posts/media/ship-vectors.svg`:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" fill="none">
  <rect width="400" height="300" rx="16" fill="#090D16"/>
  <path d="M200 40 C235 90 240 200 225 255 L175 255 C160 200 165 90 200 40 Z" stroke="#38BDF8" stroke-width="3" fill="#0F172A"/>
  <circle cx="200" cy="145" r="5" fill="#FACC15"/>
  <text x="212" y="149" fill="#FACC15" font-size="13" font-family="sans-serif">G (CG)</text>
  <line x1="200" y1="255" x2="255" y2="255" stroke="#F43F5E" stroke-width="4"/>
  <polygon points="255,250 268,255 255,260" fill="#F43F5E"/>
  <text x="225" y="280" fill="#F43F5E" font-size="12" font-family="sans-serif">Força Transversal (BE)</text>
  <line x1="200" y1="70" x2="145" y2="70" stroke="#34D399" stroke-width="4"/>
  <polygon points="145,65 132,70 145,75" fill="#34D399"/>
  <text x="80" y="55" fill="#34D399" font-size="12" font-family="sans-serif">Tendência da Proa (BB)</text>
</svg>
```

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/public/content/posts/media/turning-circle.svg`:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" fill="none">
  <rect width="400" height="300" rx="16" fill="#090D16"/>
  <path d="M90 260 L90 150 C90 65 290 65 290 160 C290 240 140 240 140 160" stroke="#38BDF8" stroke-width="3" stroke-dasharray="6 4" fill="none"/>
  <line x1="50" y1="150" x2="340" y2="150" stroke="#475569" stroke-width="1.5"/>
  <line x1="90" y1="75" x2="290" y2="75" stroke="#F59E0B" stroke-width="2"/>
  <text x="145" y="65" fill="#F59E0B" font-size="12" font-family="sans-serif">Diâmetro Tático (TD)</text>
  <text x="20" y="115" fill="#A855F7" font-size="12" font-family="sans-serif">Avanço (Advance)</text>
</svg>
```

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/public/content/posts/2026-11-11-sec1-crenshaw-001.json`:
```json
{
  "id": "2026-11-11-sec1-crenshaw-001",
  "created_at": "2026-11-11T22:00:00Z",
  "batch_cycle": 1,
  "persona_id": "crenshaw.shiphandling",
  "section_id": "sec-1",
  "source": {
    "book": "Crenshaw – Naval Shiphandling (4ª ed.)",
    "chapter": "Cap. 2 – Forces Affecting the Ship",
    "pages": "p. 18–24",
    "anchor_concept": "Quatro Efeitos do Hélice no Casco Monohélice"
  },
  "format": "flashcard_flip",
  "slides": [
    {
      "type": "question",
      "title": "Partida do Repouso com Hélice de Passo Direito",
      "prompt": "Em um navio monohélice de passo direito (rotação horária em marcha AV) partindo do repouso sem vento/corrente, para onde caem a POPA e a PROA inicialmente?",
      "media_url": "./content/posts/media/ship-vectors.svg"
    },
    {
      "type": "answer",
      "title": "Popa para Boreste • Proa para Bombordo",
      "body": "A pressão lateral das pás (Side Force) predomina no início antes de o navio ganhar seguimento: a pá inferior atua em água mais profunda e densa que a superior, empurrando a popa para Boreste.",
      "exam_tip": "Pegadinha clássica: Em marcha a ré (AR), tanto a pressão lateral quanto a corrente de descarga na carena empurram a popa fortemente para Bombordo (proa para Boreste)."
    }
  ],
  "infographic": null,
  "video": null,
  "caption": "Toque no card para virar! Regra número 1 do Crenshaw para manobra de navio monohélice. #Manobrabilidade #Crenshaw #PSCPP",
  "tags": ["Manobrabilidade", "Crenshaw", "Hélice", "SideForce"],
  "difficulty": 2
}
```

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/public/content/posts/2026-11-11-sec1-pna-002.json`:
```json
{
  "id": "2026-11-11-sec1-pna-002",
  "created_at": "2026-11-11T22:01:00Z",
  "batch_cycle": 1,
  "persona_id": "pna.lewis",
  "section_id": "sec-1",
  "source": {
    "book": "Lewis – Principles of Naval Architecture (Vol. III)",
    "chapter": "Cap. IX – Controllability",
    "pages": "p. 195–204",
    "anchor_concept": "Fases da Curva de Giro (Turning Circle)"
  },
  "format": "infographic",
  "slides": [],
  "infographic": {
    "image_url": "./content/posts/media/turning-circle.svg",
    "summary": "Toque nos pontos do esquema para revisar as 3 fases da Curva de Evolução e os parâmetros geométricos cobrados pelo PNA.",
    "hotspots": [
      {
        "id": "hs-1",
        "x": 24,
        "y": 58,
        "label": "1ª Fase (Manobra)",
        "detail": "Inicia no instante de carregar o leme. A força lateral do leme gera deriva inicial para o bordo OPOSTO ao da guinada antes de o momento hidrodinâmico vencer a inércia."
      },
      {
        "id": "hs-2",
        "x": 48,
        "y": 28,
        "label": "Avanço & Transferência",
        "detail": "Medidos em relação à derrota original quando o aproamento varia de 90°. O Ponto Pivot (P) desloca-se para vante (cerca de L/4 a L/3 a partir da proa)."
      },
      {
        "id": "hs-3",
        "x": 72,
        "y": 52,
        "label": "3ª Fase (Regime Permanente)",
        "detail": "Equilíbrio entre forças hidrodinâmicas, empuxo, leme e força centrífuga: velocidade linear reduzida constante, ângulo de deriva (β) constante e razão de guinada constante."
      }
    ]
  },
  "video": null,
  "caption": "Infográfico interativo da Curva de Giro (PNA Vol. III). Toque nos pinos numerados para abrir os detalhes de prova. #PNA #TurningCircle #PSCPP",
  "tags": ["PNA", "CurvaDeGiro", "Controlabilidade"],
  "difficulty": 3
}
```

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/public/content/posts/2026-11-11-sec2-artenaval-003.json`:
```json
{
  "id": "2026-11-11-sec2-artenaval-003",
  "created_at": "2026-11-11T22:02:00Z",
  "batch_cycle": 1,
  "persona_id": "arte.naval",
  "section_id": "sec-2",
  "source": {
    "book": "Maurílio Fonseca – Arte Naval (Vol. I)",
    "chapter": "Cap. 5 – Aparelho de Fundear e Suspender",
    "pages": "p. 265–280",
    "anchor_concept": "Quartelada Padrão de Amarração e Filame"
  },
  "format": "flashcard_carousel",
  "slides": [
    {
      "type": "question",
      "title": "Slide 1/3 • Quartelada de Amarra",
      "prompt": "Qual o comprimento exato de 1 quartelada padrão de amarra no sistema inglês/brasileiro e onde ficam as manilhas de união (Kenter)?"
    },
    {
      "type": "concept",
      "title": "Slide 2/3 • 15 Braças = 27,5 Metros",
      "body": "Uma quartelada padrão mede 15 braças (27,43 m, adotado 27,5 m). Os quartéis são unidos por manilhas Kenter; os elos adjacentes recebem pintura branca e voltas de arame nos estais para contagem noturna/visual no escovém."
    },
    {
      "type": "trap",
      "title": "Slide 3/3 • Foco de Prova: Poder de Unhar",
      "body": "A catenária da amarra garante tração horizontal no anete da âncora. Se a tração formar ângulo elevado com o fundo por falta de filame, a âncora garrará.",
      "exam_tip": "Regra prática em bom tenedouro: 3 a 5 vezes a profundidade em condições normais; 5 a 7 vezes sob mau tempo."
    }
  ],
  "infographic": null,
  "video": null,
  "caption": "Deslize para o lado 👉 Revisão rápida de Arte Naval: quarteladas, marcação da amarra e filame. #ArteNaval #Fundeio #PSCPP",
  "tags": ["ArteNaval", "Fundeio", "Amarra"],
  "difficulty": 1
}
```

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/public/content/posts/2026-11-11-sec3-squat-004.json`:
```json
{
  "id": "2026-11-11-sec3-squat-004",
  "created_at": "2026-11-11T22:03:00Z",
  "batch_cycle": 1,
  "persona_id": "aguas.restritas",
  "section_id": "sec-3",
  "source": {
    "book": "MacElrevey – Shiphandling for the Mariner (5ª ed.)",
    "chapter": "Cap. 2 – Shallow Water & Bank Effect",
    "pages": "p. 31–48",
    "anchor_concept": "Lei Quadrática da Velocidade no Efeito Squat"
  },
  "format": "short_video",
  "slides": [],
  "infographic": null,
  "video": {
    "video_url": null,
    "animated_svg_url": "./content/posts/media/ship-vectors.svg",
    "duration_seconds": 15,
    "hook_overlay": "REEL • Por que reduzir a velocidade pela metade corta o Squat em 75%?",
    "key_takeaways": [
      "O Squat varia aproximadamente com o QUADRADO da velocidade na água (V²).",
      "Navios de grande Coeficiente de Bloco (Cb > 0,70, como graneleiros/petroleiros) afundam mais de PROA.",
      "Navios finos (Cb < 0,70, porta-contêineres rápidos) tendem a afundar mais de POPA.",
      "Sinais de alerta em águas rasas: aumento da vibração na popa, queda de RPM, perda de resposta do leme e aumento do Diâmetro Tático."
    ]
  },
  "caption": "Reel de 15s: A física de Bernoulli sob a quilha em águas rasas. #Squat #ShallowWater #MacElrevey #PSCPP",
  "tags": ["ÁguasRestritas", "Squat", "Bernoulli"],
  "difficulty": 2
}
```

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/public/content/posts/2026-11-11-sec4-normam-005.json`:
```json
{
  "id": "2026-11-11-sec4-normam-005",
  "created_at": "2026-11-11T22:04:00Z",
  "batch_cycle": 1,
  "persona_id": "legislacao.normam",
  "section_id": "sec-4",
  "source": {
    "book": "Lei 9.537/97 (LESTA) & NORMAM-311/DPC",
    "chapter": "Cap. III – Do Serviço de Praticagem",
    "pages": "Art. 12 a 15",
    "anchor_concept": "Indisponibilidade e Impossibilidade de Recusa do Prático"
  },
  "format": "flashcard_flip",
  "slides": [
    {
      "type": "question",
      "title": "LESTA Art. 13 • Deveres do Prático",
      "prompt": "Pode o Prático recusar-se à prestação do serviço de praticagem para o qual foi escalado na Zona de Praticagem?"
    },
    {
      "type": "answer",
      "title": "NÃO — Salvo Perigo à Segurança ou Motivo Justo",
      "body": "O serviço de praticagem é atividade essencial e deve estar permanentemente disponível. O Prático NÃO pode recusar-se à prestação do serviço, sob pena de suspensão do certificado de habilitação ou, em caso de reincidência, cancelamento.",
      "exam_tip": "A LESTA prevê que a Autoridade Marítima pode fixar o preço do serviço caso não haja acordo e para assegurar a continuidade do serviço."
    }
  ],
  "infographic": null,
  "video": null,
  "caption": "Artigo cravado em toda prova do PSCPP. Toque para conferir a sanção exata da LESTA. #LESTA #NORMAM #PSCPP",
  "tags": ["Legislação", "LESTA", "NORMAM311"],
  "difficulty": 1
}
```

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/public/content/posts/2026-11-11-sec5-bowditch-006.json`:
```json
{
  "id": "2026-11-11-sec5-bowditch-006",
  "created_at": "2026-11-11T22:05:00Z",
  "batch_cycle": 1,
  "persona_id": "migueles.bowditch",
  "section_id": "sec-5",
  "source": {
    "book": "Miguens – Navegação: A Ciência e a Arte (Vol. I & III)",
    "chapter": "Navegação Radar e ARPA",
    "pages": "Cap. 14 & 40",
    "anchor_concept": "Estabilização Sea-Stabilized vs Ground-Stabilized no ARPA"
  },
  "format": "flashcard_carousel",
  "slides": [
    {
      "type": "question",
      "title": "Slide 1/2 • ARPA para Anticolisão (RIPEAM)",
      "prompt": "Para avaliação de risco de colisão e manobra segundo o RIPEAM, o vetor de movimento no ARPA deve estar estabilizado em relação à ÁGUA (Sea) ou ao FUNDO (Ground)?"
    },
    {
      "type": "answer",
      "title": "Slide 2/2 • Sea-Stabilized para Anticolisão!",
      "body": "Estabilizado na ÁGUA (Sea-Stabilized, via odômetro/bússola) mostra o rumo e a velocidade do alvo na massa d'água (aspecto real das luzes de navegação). Já o Ground-Stabilized (GPS/Doppler) é ideal para navegação costeira e controle de abatimento/corrente em canais.",
      "exam_tip": "A IMO e o Miguens destacam que usar Ground-Stabilized em áreas de forte corrente pode induzir erro grave na estimativa do aspecto (proa) do navio-alvo."
    }
  ],
  "infographic": null,
  "video": null,
  "caption": "Diferença vital entre Sea-Stabilized e Ground-Stabilized no ARPA/Radar. #Miguens #Bowditch #ARPA #PSCPP",
  "tags": ["Navegação", "Miguens", "ARPA", "Radar"],
  "difficulty": 2
}
```

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/public/content/posts/2026-11-11-sec6-cis-007.json`:
```json
{
  "id": "2026-11-11-sec6-cis-007",
  "created_at": "2026-11-11T22:06:00Z",
  "batch_cycle": 1,
  "persona_id": "imo.smcp.cis",
  "section_id": "sec-6",
  "source": {
    "book": "Código Internacional de Sinais (CIS) & IMO SMCP",
    "chapter": "Sinais de Uma Letra",
    "pages": "Cap. I",
    "anchor_concept": "Bandeiras H, G e I na Praticagem"
  },
  "format": "flashcard_flip",
  "slides": [
    {
      "type": "question",
      "title": "CIS • Bandeiras de 1 Letra da Praticagem",
      "prompt": "Qual a diferença exata no CIS entre as bandeiras G (Golf), H (Hotel) e K (Kilo)?"
    },
    {
      "type": "answer",
      "title": "G = Solicito Prático • H = Tenho Prático a Bordo",
      "body": "• Golf (G): Solicito Prático.\n• Hotel (H): Tenho Prático a bordo.\n• Kilo (K): Desejo comunicar-me com você.",
      "exam_tip": "No SMCP, lembre-se dos Message Markers: INFORMATION, INTENTION, WARNING, ADVICE, REQUEST, QUESTION, ANSWER, INSTRUCTION."
    }
  ],
  "infographic": null,
  "video": null,
  "caption": "Trinca obrigatória do CIS + Message Markers do IMO SMCP. #CIS #SMCP #Comunicações #PSCPP",
  "tags": ["Comunicações", "CIS", "SMCP"],
  "difficulty": 1
}
```

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/public/content/posts/2026-11-11-sec7-colregs-008.json`:
```json
{
  "id": "2026-11-11-sec7-colregs-008",
  "created_at": "2026-11-11T22:07:00Z",
  "batch_cycle": 1,
  "persona_id": "ripeam.colregs",
  "section_id": "sec-7",
  "source": {
    "book": "RIPEAM-72 (COLREGs)",
    "chapter": "Regra 9 – Canais Estreitos & Regra 34(c)",
    "pages": "Regras 9 e 34",
    "anchor_concept": "Ultrapassagem em Canal Estreito com Manobra do Alcançado"
  },
  "format": "flashcard_carousel",
  "slides": [
    {
      "type": "question",
      "title": "Slide 1/2 • RIPEAM Regra 9(e) + 34(c)",
      "prompt": "Em um canal estreito, quando a ultrapassagem só pode ocorrer se o navio alcançado manobrar para permitir passagem segura, quais apitos de proposta e concordância são exigidos?"
    },
    {
      "type": "answer",
      "title": "Slide 2/2 • Proposta (2L+1C / 2L+2C) e Concordância",
      "body": "• Alcançador propõe por BE: 2 apitos longos + 1 curto (––•)\n• Alcançador propõe por BB: 2 apitos longos + 2 curtos (––••)\n• Alcançado concorda: 1 longo, 1 curto, 1 longo, 1 curto (–•–•) — letra Charlie no Morse.\n• Em caso de dúvida: no mínimo 5 apitos curtos e rápidos (•••••).",
      "exam_tip": "A Regra 9(e)(ii) ressalta que esta regra NÃO isenta a embarcação alcançadora de sua obrigação segundo a Regra 13."
    }
  ],
  "infographic": null,
  "video": null,
  "caption": "Regra 9 + 34(c) do RIPEAM na ponta da língua! #RIPEAM #COLREGs #CanaisEstreitos #PSCPP",
  "tags": ["RIPEAM", "COLREGs", "Regra9", "Regra34"],
  "difficulty": 2
}
```

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/public/content/external/ext-linkedin-pilot-001.json`:
```json
{
  "id": "ext-linkedin-pilot-001",
  "created_at": "2026-11-11T19:30:00Z",
  "is_external": true,
  "platform": "linkedin",
  "author": {
    "handle": "brazilian-maritime-pilots",
    "display_name": "Praticagem do Brasil • LinkedIn",
    "role": "External Maritime Feed • LinkedIn",
    "profile_url": "https://www.linkedin.com"
  },
  "media_url": "./content/posts/media/turning-circle.svg",
  "headline": "Manobra de Evolução de Suezmax com 2 Rebocadores ASD",
  "caption": "Caso real de evolução em bacia de evolução restrita com corrente de vazante de 2,5 nós. Espaço reservado para sincronização automática das suas contas reais do LinkedIn.",
  "external_url": "https://www.linkedin.com",
  "tags": ["LinkedInFeed", "PraticagemReal", "TugOps"]
}
```

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/public/content/external/ext-ig-shiphandling-002.json`:
```json
{
  "id": "ext-ig-shiphandling-002",
  "created_at": "2026-11-11T20:15:00Z",
  "is_external": true,
  "platform": "instagram",
  "author": {
    "handle": "shiphandling.pro",
    "display_name": "Shiphandling & Tug Ops • IG",
    "role": "External Maritime Feed • Instagram",
    "profile_url": "https://www.instagram.com"
  },
  "media_url": "./content/posts/media/ship-vectors.svg",
  "headline": "Indirect Towing Mode vs Direct Pull at 8 Knots",
  "caption": "Post externo do Instagram intercalado na timeline para descanso ativo entre os blocos de estudo do PSCPP.",
  "external_url": "https://www.instagram.com",
  "tags": ["InstagramFeed", "Shiphandling", "IndirectTowing"]
}
```

- [ ] **Step 5: Run the test to verify it passes and commit**

Run: `cd /Users/ttamer/Documents/PSCPP/pscpp-gram && npx vitest run src/types/__tests__/seedContent.test.ts`
Expected: PASS (4 passed)

Commit:
```bash
cd /Users/ttamer/Documents/PSCPP/pscpp-gram
git add package.json package-lock.json tsconfig.json vite.config.ts postcss.config.js tailwind.config.js index.html .gitignore .env.example public/ src/types/
git commit -m "feat: scaffold pscpp-gram project, schemas, personas, and 7-section seed posts"
```

---

### Task 2: Weighted Timeline Randomization, Spaced-Repetition Engine & Memory Store

**Files:**
- Create: `/Users/ttamer/Documents/PSCPP/pscpp-gram/src/lib/timelineEngine.ts`
- Create: `/Users/ttamer/Documents/PSCPP/pscpp-gram/src/hooks/useStudyMemory.ts`
- Create: `/Users/ttamer/Documents/PSCPP/pscpp-gram/src/hooks/useTimeline.ts`
- Test: `/Users/ttamer/Documents/PSCPP/pscpp-gram/src/lib/__tests__/timelineEngine.test.ts`
- Test: `/Users/ttamer/Documents/PSCPP/pscpp-gram/src/hooks/__tests__/useStudyMemory.test.ts`

**Interfaces:**
- Consumes: `StudyPost`, `ExternalPost`, `TimelinePost`, `Persona`, `FeedRequest`, `FeedResponse`, `SectionFilter` from `src/types/post.ts`
- Produces:
  - `buildTimelineBatch(studyPosts: StudyPost[], externalPosts: ExternalPost[], personas: Persona[], request: FeedRequest, serverState?: ServerLoopState): FeedResponse` in `src/lib/timelineEngine.ts`
  - `useStudyMemory()` hook in `src/hooks/useStudyMemory.ts`
  - `useTimeline()` hook in `src/hooks/useTimeline.ts`

- [ ] **Step 1: Write the failing unit tests `src/lib/__tests__/timelineEngine.test.ts` and `src/hooks/__tests__/useStudyMemory.test.ts`**

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/src/lib/__tests__/timelineEngine.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { buildTimelineBatch } from '../timelineEngine';
import type { Persona, StudyPost, ExternalPost } from '../../types/post';

const contentRoot = path.resolve(__dirname, '../../../public/content');
const personas: Persona[] = JSON.parse(
  fs.readFileSync(path.join(contentRoot, 'personas.json'), 'utf-8')
);
const studyPosts: StudyPost[] = fs
  .readdirSync(path.join(contentRoot, 'posts'))
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(fs.readFileSync(path.join(contentRoot, 'posts', f), 'utf-8')));
const externalPosts: ExternalPost[] = fs
  .readdirSync(path.join(contentRoot, 'external'))
  .filter((f) => f.endsWith('.json'))
  .map((f) =>
    JSON.parse(fs.readFileSync(path.join(contentRoot, 'external', f), 'utf-8'))
  );

describe('timelineEngine — Weighted Randomization & Loop Logic', () => {
  it('mixes unseen study posts with external social posts and varies order by seed', () => {
    const batchA = buildTimelineBatch(studyPosts, externalPosts, personas, {
      seed: 101,
      section_filter: 'all',
      seen_ids: [],
      bookmarked_ids: [],
      limit: 10,
    });
    const batchB = buildTimelineBatch(studyPosts, externalPosts, personas, {
      seed: 9999,
      section_filter: 'all',
      seen_ids: [],
      bookmarked_ids: [],
      limit: 10,
    });

    expect(batchA.posts.length).toBeGreaterThan(0);
    expect(batchA.posts.some((p) => p.is_external === true)).toBe(true);
    expect(batchA.posts.map((p) => p.id)).not.toEqual(
      batchB.posts.map((p) => p.id)
    );
  });

  it('triggers cycle_reset_triggered when all study posts have been seen in global feed (Review Focus #2)', () => {
    const allIds = studyPosts.map((p) => p.id);
    const result = buildTimelineBatch(studyPosts, externalPosts, personas, {
      seed: 42,
      section_filter: 'all',
      seen_ids: allIds,
      bookmarked_ids: [allIds[0]],
      limit: 10,
    });

    expect(result.cycle_reset_triggered).toBe(true);
    expect(result.posts.length).toBeGreaterThanOrEqual(8);
  });

  it('handles section_filter when all section posts were already seen without triggering global cycle reset (Review Focus #4)', () => {
    const sec1Ids = studyPosts
      .filter((p) => p.section_id === 'sec-1')
      .map((p) => p.id);
    const result = buildTimelineBatch(studyPosts, externalPosts, personas, {
      seed: 77,
      section_filter: 'sec-1',
      seen_ids: sec1Ids,
      bookmarked_ids: [],
      limit: 10,
    });

    expect(result.cycle_reset_triggered).toBe(false);
    expect(result.posts.length).toBe(sec1Ids.length);
    expect(
      result.posts.every((p) => !p.is_external && p.section_id === 'sec-1')
    ).toBe(true);
  });

  it('avoids placing 3+ consecutive posts from the same section when multiple sections exist (Review Focus #5)', () => {
    const result = buildTimelineBatch(studyPosts, [], personas, {
      seed: 2026,
      section_filter: 'all',
      seen_ids: [],
      bookmarked_ids: [],
      limit: 8,
    });

    let consecutiveSameSection = 1;
    let maxStreak = 1;
    for (let i = 1; i < result.posts.length; i++) {
      const prev = result.posts[i - 1];
      const curr = result.posts[i];
      if (!prev.is_external && !curr.is_external && prev.section_id === curr.section_id) {
        consecutiveSameSection++;
        maxStreak = Math.max(maxStreak, consecutiveSameSection);
      } else {
        consecutiveSameSection = 1;
      }
    }
    expect(maxStreak).toBeLessThan(3);
  });
});
```

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/src/hooks/__tests__/useStudyMemory.test.ts`:
```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStudyMemory, STORAGE_KEY } from '../useStudyMemory';

describe('useStudyMemory — localStorage persistence & resilience', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('recovers gracefully when localStorage contains corrupted JSON (Review Focus #3)', () => {
    window.localStorage.setItem(STORAGE_KEY, '{broken-json');
    const { result } = renderHook(() => useStudyMemory());
    expect(result.current.seenIds).toEqual([]);
    expect(result.current.bookmarkedIds).toEqual([]);
    expect(result.current.cycleCount).toBe(1);
  });

  it('tracks seen, liked, bookmarked posts and increments cycle on resetCycleSeen', () => {
    const { result } = renderHook(() => useStudyMemory());

    act(() => {
      result.current.markSeen('post-1');
      result.current.toggleBookmark('post-1');
      result.current.toggleLike('post-2');
    });

    expect(result.current.seenIds).toContain('post-1');
    expect(result.current.bookmarkedIds).toContain('post-1');
    expect(result.current.likedIds).toContain('post-2');

    act(() => {
      result.current.resetCycleSeen();
    });

    expect(result.current.seenIds).toEqual([]);
    expect(result.current.bookmarkedIds).toContain('post-1');
    expect(result.current.cycleCount).toBe(2);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd /Users/ttamer/Documents/PSCPP/pscpp-gram && npx vitest run src/lib/__tests__/timelineEngine.test.ts src/hooks/__tests__/useStudyMemory.test.ts`
Expected: FAIL because `timelineEngine.ts` and `useStudyMemory.ts` do not exist yet.

- [ ] **Step 3: Implement `src/lib/timelineEngine.ts`, `src/hooks/useStudyMemory.ts`, and `src/hooks/useTimeline.ts`**

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/src/lib/timelineEngine.ts`:
```ts
import type {
  ExternalPost,
  FeedRequest,
  FeedResponse,
  Persona,
  ServerLoopState,
  StudyPost,
  TimelinePost,
} from '../types/post';

export function createSeededRng(seed: number): () => number {
  let state = (seed >>> 0) || 1;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle<T>(items: T[], rng: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function smoothSectionStreaks(posts: StudyPost[]): StudyPost[] {
  const result = [...posts];
  for (let i = 2; i < result.length; i++) {
    if (
      result[i].section_id === result[i - 1].section_id &&
      result[i].section_id === result[i - 2].section_id
    ) {
      const swapIdx = result.findIndex(
        (candidate, idx) =>
          idx > i && candidate.section_id !== result[i].section_id
      );
      if (swapIdx !== -1) {
        [result[i], result[swapIdx]] = [result[swapIdx], result[i]];
      }
    }
  }
  return result;
}

export function buildTimelineBatch(
  studyPosts: StudyPost[],
  externalPosts: ExternalPost[],
  personas: Persona[],
  request: FeedRequest,
  serverState?: ServerLoopState
): FeedResponse {
  const rng = createSeededRng(request.seed);
  const limit = request.limit ?? 10;
  const personaMap: Record<string, Persona> = {};
  for (const p of personas) {
    personaMap[p.id] = p;
  }

  const seenSet = new Set(request.seen_ids);
  const bookmarkSet = new Set(request.bookmarked_ids);

  const defaultState: ServerLoopState = serverState ?? {
    needs_generation: false,
    completed_cycles: 0,
    last_exhausted_at: null,
    last_generated_at: new Date().toISOString(),
    total_study_posts: studyPosts.length,
  };

  if (request.section_filter === 'external') {
    return {
      posts: seededShuffle(externalPosts, rng).slice(0, limit),
      personas: personaMap,
      unseen_remaining: studyPosts.filter((p) => !seenSet.has(p.id)).length,
      total_study_posts: studyPosts.length,
      cycle_reset_triggered: false,
      server_state: defaultState,
    };
  }

  if (request.section_filter === 'bookmarks') {
    const bookmarked = studyPosts.filter((p) => bookmarkSet.has(p.id));
    return {
      posts: smoothSectionStreaks(seededShuffle(bookmarked, rng)).slice(0, limit),
      personas: personaMap,
      unseen_remaining: studyPosts.filter((p) => !seenSet.has(p.id)).length,
      total_study_posts: studyPosts.length,
      cycle_reset_triggered: false,
      server_state: defaultState,
    };
  }

  if (request.section_filter !== 'all') {
    const sectionPool = studyPosts.filter(
      (p) => p.section_id === request.section_filter
    );
    const unseenInSection = sectionPool.filter((p) => !seenSet.has(p.id));
    const chosen =
      unseenInSection.length > 0
        ? seededShuffle(unseenInSection, rng)
        : seededShuffle(sectionPool, rng);

    return {
      posts: chosen.slice(0, limit),
      personas: personaMap,
      unseen_remaining: studyPosts.filter((p) => !seenSet.has(p.id)).length,
      total_study_posts: studyPosts.length,
      cycle_reset_triggered: false,
      server_state: defaultState,
    };
  }

  let unseenStudy = studyPosts.filter((p) => !seenSet.has(p.id));
  let cycleResetTriggered = false;

  if (studyPosts.length > 0 && unseenStudy.length === 0) {
    cycleResetTriggered = true;
    unseenStudy = [...studyPosts];
  }

  const prioritizedUnseen = [
    ...seededShuffle(
      unseenStudy.filter((p) => bookmarkSet.has(p.id)),
      rng
    ),
    ...seededShuffle(
      unseenStudy.filter((p) => !bookmarkSet.has(p.id)),
      rng
    ),
  ];

  const seenReviewPool = seededShuffle(
    studyPosts.filter(
      (p) => seenSet.has(p.id) && !prioritizedUnseen.some((u) => u.id === p.id)
    ),
    rng
  );

  const studyCount = externalPosts.length > 0 ? Math.max(1, limit - 2) : limit;
  const selectedStudy = smoothSectionStreaks(
    [...prioritizedUnseen, ...seenReviewPool].slice(0, studyCount)
  );

  const shuffledExternal = seededShuffle(externalPosts, rng);
  const combined: TimelinePost[] = [];
  let extIdx = 0;

  for (let i = 0; i < selectedStudy.length; i++) {
    combined.push(selectedStudy[i]);
    if ((i + 1) % 4 === 0 && extIdx < shuffledExternal.length) {
      combined.push(shuffledExternal[extIdx++]);
    }
  }

  return {
    posts: combined.slice(0, limit),
    personas: personaMap,
    unseen_remaining: cycleResetTriggered
      ? studyPosts.length
      : unseenStudy.length,
    total_study_posts: studyPosts.length,
    cycle_reset_triggered: cycleResetTriggered,
    server_state: cycleResetTriggered
      ? {
          ...defaultState,
          needs_generation: true,
          completed_cycles: defaultState.completed_cycles + 1,
          last_exhausted_at: new Date().toISOString(),
        }
      : defaultState,
  };
}
```

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/src/hooks/useStudyMemory.ts`:
```ts
import { useState, useCallback } from 'react';

export const STORAGE_KEY = 'pscpp_gram_memory_v1';

interface StoredMemory {
  seenIds: string[];
  bookmarkedIds: string[];
  likedIds: string[];
  cycleCount: number;
  seed: number;
}

const DEFAULT_MEMORY: StoredMemory = {
  seenIds: [],
  bookmarkedIds: [],
  likedIds: [],
  cycleCount: 1,
  seed: 20261111,
};

function readStorage(): StoredMemory {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_MEMORY;
    const parsed = JSON.parse(raw) as Partial<StoredMemory>;
    return {
      seenIds: Array.isArray(parsed.seenIds) ? parsed.seenIds : [],
      bookmarkedIds: Array.isArray(parsed.bookmarkedIds)
        ? parsed.bookmarkedIds
        : [],
      likedIds: Array.isArray(parsed.likedIds) ? parsed.likedIds : [],
      cycleCount:
        typeof parsed.cycleCount === 'number' && parsed.cycleCount >= 1
          ? parsed.cycleCount
          : 1,
      seed: typeof parsed.seed === 'number' ? parsed.seed : 20261111,
    };
  } catch {
    return DEFAULT_MEMORY;
  }
}

function writeStorage(next: StoredMemory): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage quota or Safari Private Browsing write errors
  }
}

export function useStudyMemory() {
  const [memory, setMemory] = useState<StoredMemory>(() => readStorage());

  const update = useCallback((updater: (prev: StoredMemory) => StoredMemory) => {
    setMemory((prev) => {
      const next = updater(prev);
      writeStorage(next);
      return next;
    });
  }, []);

  const markSeen = useCallback(
    (postId: string) => {
      update((prev) =>
        prev.seenIds.includes(postId)
          ? prev
          : { ...prev, seenIds: [...prev.seenIds, postId] }
      );
    },
    [update]
  );

  const toggleBookmark = useCallback(
    (postId: string) => {
      update((prev) => ({
        ...prev,
        bookmarkedIds: prev.bookmarkedIds.includes(postId)
          ? prev.bookmarkedIds.filter((id) => id !== postId)
          : [...prev.bookmarkedIds, postId],
      }));
    },
    [update]
  );

  const toggleLike = useCallback(
    (postId: string) => {
      update((prev) => ({
        ...prev,
        likedIds: prev.likedIds.includes(postId)
          ? prev.likedIds.filter((id) => id !== postId)
          : [...prev.likedIds, postId],
      }));
    },
    [update]
  );

  const randomizeSeed = useCallback(() => {
    update((prev) => ({
      ...prev,
      seed: Math.floor(Math.random() * 900000) + 100000,
    }));
  }, [update]);

  const resetCycleSeen = useCallback(() => {
    update((prev) => ({
      ...prev,
      seenIds: [],
      cycleCount: prev.cycleCount + 1,
      seed: Math.floor(Math.random() * 900000) + 100000,
    }));
  }, [update]);

  return {
    seenIds: memory.seenIds,
    bookmarkedIds: memory.bookmarkedIds,
    likedIds: memory.likedIds,
    cycleCount: memory.cycleCount,
    seed: memory.seed,
    markSeen,
    toggleBookmark,
    toggleLike,
    randomizeSeed,
    resetCycleSeen,
  };
}
```

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/src/hooks/useTimeline.ts`:
```ts
import { useState, useEffect, useCallback } from 'react';
import { buildTimelineBatch } from '../lib/timelineEngine';
import { useStudyMemory } from './useStudyMemory';
import type {
  ExternalPost,
  FeedResponse,
  Persona,
  SectionFilter,
  ServerLoopState,
  StudyPost,
  TimelinePost,
} from '../types/post';

import personasData from '../../public/content/personas.json';
import stateData from '../../public/content/state.json';
import post1 from '../../public/content/posts/2026-11-11-sec1-crenshaw-001.json';
import post2 from '../../public/content/posts/2026-11-11-sec1-pna-002.json';
import post3 from '../../public/content/posts/2026-11-11-sec2-artenaval-003.json';
import post4 from '../../public/content/posts/2026-11-11-sec3-squat-004.json';
import post5 from '../../public/content/posts/2026-11-11-sec4-normam-005.json';
import post6 from '../../public/content/posts/2026-11-11-sec5-bowditch-006.json';
import post7 from '../../public/content/posts/2026-11-11-sec6-cis-007.json';
import post8 from '../../public/content/posts/2026-11-11-sec7-colregs-008.json';
import ext1 from '../../public/content/external/ext-linkedin-pilot-001.json';
import ext2 from '../../public/content/external/ext-ig-shiphandling-002.json';

const BUNDLED_PERSONAS = personasData as Persona[];
const BUNDLED_STUDY_POSTS = [
  post1,
  post2,
  post3,
  post4,
  post5,
  post6,
  post7,
  post8,
] as StudyPost[];
const BUNDLED_EXTERNAL_POSTS = [ext1, ext2] as ExternalPost[];
const BUNDLED_STATE = stateData as ServerLoopState;

export function useTimeline() {
  const memory = useStudyMemory();
  const [sectionFilter, setSectionFilter] = useState<SectionFilter>('all');
  const [posts, setPosts] = useState<TimelinePost[]>([]);
  const [personas, setPersonas] = useState<Record<string, Persona>>({});
  const [serverState, setServerState] = useState<ServerLoopState>(BUNDLED_STATE);
  const [loopBanner, setLoopBanner] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const notifyServerExhausted = useCallback(async () => {
    try {
      const res = await fetch('./api/exhausted.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed_client_cycle: memory.cycleCount }),
      });
      if (res.ok) {
        const updated = (await res.json()) as ServerLoopState;
        setServerState(updated);
      }
    } catch {
      // Static/offline mode fallback
      setServerState((prev) => ({
        ...prev,
        needs_generation: true,
        completed_cycles: prev.completed_cycles + 1,
        last_exhausted_at: new Date().toISOString(),
      }));
    }
  }, [memory.cycleCount]);

  const loadFeed = useCallback(
    async (customSeed?: number) => {
      setLoading(true);
      const activeSeed = customSeed ?? memory.seed;
      const payload = {
        seed: activeSeed,
        section_filter: sectionFilter,
        seen_ids: memory.seenIds,
        bookmarked_ids: memory.bookmarkedIds,
        limit: 12,
      };

      let feed: FeedResponse | null = null;
      try {
        const res = await fetch('./api/feed.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const contentType = res.headers.get('content-type') ?? '';
          if (contentType.includes('application/json')) {
            feed = (await res.json()) as FeedResponse;
          }
        }
      } catch {
        // Fallback to local engine
      }

      if (!feed) {
        feed = buildTimelineBatch(
          BUNDLED_STUDY_POSTS,
          BUNDLED_EXTERNAL_POSTS,
          BUNDLED_PERSONAS,
          payload,
          serverState
        );
      }

      setPosts(feed.posts);
      setPersonas(feed.personas);
      setServerState(feed.server_state);

      if (feed.cycle_reset_triggered) {
        memory.resetCycleSeen();
        void notifyServerExhausted();
        setLoopBanner(
          `Ciclo #${memory.cycleCount} concluído! Timeline reembaralhada e geração de novos posts sinalizada.`
        );
      }
      setLoading(false);
    },
    [
      memory.seed,
      memory.seenIds,
      memory.bookmarkedIds,
      memory.cycleCount,
      memory.resetCycleSeen,
      sectionFilter,
      serverState,
      notifyServerExhausted,
    ]
  );

  useEffect(() => {
    void loadFeed();
  }, [sectionFilter, memory.seed]);

  const shuffleTimeline = useCallback(() => {
    const nextSeed = Math.floor(Math.random() * 900000) + 100000;
    memory.randomizeSeed();
    setLoopBanner('Timeline reembaralhada com prioridade para revisão espaçada.');
    void loadFeed(nextSeed);
  }, [memory, loadFeed]);

  const completeAndLoopTimeline = useCallback(() => {
    memory.resetCycleSeen();
    void notifyServerExhausted();
    const nextSeed = Math.floor(Math.random() * 900000) + 100000;
    setLoopBanner(
      `Ciclo #${memory.cycleCount} finalizado! Novos posts solicitados ao loop local e timeline renovada.`
    );
    void loadFeed(nextSeed);
  }, [memory, notifyServerExhausted, loadFeed]);

  return {
    posts,
    personas,
    sectionFilter,
    setSectionFilter,
    serverState,
    loopBanner,
    dismissBanner: () => setLoopBanner(null),
    loading,
    seenIds: memory.seenIds,
    bookmarkedIds: memory.bookmarkedIds,
    likedIds: memory.likedIds,
    cycleCount: memory.cycleCount,
    totalStudyPosts: BUNDLED_STUDY_POSTS.length,
    markSeen: memory.markSeen,
    toggleBookmark: memory.toggleBookmark,
    toggleLike: memory.toggleLike,
    shuffleTimeline,
    completeAndLoopTimeline,
  };
}
```

- [ ] **Step 4: Run the unit tests to verify they pass and commit**

Run: `cd /Users/ttamer/Documents/PSCPP/pscpp-gram && npx vitest run src/lib/__tests__/timelineEngine.test.ts src/hooks/__tests__/useStudyMemory.test.ts`
Expected: PASS (6 passed)

Commit:
```bash
cd /Users/ttamer/Documents/PSCPP/pscpp-gram
git add src/lib/ src/hooks/
git commit -m "feat: add weighted timeline randomization engine and localStorage study memory"
```

---

### Task 3: PHP 8 Backend API (`config.php`, `feed.php`, `exhausted.php`, `status.php`, `cron_external.php`)

**Files:**
- Create: `/Users/ttamer/Documents/PSCPP/pscpp-gram/public/api/config.php`
- Create: `/Users/ttamer/Documents/PSCPP/pscpp-gram/public/api/feed.php`
- Create: `/Users/ttamer/Documents/PSCPP/pscpp-gram/public/api/exhausted.php`
- Create: `/Users/ttamer/Documents/PSCPP/pscpp-gram/public/api/status.php`
- Create: `/Users/ttamer/Documents/PSCPP/pscpp-gram/public/api/cron_external.php`
- Test: `/Users/ttamer/Documents/PSCPP/pscpp-gram/src/api/__tests__/phpApi.test.ts`

**Interfaces:**
- Consumes: `public/content/personas.json`, `public/content/state.json`, `public/content/posts/*.json`, `public/content/external/*.json`
- Produces:
  - `POST /api/feed.php` returning `FeedResponse` JSON
  - `POST /api/exhausted.php` incrementing `completed_cycles` and setting `needs_generation = true` in `public/content/state.json`
  - `GET|POST /api/status.php` returning `ServerLoopState` and resetting `needs_generation = false` when `{"action": "ack_generated"}` is posted

- [ ] **Step 1: Write the failing PHP API integration test `src/api/__tests__/phpApi.test.ts`**

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/src/api/__tests__/phpApi.test.ts`:
```ts
import { describe, it, expect, afterEach } from 'vitest';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const apiDir = path.resolve(__dirname, '../../../public/api');
const contentDir = path.resolve(__dirname, '../../../public/content');
const corruptFile = path.join(contentDir, 'posts', 'corrupt_temp.json');
const originalState = fs.readFileSync(path.join(contentDir, 'state.json'), 'utf-8');

afterEach(() => {
  if (fs.existsSync(corruptFile)) {
    fs.unlinkSync(corruptFile);
  }
  fs.writeFileSync(path.join(contentDir, 'state.json'), originalState, 'utf-8');
});

describe('PHP 8 cPanel Backend Endpoints', () => {
  it('feed.php skips corrupt JSON files in content/posts/ and returns valid FeedResponse (Review Focus #1)', () => {
    fs.writeFileSync(corruptFile, '{not-valid-json', 'utf-8');

    const stdout = execFileSync(
      'php',
      [
        path.join(apiDir, 'feed.php'),
        JSON.stringify({
          seed: 1234,
          section_filter: 'all',
          seen_ids: [],
          bookmarked_ids: [],
          limit: 10,
        }),
      ],
      { encoding: 'utf-8' }
    );

    const parsed = JSON.parse(stdout);
    expect(Array.isArray(parsed.posts)).toBe(true);
    expect(parsed.posts.length).toBeGreaterThanOrEqual(8);
    expect(parsed.total_study_posts).toBe(8);
  });

  it('exhausted.php sets needs_generation=true and increments completed_cycles, and status.php resets it', () => {
    const exhaustedOut = execFileSync(
      'php',
      [path.join(apiDir, 'exhausted.php')],
      { encoding: 'utf-8' }
    );
    const stateAfterExhaust = JSON.parse(exhaustedOut);
    expect(stateAfterExhaust.needs_generation).toBe(true);
    expect(stateAfterExhaust.completed_cycles).toBeGreaterThanOrEqual(1);

    const resetOut = execFileSync(
      'php',
      [
        path.join(apiDir, 'status.php'),
        JSON.stringify({ action: 'ack_generated' }),
      ],
      { encoding: 'utf-8' }
    );
    const stateAfterReset = JSON.parse(resetOut);
    expect(stateAfterReset.needs_generation).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd /Users/ttamer/Documents/PSCPP/pscpp-gram && npx vitest run src/api/__tests__/phpApi.test.ts`
Expected: FAIL because `public/api/feed.php`, `exhausted.php`, and `status.php` do not exist yet.

- [ ] **Step 3: Implement `config.php`, `feed.php`, `exhausted.php`, `status.php`, and `cron_external.php`**

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/public/api/config.php`:
```php
<?php
declare(strict_types=1);

if (php_sapi_name() !== 'cli') {
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

define('CONTENT_DIR', realpath(__DIR__ . '/../content') ?: (__DIR__ . '/../content'));
define('POSTS_DIR', CONTENT_DIR . '/posts');
define('EXTERNAL_DIR', CONTENT_DIR . '/external');
define('PERSONAS_FILE', CONTENT_DIR . '/personas.json');
define('STATE_FILE', CONTENT_DIR . '/state.json');
define('EXTERNAL_ACCOUNTS_FILE', CONTENT_DIR . '/external_accounts.json');

function read_json_input(): array {
    global $argv;
    if (php_sapi_name() === 'cli' && isset($argv[1])) {
        $decoded = json_decode((string)$argv[1], true);
        return is_array($decoded) ? $decoded : [];
    }
    $raw = file_get_contents('php://input');
    if (!$raw) {
        return [];
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function load_json_directory(string $dir, callable $validator): array {
    if (!is_dir($dir)) {
        return [];
    }
    $items = [];
    $files = glob($dir . '/*.json') ?: [];
    foreach ($files as $file) {
        $raw = @file_get_contents($file);
        if ($raw === false) {
            continue;
        }
        $data = json_decode($raw, true);
        if (!is_array($data)) {
            continue;
        }
        if ($validator($data)) {
            $items[] = $data;
        }
    }
    return $items;
}

function load_server_state(int $totalStudyPosts = 0): array {
    $default = [
        'needs_generation' => false,
        'completed_cycles' => 0,
        'last_exhausted_at' => null,
        'last_generated_at' => gmdate('Y-m-d\TH:i:s\Z'),
        'total_study_posts' => $totalStudyPosts,
    ];
    if (!file_exists(STATE_FILE)) {
        return $default;
    }
    $raw = @file_get_contents(STATE_FILE);
    $decoded = $raw ? json_decode($raw, true) : null;
    if (!is_array($decoded)) {
        return $default;
    }
    $merged = array_merge($default, $decoded);
    if ($totalStudyPosts > 0) {
        $merged['total_study_posts'] = $totalStudyPosts;
    }
    return $merged;
}

function save_server_state(array $state): void {
    @file_put_contents(
        STATE_FILE,
        json_encode($state, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n"
    );
}
```

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/public/api/feed.php`:
```php
<?php
declare(strict_types=1);
require_once __DIR__ . '/config.php';

$input = read_json_input();
$seed = isset($input['seed']) ? (int)$input['seed'] : 20261111;
$sectionFilter = isset($input['section_filter']) ? (string)$input['section_filter'] : 'all';
$seenIds = isset($input['seen_ids']) && is_array($input['seen_ids']) ? array_map('strval', $input['seen_ids']) : [];
$bookmarkedIds = isset($input['bookmarked_ids']) && is_array($input['bookmarked_ids']) ? array_map('strval', $input['bookmarked_ids']) : [];
$limit = isset($input['limit']) ? max(1, (int)$input['limit']) : 10;

$studyPosts = load_json_directory(POSTS_DIR, function (array $item): bool {
    return isset($item['id'], $item['persona_id'], $item['section_id'], $item['format'], $item['caption']);
});

$externalPosts = load_json_directory(EXTERNAL_DIR, function (array $item): bool {
    return isset($item['id'], $item['platform'], $item['author'], $item['caption']) && !empty($item['is_external']);
});

$personasRaw = file_exists(PERSONAS_FILE) ? json_decode((string)file_get_contents(PERSONAS_FILE), true) : [];
$personaMap = [];
if (is_array($personasRaw)) {
    foreach ($personasRaw as $p) {
        if (is_array($p) && isset($p['id'])) {
            $personaMap[$p['id']] = $p;
        }
    }
}

mt_srand($seed);
$seenLookup = array_flip($seenIds);
$bookmarkLookup = array_flip($bookmarkedIds);

$unseenStudy = array_values(array_filter($studyPosts, fn($p) => !isset($seenLookup[$p['id']])));
$cycleResetTriggered = false;

if ($sectionFilter === 'all' && count($studyPosts) > 0 && count($unseenStudy) === 0) {
    $cycleResetTriggered = true;
    $unseenStudy = $studyPosts;
}

if ($sectionFilter === 'external') {
    $shuffledExt = $externalPosts;
    shuffle($shuffledExt);
    $posts = array_slice($shuffledExt, 0, $limit);
} elseif ($sectionFilter === 'bookmarks') {
    $bookmarked = array_values(array_filter($studyPosts, fn($p) => isset($bookmarkLookup[$p['id']])));
    shuffle($bookmarked);
    $posts = array_slice($bookmarked, 0, $limit);
} elseif ($sectionFilter !== 'all') {
    $secPool = array_values(array_filter($studyPosts, fn($p) => $p['section_id'] === $sectionFilter));
    $secUnseen = array_values(array_filter($secPool, fn($p) => !isset($seenLookup[$p['id']])));
    $chosen = count($secUnseen) > 0 ? $secUnseen : $secPool;
    shuffle($chosen);
    $posts = array_slice($chosen, 0, $limit);
} else {
    $pool = $unseenStudy;
    shuffle($pool);
    $extShuffled = $externalPosts;
    shuffle($extShuffled);

    $posts = [];
    $extIdx = 0;
    foreach ($pool as $idx => $post) {
        $posts[] = $post;
        if (($idx + 1) % 4 === 0 && isset($extShuffled[$extIdx])) {
            $posts[] = $extShuffled[$extIdx++];
        }
        if (count($posts) >= $limit) {
            break;
        }
    }
}

$serverState = load_server_state(count($studyPosts));
if ($cycleResetTriggered) {
    $serverState['needs_generation'] = true;
    $serverState['completed_cycles'] = (int)$serverState['completed_cycles'] + 1;
    $serverState['last_exhausted_at'] = gmdate('Y-m-d\TH:i:s\Z');
    save_server_state($serverState);
}

echo json_encode([
    'posts' => $posts,
    'personas' => $personaMap,
    'unseen_remaining' => $cycleResetTriggered ? count($studyPosts) : count($unseenStudy),
    'total_study_posts' => count($studyPosts),
    'cycle_reset_triggered' => $cycleResetTriggered,
    'server_state' => $serverState,
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
```

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/public/api/exhausted.php`:
```php
<?php
declare(strict_types=1);
require_once __DIR__ . '/config.php';

$studyPosts = load_json_directory(POSTS_DIR, fn(array $item): bool => isset($item['id']));
$state = load_server_state(count($studyPosts));
$state['needs_generation'] = true;
$state['completed_cycles'] = (int)$state['completed_cycles'] + 1;
$state['last_exhausted_at'] = gmdate('Y-m-d\TH:i:s\Z');
save_server_state($state);

echo json_encode($state, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
```

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/public/api/status.php`:
```php
<?php
declare(strict_types=1);
require_once __DIR__ . '/config.php';

$input = read_json_input();
$studyPosts = load_json_directory(POSTS_DIR, fn(array $item): bool => isset($item['id']));
$state = load_server_state(count($studyPosts));

if (($input['action'] ?? '') === 'ack_generated') {
    $state['needs_generation'] = false;
    $state['last_generated_at'] = gmdate('Y-m-d\TH:i:s\Z');
    $state['total_study_posts'] = count($studyPosts);
    save_server_state($state);
}

echo json_encode($state, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
```

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/public/api/cron_external.php`:
```php
<?php
declare(strict_types=1);
require_once __DIR__ . '/config.php';

/**
 * cPanel Cron Job entrypoint for refreshing real external Instagram / LinkedIn accounts.
 * Configure in cPanel Cron Jobs:
 * 0 */6 * * * php /home/USER/public_html/pscpp-gram/api/cron_external.php
 */
$accountsData = file_exists(EXTERNAL_ACCOUNTS_FILE)
    ? json_decode((string)file_get_contents(EXTERNAL_ACCOUNTS_FILE), true)
    : ['accounts' => []];

$accounts = $accountsData['accounts'] ?? [];
$synced = 0;

foreach ($accounts as $account) {
    if (empty($account['enabled']) || empty($account['feed_url'])) {
        continue;
    }
    $rawFeed = @file_get_contents((string)$account['feed_url']);
    if ($rawFeed === false) {
        continue;
    }
    $decoded = json_decode($rawFeed, true);
    if (!is_array($decoded)) {
        continue;
    }
    foreach ($decoded as $item) {
        if (is_array($item) && isset($item['id'], $item['caption'])) {
            $item['is_external'] = true;
            $target = EXTERNAL_DIR . '/' . preg_replace('/[^a-zA-Z0-9_-]/', '_', (string)$item['id']) . '.json';
            file_put_contents($target, json_encode($item, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            $synced++;
        }
    }
}

echo json_encode([
    'status' => 'ok',
    'accounts_checked' => count($accounts),
    'posts_synced' => $synced,
    'checked_at' => gmdate('Y-m-d\TH:i:s\Z'),
]);
```

- [ ] **Step 4: Run the PHP API integration tests to verify they pass and commit**

Run: `cd /Users/ttamer/Documents/PSCPP/pscpp-gram && npx vitest run src/api/__tests__/phpApi.test.ts`
Expected: PASS (2 passed)

Commit:
```bash
cd /Users/ttamer/Documents/PSCPP/pscpp-gram
git add public/api/ src/api/
git commit -m "feat: add PHP 8 cPanel endpoints for feed randomization, cycle loop, and external cron"
```

---

### Task 4: Mobile-First iPhone Instagram UI & Interactive Post Renderers

**Files:**
- Create: `/Users/ttamer/Documents/PSCPP/pscpp-gram/src/index.css`
- Create: `/Users/ttamer/Documents/PSCPP/pscpp-gram/src/components/Header.tsx`
- Create: `/Users/ttamer/Documents/PSCPP/pscpp-gram/src/components/StoriesBar.tsx`
- Create: `/Users/ttamer/Documents/PSCPP/pscpp-gram/src/components/BottomNav.tsx`
- Create: `/Users/ttamer/Documents/PSCPP/pscpp-gram/src/components/PostCard/PostContainer.tsx`
- Create: `/Users/ttamer/Documents/PSCPP/pscpp-gram/src/components/PostCard/FlashcardPost.tsx`
- Create: `/Users/ttamer/Documents/PSCPP/pscpp-gram/src/components/PostCard/InfographicPost.tsx`
- Create: `/Users/ttamer/Documents/PSCPP/pscpp-gram/src/components/PostCard/VideoReelPost.tsx`
- Create: `/Users/ttamer/Documents/PSCPP/pscpp-gram/src/components/PostCard/ExternalSocialPost.tsx`
- Create: `/Users/ttamer/Documents/PSCPP/pscpp-gram/src/App.tsx`
- Create: `/Users/ttamer/Documents/PSCPP/pscpp-gram/src/main.tsx`
- Test: `/Users/ttamer/Documents/PSCPP/pscpp-gram/src/components/__tests__/App.test.tsx`

**Interfaces:**
- Consumes: `useTimeline()` from `src/hooks/useTimeline.ts`, types from `src/types/post.ts`
- Produces: Complete mobile-first iPhone Instagram UI (`App`)

- [ ] **Step 1: Write the failing UI component test `src/components/__tests__/App.test.tsx`**

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/src/components/__tests__/App.test.tsx`:
```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../../App';

describe('PSCPP-Gram iPhone UI', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders Instagram header, section stories bar, fake author personas, and study cards', async () => {
    render(<App />);

    expect(screen.getByText(/PSCPP•Gram/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reembaralhar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Seção I/i })).toBeInTheDocument();
    expect(screen.getByText(/crenshaw\.shiphandling/i)).toBeInTheDocument();
  });

  it('allows flipping flashcards, filtering by section, and triggering the end-of-timeline loop', async () => {
    render(<App />);

    const flipBtn = screen.getAllByRole('button', { name: /Virar Card/i })[0];
    fireEvent.click(flipBtn);
    expect(screen.getByText(/Popa para Boreste/i)).toBeInTheDocument();

    const loopBtn = screen.getByRole('button', {
      name: /Concluir Timeline & Gerar Novos Posts/i,
    });
    fireEvent.click(loopBtn);
    expect(screen.getByText(/Ciclo #1 finalizado/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd /Users/ttamer/Documents/PSCPP/pscpp-gram && npx vitest run src/components/__tests__/App.test.tsx`
Expected: FAIL because `src/App.tsx` and child components do not exist yet.

- [ ] **Step 3: Implement `index.css`, `Header.tsx`, `StoriesBar.tsx`, `BottomNav.tsx`, the 4 `PostCard` renderers, `App.tsx`, and `main.tsx`**

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer utilities {
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
}
```

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/src/components/Header.tsx`:
```tsx
import React from 'react';
import { Shuffle, RefreshCw, Sparkles } from 'lucide-react';

interface HeaderProps {
  cycleCount: number;
  seenCount: number;
  totalStudyPosts: number;
  needsGeneration: boolean;
  onShuffle: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cycleCount,
  seenCount,
  totalStudyPosts,
  needsGeneration,
  onShuffle,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-black/90 backdrop-blur-md border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-sky-400 via-indigo-400 to-amber-300 bg-clip-text text-transparent">
          PSCPP•Gram
        </span>
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300">
          Ciclo #{cycleCount} • {seenCount}/{totalStudyPosts}
        </span>
        {needsGeneration && (
          <span
            title="Loop local sinalizado para gerar novos posts"
            className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40"
          >
            <Sparkles className="w-3 h-3" /> Loop Ativo
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={onShuffle}
        aria-label="Reembaralhar timeline"
        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-sky-400 border border-zinc-700 transition"
      >
        <Shuffle className="w-3.5 h-3.5" />
        <span>Reembaralhar</span>
      </button>
    </header>
  );
};
```

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/src/components/StoriesBar.tsx`:
```tsx
import React from 'react';
import type { SectionFilter } from '../types/post';

interface StoriesBarProps {
  activeFilter: SectionFilter;
  onSelectFilter: (filter: SectionFilter) => void;
  bookmarkedCount: number;
}

const STORIES: Array<{
  id: SectionFilter;
  shortLabel: string;
  subLabel: string;
  gradient: string;
}> = [
  { id: 'all', shortLabel: 'Tudo', subLabel: 'Feed Mix', gradient: 'from-pink-500 via-red-500 to-yellow-500' },
  { id: 'sec-1', shortLabel: 'Seção I', subLabel: 'Manobra', gradient: 'from-sky-400 to-blue-600' },
  { id: 'sec-2', shortLabel: 'Seção II', subLabel: 'Arte Naval', gradient: 'from-amber-400 to-orange-600' },
  { id: 'sec-3', shortLabel: 'Seção III', subLabel: 'Restritas', gradient: 'from-emerald-400 to-teal-600' },
  { id: 'sec-4', shortLabel: 'Seção IV', subLabel: 'NORMAM', gradient: 'from-rose-400 to-red-600' },
  { id: 'sec-5', shortLabel: 'Seção V', subLabel: 'Nav/Meteo', gradient: 'from-cyan-400 to-sky-600' },
  { id: 'sec-6', shortLabel: 'Seção VI', subLabel: 'CIS/SMCP', gradient: 'from-yellow-400 to-amber-600' },
  { id: 'sec-7', shortLabel: 'Seção VII', subLabel: 'RIPEAM', gradient: 'from-fuchsia-400 to-pink-600' },
  { id: 'external', shortLabel: 'Social', subLabel: 'IG / In', gradient: 'from-violet-400 to-indigo-600' },
];

export const StoriesBar: React.FC<StoriesBarProps> = ({
  activeFilter,
  onSelectFilter,
}) => {
  return (
    <nav
      aria-label="Filtro por Seções do Edital"
      className="border-b border-zinc-900 bg-black py-3 px-3 overflow-x-auto no-scrollbar"
    >
      <div className="flex items-center gap-3">
        {STORIES.map((story) => {
          const isActive = activeFilter === story.id;
          return (
            <button
              key={story.id}
              type="button"
              onClick={() => onSelectFilter(story.id)}
              className="flex flex-col items-center shrink-0 group focus:outline-none"
            >
              <div
                className={`p-[2.5px] rounded-full bg-gradient-to-tr ${story.gradient} ${
                  isActive ? 'ring-2 ring-white scale-105' : 'opacity-80 group-hover:opacity-100'
                } transition`}
              >
                <div className="w-14 h-14 rounded-full bg-zinc-950 border-2 border-black flex flex-col items-center justify-center">
                  <span className="text-[11px] font-bold text-white leading-tight">
                    {story.shortLabel}
                  </span>
                </div>
              </div>
              <span
                className={`mt-1 text-[10px] ${
                  isActive ? 'text-white font-semibold' : 'text-zinc-400'
                }`}
              >
                {story.subLabel}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
```

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/src/components/PostCard/FlashcardPost.tsx`:
```tsx
import React, { useState } from 'react';
import { RotateCw, ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react';
import type { StudyPost } from '../../types/post';

interface FlashcardPostProps {
  post: StudyPost;
  onInteract: () => void;
}

export const FlashcardPost: React.FC<FlashcardPostProps> = ({
  post,
  onInteract,
}) => {
  const [slideIdx, setSlideIdx] = useState(0);
  const slides = post.slides;
  const current = slides[slideIdx] ?? slides[0];

  const handleFlipOrNext = () => {
    onInteract();
    setSlideIdx((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    onInteract();
    setSlideIdx((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative bg-gradient-to-b from-zinc-900 to-zinc-950 border-y border-zinc-800/80 p-5 min-h-[340px] flex flex-col justify-between">
      <div className="flex items-center justify-between text-xs text-zinc-400 mb-3">
        <span className="uppercase tracking-wider font-semibold text-sky-400">
          {post.format === 'flashcard_flip' ? 'Flashcard 3D' : 'Carrossel de Estudo'}
        </span>
        <span>
          {slideIdx + 1} / {slides.length}
        </span>
      </div>

      <div className="my-auto space-y-3">
        <h3 className="text-base font-bold text-white leading-snug">
          {current.title}
        </h3>

        {current.media_url && (
          <img
            src={current.media_url}
            alt={current.title}
            className="w-full h-44 object-contain rounded-xl bg-zinc-950 border border-zinc-800 p-2"
          />
        )}

        {current.prompt && (
          <p className="text-sm text-zinc-200 leading-relaxed bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800">
            {current.prompt}
          </p>
        )}

        {current.body && (
          <p className="text-sm text-emerald-100 leading-relaxed bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-800/50 whitespace-pre-line">
            {current.body}
          </p>
        )}

        {current.exam_tip && (
          <div className="flex items-start gap-2 text-xs text-amber-200 bg-amber-950/40 border border-amber-700/50 rounded-xl p-3">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Foco de Prova:</strong> {current.exam_tip}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
        {slides.length > 1 && post.format === 'flashcard_carousel' ? (
          <div className="flex items-center gap-2 w-full justify-between">
            <button
              type="button"
              onClick={handlePrev}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 text-xs font-medium text-zinc-200 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>
            <div className="flex gap-1.5">
              {slides.map((_, idx) => (
                <span
                  key={idx}
                  className={`w-2 h-2 rounded-full ${
                    idx === slideIdx ? 'bg-sky-400' : 'bg-zinc-700'
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={handleFlipOrNext}
              aria-label="Virar Card"
              className="px-3 py-1.5 rounded-lg bg-sky-500 text-xs font-bold text-black flex items-center gap-1"
            >
              Próximo <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleFlipOrNext}
            aria-label="Virar Card"
            className="w-full py-2.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 text-xs font-bold flex items-center justify-center gap-2 active:scale-[0.99] transition"
          >
            <RotateCw className="w-4 h-4" />
            <span>
              {slideIdx === 0 ? 'Virar Card (Ver Resposta)' : 'Voltar para Pergunta'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
```

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/src/components/PostCard/InfographicPost.tsx`:
```tsx
import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import type { StudyPost } from '../../types/post';

interface InfographicPostProps {
  post: StudyPost;
  onInteract: () => void;
}

export const InfographicPost: React.FC<InfographicPostProps> = ({
  post,
  onInteract,
}) => {
  const info = post.infographic;
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(
    info?.hotspots[0]?.id ?? null
  );

  if (!info) return null;
  const activeHotspot = info.hotspots.find((h) => h.id === activeHotspotId);

  return (
    <div className="bg-zinc-950 border-y border-zinc-800 p-4 space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-purple-400 uppercase tracking-wider">
          Infográfico Interativo
        </span>
        <span className="text-zinc-400">Toque nos pontos (1–{info.hotspots.length})</span>
      </div>

      <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900">
        <img
          src={info.image_url}
          alt={post.source.anchor_concept}
          className="w-full h-56 object-contain"
        />
        {info.hotspots.map((hs, index) => {
          const isSelected = hs.id === activeHotspotId;
          return (
            <button
              key={hs.id}
              type="button"
              onClick={() => {
                onInteract();
                setActiveHotspotId(hs.id);
              }}
              style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
              className={`-translate-x-1/2 -translate-y-1/2 absolute w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center shadow-lg transition ${
                isSelected
                  ? 'bg-amber-400 text-black ring-4 ring-amber-400/40 scale-110'
                  : 'bg-sky-500 text-white hover:scale-105'
              }`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      {activeHotspot && (
        <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-700 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
            <MapPin className="w-3.5 h-3.5" />
            <span>{activeHotspot.label}</span>
          </div>
          <p className="text-xs text-zinc-200 leading-relaxed">
            {activeHotspot.detail}
          </p>
        </div>
      )}
    </div>
  );
};
```

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/src/components/PostCard/VideoReelPost.tsx`:
```tsx
import React from 'react';
import { Play, CheckCircle2 } from 'lucide-react';
import type { StudyPost } from '../../types/post';

interface VideoReelPostProps {
  post: StudyPost;
  onInteract: () => void;
}

export const VideoReelPost: React.FC<VideoReelPostProps> = ({
  post,
  onInteract,
}) => {
  const video = post.video;
  if (!video) return null;

  return (
    <div
      onClick={onInteract}
      className="bg-gradient-to-b from-emerald-950/50 via-zinc-950 to-zinc-950 border-y border-zinc-800 p-5 space-y-4 cursor-pointer"
    >
      <div className="flex items-center justify-between text-xs">
        <span className="inline-flex items-center gap-1.5 font-bold text-emerald-400 uppercase tracking-wider">
          <Play className="w-3.5 h-3.5 fill-emerald-400" /> Short Reel ({video.duration_seconds}s)
        </span>
        <span className="text-zinc-400">{post.source.anchor_concept}</span>
      </div>

      {video.video_url ? (
        <video
          src={video.video_url}
          autoPlay
          loop
          muted
          playsInline
          className="w-full rounded-xl max-h-72 object-cover border border-zinc-800"
        />
      ) : (
        video.animated_svg_url && (
          <img
            src={video.animated_svg_url}
            alt={video.hook_overlay}
            className="w-full h-44 object-contain rounded-xl bg-zinc-950 border border-zinc-800 p-2 animate-pulse"
          />
        )
      )}

      <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-2.5">
        <h4 className="text-sm font-bold text-white">{video.hook_overlay}</h4>
        <ul className="space-y-1.5">
          {video.key_takeaways.map((point, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2 text-xs text-zinc-200 leading-relaxed"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
```

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/src/components/PostCard/ExternalSocialPost.tsx`:
```tsx
import React from 'react';
import { ExternalLink, Globe } from 'lucide-react';
import type { ExternalPost } from '../../types/post';

interface ExternalSocialPostProps {
  post: ExternalPost;
}

export const ExternalSocialPost: React.FC<ExternalSocialPostProps> = ({
  post,
}) => {
  return (
    <article className="border-b border-zinc-900 bg-zinc-950/60 pb-4">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-600 flex items-center justify-center font-bold text-xs text-white">
            {post.platform === 'linkedin' ? 'in' : 'IG'}
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>{post.author.display_name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                Feed Externo
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">@{post.author.handle}</p>
          </div>
        </div>
        <a
          href={post.external_url}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-sky-400 hover:underline inline-flex items-center gap-1"
        >
          <span>Abrir</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {post.media_url && (
        <img
          src={post.media_url}
          alt={post.headline}
          className="w-full h-48 object-contain bg-zinc-900 border-y border-zinc-800 p-2"
        />
      )}

      <div className="px-4 pt-3 space-y-1.5">
        <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-violet-400 shrink-0" />
          <span>{post.headline}</span>
        </h3>
        <p className="text-xs text-zinc-300 leading-relaxed">{post.caption}</p>
      </div>
    </article>
  );
};
```

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/src/components/PostCard/PostContainer.tsx`:
```tsx
import React from 'react';
import { Heart, Bookmark, CheckCircle, BookOpen } from 'lucide-react';
import type { Persona, StudyPost } from '../../types/post';
import { FlashcardPost } from './FlashcardPost';
import { InfographicPost } from './InfographicPost';
import { VideoReelPost } from './VideoReelPost';

interface PostContainerProps {
  post: StudyPost;
  persona?: Persona;
  isSeen: boolean;
  isLiked: boolean;
  isBookmarked: boolean;
  onMarkSeen: (id: string) => void;
  onToggleLike: (id: string) => void;
  onToggleBookmark: (id: string) => void;
}

export const PostContainer: React.FC<PostContainerProps> = ({
  post,
  persona,
  isSeen,
  isLiked,
  isBookmarked,
  onMarkSeen,
  onToggleLike,
  onToggleBookmark,
}) => {
  const handleInteract = () => {
    if (!isSeen) {
      onMarkSeen(post.id);
    }
  };

  return (
    <article
      onDoubleClick={() => {
        handleInteract();
        onToggleLike(post.id);
      }}
      className="border-b border-zinc-900 bg-black pb-4"
    >
      {/* Author Fake Account Header */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-full bg-gradient-to-tr ${
              persona?.avatar_color ?? 'from-sky-500 to-blue-700'
            } flex items-center justify-center font-bold text-xs text-white`}
          >
            {persona?.avatar_initials ?? 'PS'}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-white">
                {persona?.handle ?? post.persona_id}
              </span>
              <CheckCircle className="w-3.5 h-3.5 text-sky-400 fill-sky-400/20" />
            </div>
            <p className="text-[11px] text-zinc-400 flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-zinc-500" />
              <span>
                {post.source.book} • {post.source.pages}
              </span>
            </p>
          </div>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300">
          {persona?.section_name ?? post.section_id}
        </span>
      </div>

      {/* Media / Interactive Card Body */}
      {(post.format === 'flashcard_flip' ||
        post.format === 'flashcard_carousel') && (
        <FlashcardPost post={post} onInteract={handleInteract} />
      )}
      {post.format === 'infographic' && (
        <InfographicPost post={post} onInteract={handleInteract} />
      )}
      {post.format === 'short_video' && (
        <VideoReelPost post={post} onInteract={handleInteract} />
      )}

      {/* Instagram Action Bar */}
      <div className="px-4 pt-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              handleInteract();
              onToggleLike(post.id);
            }}
            aria-label="Dominado"
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-200"
          >
            <Heart
              className={`w-6 h-6 transition ${
                isLiked ? 'text-rose-500 fill-rose-500 scale-110' : 'text-zinc-200'
              }`}
            />
            <span>{isLiked ? 'Dominado' : 'Marcar Dominado'}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            handleInteract();
            onToggleBookmark(post.id);
          }}
          aria-label="Salvar para revisão"
          className="flex items-center gap-1.5 text-xs font-medium text-zinc-200"
        >
          <Bookmark
            className={`w-6 h-6 transition ${
              isBookmarked
                ? 'text-amber-400 fill-amber-400 scale-110'
                : 'text-zinc-200'
            }`}
          />
          <span>{isBookmarked ? 'Na Revisão' : 'Revisar +'}</span>
        </button>
      </div>

      {/* Caption & Source Metadata */}
      <div className="px-4 pt-2.5 space-y-1">
        <p className="text-xs text-zinc-200 leading-relaxed">
          <strong className="font-bold text-white mr-1.5">
            {persona?.handle ?? post.persona_id}
          </strong>
          {post.caption}
        </p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {post.tags.map((tag) => (
            <span key={tag} className="text-[11px] text-sky-400">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
};
```

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/src/components/BottomNav.tsx`:
```tsx
import React from 'react';
import { Home, Bookmark, Shuffle, Sparkles } from 'lucide-react';
import type { SectionFilter } from '../types/post';

interface BottomNavProps {
  activeFilter: SectionFilter;
  bookmarkedCount: number;
  onSelectFilter: (filter: SectionFilter) => void;
  onShuffle: () => void;
  onLoopNow: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeFilter,
  bookmarkedCount,
  onSelectFilter,
  onShuffle,
  onLoopNow,
}) => {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-30 bg-black/95 backdrop-blur-md border-t border-zinc-800 px-6 py-2.5 flex items-center justify-between">
      <button
        type="button"
        onClick={() => onSelectFilter('all')}
        className={`flex flex-col items-center gap-0.5 text-[10px] ${
          activeFilter === 'all' ? 'text-white font-bold' : 'text-zinc-400'
        }`}
      >
        <Home className="w-5 h-5" />
        <span>Timeline</span>
      </button>

      <button
        type="button"
        onClick={onShuffle}
        className="flex flex-col items-center gap-0.5 text-[10px] text-zinc-400 hover:text-white"
      >
        <Shuffle className="w-5 h-5" />
        <span>Sortear</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectFilter('bookmarks')}
        className={`relative flex flex-col items-center gap-0.5 text-[10px] ${
          activeFilter === 'bookmarks'
            ? 'text-amber-400 font-bold'
            : 'text-zinc-400'
        }`}
      >
        <Bookmark className="w-5 h-5" />
        <span>Revisão ({bookmarkedCount})</span>
      </button>

      <button
        type="button"
        onClick={onLoopNow}
        className="flex flex-col items-center gap-0.5 text-[10px] text-sky-400 font-semibold"
      >
        <Sparkles className="w-5 h-5" />
        <span>Novo Loop</span>
      </button>
    </nav>
  );
};
```

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/src/App.tsx`:
```tsx
import React from 'react';
import { RefreshCw, X } from 'lucide-react';
import { useTimeline } from './hooks/useTimeline';
import { Header } from './components/Header';
import { StoriesBar } from './components/StoriesBar';
import { PostContainer } from './components/PostCard/PostContainer';
import { ExternalSocialPost } from './components/PostCard/ExternalSocialPost';
import { BottomNav } from './components/BottomNav';

export const App: React.FC = () => {
  const {
    posts,
    personas,
    sectionFilter,
    setSectionFilter,
    serverState,
    loopBanner,
    dismissBanner,
    seenIds,
    bookmarkedIds,
    likedIds,
    cycleCount,
    totalStudyPosts,
    markSeen,
    toggleBookmark,
    toggleLike,
    shuffleTimeline,
    completeAndLoopTimeline,
  } = useTimeline();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex justify-center">
      <div className="w-full max-w-[430px] min-h-screen bg-black border-x border-zinc-900 pb-24">
        <Header
          cycleCount={cycleCount}
          seenCount={seenIds.length}
          totalStudyPosts={totalStudyPosts}
          needsGeneration={serverState.needs_generation}
          onShuffle={shuffleTimeline}
        />

        <StoriesBar
          activeFilter={sectionFilter}
          onSelectFilter={setSectionFilter}
          bookmarkedCount={bookmarkedIds.length}
        />

        {loopBanner && (
          <div className="mx-3 my-2.5 p-3 rounded-xl bg-sky-950/80 border border-sky-500/40 text-xs text-sky-200 flex items-center justify-between gap-2">
            <span>{loopBanner}</span>
            <button
              type="button"
              onClick={dismissBanner}
              aria-label="Fechar aviso"
              className="text-sky-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <main className="divide-y divide-zinc-900">
          {posts.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <p className="text-sm text-zinc-400">
                Nenhum post salvo nesta aba ainda.
              </p>
              <button
                type="button"
                onClick={() => setSectionFilter('all')}
                className="px-4 py-2 rounded-full bg-zinc-800 text-xs font-semibold text-white"
              >
                Voltar para o Feed Completo
              </button>
            </div>
          ) : (
            posts.map((post) =>
              post.is_external ? (
                <ExternalSocialPost key={post.id} post={post} />
              ) : (
                <PostContainer
                  key={post.id}
                  post={post}
                  persona={personas[post.persona_id]}
                  isSeen={seenIds.includes(post.id)}
                  isLiked={likedIds.includes(post.id)}
                  isBookmarked={bookmarkedIds.includes(post.id)}
                  onMarkSeen={markSeen}
                  onToggleLike={toggleLike}
                  onToggleBookmark={toggleBookmark}
                />
              )
            )
          )}
        </main>

        {/* End of Timeline Loop Trigger Footer */}
        <footer className="p-6 text-center space-y-3 border-t border-zinc-900">
          <p className="text-xs text-zinc-400">
            Você chegou ao fim deste bloco da timeline (Ciclo #{cycleCount}).
          </p>
          <button
            type="button"
            onClick={completeAndLoopTimeline}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Concluir Timeline & Gerar Novos Posts</span>
          </button>
        </footer>

        <BottomNav
          activeFilter={sectionFilter}
          bookmarkedCount={bookmarkedIds.length}
          onSelectFilter={setSectionFilter}
          onShuffle={shuffleTimeline}
          onLoopNow={completeAndLoopTimeline}
        />
      </div>
    </div>
  );
};

export default App;
```

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/src/main.tsx`:
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 4: Run the UI tests to verify they pass and commit**

Run: `cd /Users/ttamer/Documents/PSCPP/pscpp-gram && npx vitest run src/components/__tests__/App.test.tsx`
Expected: PASS (2 passed)

Commit:
```bash
cd /Users/ttamer/Documents/PSCPP/pscpp-gram
git add src/
git commit -m "feat: implement mobile-first iPhone Instagram UI and study card renderers"
```

---

### Task 5: Build `.zip` Package, FTP Deploy Script & Local Antigravity Loop Script

**Files:**
- Create: `/Users/ttamer/Documents/PSCPP/pscpp-gram/scripts/build-zip.sh`
- Create: `/Users/ttamer/Documents/PSCPP/pscpp-gram/scripts/deploy-ftp.sh`
- Create: `/Users/ttamer/Documents/PSCPP/pscpp-gram/scripts/check-and-loop.sh`
- Create: `/Users/ttamer/Documents/PSCPP/pscpp-gram/README.md`
- Test: `/Users/ttamer/Documents/PSCPP/pscpp-gram/scripts/__tests__/buildAndDeploy.test.ts`

**Interfaces:**
- Consumes: Vite production build (`dist/`) and `public/` assets
- Produces:
  - `/Users/ttamer/Documents/PSCPP/pscpp-gram/deploy-initial.zip` via `npm run build:zip`
  - Incremental FTP sync + Git commit via `npm run deploy:ftp`
  - Local Antigravity loop checker via `npm run loop:check`

- [ ] **Step 1: Write the failing build & packaging test `scripts/__tests__/buildAndDeploy.test.ts`**

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/scripts/__tests__/buildAndDeploy.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve(__dirname, '../..');
const zipPath = path.join(projectRoot, 'deploy-initial.zip');

describe('Build, Initial cPanel Zip & Loop Scripts', () => {
  it('builds production bundle and packages deploy-initial.zip with SPA, PHP API, and content/', () => {
    execFileSync('bash', [path.join(projectRoot, 'scripts/build-zip.sh')], {
      cwd: projectRoot,
      stdio: 'pipe',
    });

    expect(fs.existsSync(zipPath)).toBe(true);
    const listing = execFileSync('unzip', ['-l', zipPath], {
      encoding: 'utf-8',
    });

    expect(listing).toContain('index.html');
    expect(listing).toContain('.htaccess');
    expect(listing).toContain('api/feed.php');
    expect(listing).toContain('api/exhausted.php');
    expect(listing).toContain('api/status.php');
    expect(listing).toContain('content/personas.json');
    expect(listing).toContain('content/posts/2026-11-11-sec1-crenshaw-001.json');
  });

  it('runs check-and-loop.sh locally against state.json and reports loop status', () => {
    const out = execFileSync(
      'bash',
      [path.join(projectRoot, 'scripts/check-and-loop.sh')],
      {
        cwd: projectRoot,
        encoding: 'utf-8',
      }
    );
    expect(out).toContain('needs_generation');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd /Users/ttamer/Documents/PSCPP/pscpp-gram && npx vitest run scripts/__tests__/buildAndDeploy.test.ts`
Expected: FAIL because `scripts/build-zip.sh` and `scripts/check-and-loop.sh` do not exist yet.

- [ ] **Step 3: Implement `scripts/build-zip.sh`, `scripts/deploy-ftp.sh`, `scripts/check-and-loop.sh`, and `README.md`**

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/scripts/build-zip.sh`:
```bash
#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> [1/3] Building mobile-first SPA into dist/..."
npm run build

echo "==> [2/3] Ensuring .htaccess is copied to dist/..."
cp -f public/.htaccess dist/.htaccess

echo "==> [3/3] Creating deploy-initial.zip for cPanel File Manager..."
rm -f deploy-initial.zip
(cd dist && zip -rq ../deploy-initial.zip . .htaccess)

echo "==> Done! Upload deploy-initial.zip to your cPanel target folder and extract."
```

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/scripts/deploy-ftp.sh`:
```bash
#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ -f ".env.deploy" ]]; then
  set -a
  source .env.deploy
  set +a
else
  echo "Error: .env.deploy not found. Copy .env.example to .env.deploy and fill in FTP credentials."
  exit 1
fi

: "${FTP_HOST:?Missing FTP_HOST in .env.deploy}"
: "${FTP_USER:?Missing FTP_USER in .env.deploy}"
: "${FTP_PASS:?Missing FTP_PASS in .env.deploy}"
: "${FTP_REMOTE_DIR:?Missing FTP_REMOTE_DIR in .env.deploy}"

echo "==> [1/3] Committing new or updated posts to Git..."
git add public/content/ src/ || true
if ! git diff --cached --quiet; then
  git commit -m "content: add/update PSCPP-Gram study posts ($(date -u +%Y-%m-%dT%H:%M:%SZ))"
  if git remote get-url origin >/dev/null 2>&1; then
    git push origin main
  fi
fi

echo "==> [2/3] Building production bundle..."
npm run build
cp -f public/.htaccess dist/.htaccess

echo "==> [3/3] Uploading changed files to cPanel via FTP ($FTP_HOST:$FTP_REMOTE_DIR)..."
python3 - <<'PYEOF'
import os
import ftplib
from pathlib import Path

host = os.environ["FTP_HOST"]
user = os.environ["FTP_USER"]
passwd = os.environ["FTP_PASS"]
remote_root = os.environ["FTP_REMOTE_DIR"].rstrip("/")
dist_dir = Path("dist")

def ensure_remote_dir(ftp: ftplib.FTP, path: str):
    parts = [p for p in path.split("/") if p]
    curr = ""
    for part in parts:
        curr += "/" + part
        try:
            ftp.cwd(curr)
        except ftplib.error_perm:
            ftp.mkd(curr)

with ftplib.FTP(host, timeout=30) as ftp:
    ftp.login(user, passwd)
    for file_path in dist_dir.rglob("*"):
        if file_path.is_dir():
            continue
        rel = file_path.relative_to(dist_dir).as_posix()
        # Preserve server-side runtime state.json if it already exists
        if rel == "content/state.json":
            continue
        remote_file = f"{remote_root}/{rel}"
        remote_parent = os.path.dirname(remote_file)
        ensure_remote_dir(ftp, remote_parent)
        with open(file_path, "rb") as f:
            ftp.storbinary(f"STOR {remote_file}", f)
print("FTP sync completed successfully.")
PYEOF
```

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/scripts/check-and-loop.sh`:
```bash
#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ -f ".env.deploy" ]]; then
  set -a
  source .env.deploy
  set +a
fi

if [[ -n "${SITE_URL:-}" ]]; then
  STATUS_JSON="$(curl -fsSL "${SITE_URL%/}/api/status.php" || true)"
fi

if [[ -z "${STATUS_JSON:-}" ]]; then
  STATUS_JSON="$(php public/api/status.php)"
fi

echo "$STATUS_JSON"
```

Create `/Users/ttamer/Documents/PSCPP/pscpp-gram/README.md`:
```markdown
# PSCPP•Gram — Mobile-First Instagram Study App

Public, zero-authentication Instagram-like mobile web app for the PSCPP exam.

## Commands

- `npm run dev` — Start local mobile preview server
- `npm test` — Run all Vitest unit + PHP API + build packaging tests
- `npm run build:zip` — Build production bundle and create `deploy-initial.zip` for first cPanel File Manager upload
- `npm run deploy:ftp` — Commit new posts to GitHub and incrementally sync `dist/` and `content/posts/` to cPanel via FTP (configured in `.env.deploy`)
- `npm run loop:check` — Check `api/status.php` to see if the timeline was exhausted (`needs_generation: true`) so the local Antigravity loop can generate a new batch of study posts
```

Make the scripts executable:
```bash
chmod +x /Users/ttamer/Documents/PSCPP/pscpp-gram/scripts/*.sh
```

- [ ] **Step 4: Run the full test suite and commit**

Run: `cd /Users/ttamer/Documents/PSCPP/pscpp-gram && chmod +x scripts/*.sh && npx vitest run`
Expected: PASS (all 5 test suites passing)

Commit:
```bash
cd /Users/ttamer/Documents/PSCPP/pscpp-gram
git add scripts/ README.md
git commit -m "feat: add initial cPanel zip builder, incremental FTP deploy, and local loop scripts"
```
