# Cadott Golf

Mobile-first web app for the Cadott High School golf team. Practice plan library, club distance tracking, skills challenges, and round logging in one PWA installable to phone home screens.

## Tech stack

- Next.js 16 (App Router) + TypeScript
- Neon Postgres + Drizzle ORM
- Auth.js v5 (Credentials provider, bcrypt-hashed passwords)
- Tailwind CSS + shadcn/ui
- PWA (installable to home screen)

## Deployment (Vercel + Neon)

1. **Connect repo to Vercel** — import this GitHub repo on Vercel
2. **Add Neon Postgres** — Vercel dashboard → Storage → Create Database → Neon. This auto-sets `DATABASE_URL`
3. **Add `AUTH_SECRET`** — generate one with `openssl rand -base64 32` and paste into Vercel env vars
4. **Deploy** — first deploy will succeed once env vars are set
5. **Push schema + seed** — from your local machine with `.env.local` pointing at the Neon DB:
   ```bash
   npm run db:push    # creates all tables
   npm run db:seed    # creates default clubs, coach account, active season
   ```
6. **First login** — username `coach` / password `Cadott2026!` — change immediately from your profile

## Local development

```bash
cp .env.example .env.local
# fill in DATABASE_URL and AUTH_SECRET

npm install
npm run db:push       # apply schema to your Neon dev DB
npm run db:seed       # seed default clubs + coach account
npm run dev
```

For a one-command fresh bootstrap plus production build:

```bash
npm run build:fresh    # db push + seed + next build
```

Open http://localhost:3000.

## Phase status

- **Phase 1 (current)** — Auth, roster management, tabbed dashboard, My Info tab (club distances), Practice tab (plan library), PWA setup
- **Phase 2 (next)** — Challenges + leaderboards + Stats tab
- **Phase 3 (after)** — Round logging + Birdie Board + coach team-view

See [`AGENTS.md`](AGENTS.md) for project conventions.
