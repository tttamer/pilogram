# PSCPP•Gram — Mobile-First Instagram Study App

Public, zero-authentication Instagram-like mobile web app for the PSCPP exam. Responsive layout formatted for mobile devices including iPhone 14 (`390px` viewport).

## Commands

- `npm run dev` — Start local mobile preview server
- `npm test` — Run all Vitest unit + PHP API + build packaging tests
- `npm run build:zip` — Build production bundle and create `deploy-initial.zip` for first cPanel File Manager upload
- `npm run deploy:ftp` — Commit new posts to GitHub and incrementally sync `dist/` and `content/posts/` to cPanel via FTP (configured in `.env.deploy`)
- `npm run loop:check` — Check `api/status.php` to see if the timeline was exhausted (`needs_generation: true`) so the local Antigravity loop can generate a new batch of study posts
