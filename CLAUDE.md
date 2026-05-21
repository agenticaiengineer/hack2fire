# Hack2Fire

Role-based interview question bank built with Next.js 16, Prisma 5, PostgreSQL (Neon).

## Quick Start

```bash
# Local dev with Docker
docker compose up

# Or manual
npm install
vercel env pull .env.local
cp .env.local .env  # Prisma reads .env
npx prisma db push
npm run db:seed
npm run dev
```

## Key Commands

```bash
npm run dev              # Start dev server
npm run build            # prisma generate + next build
npx prisma db push       # Sync schema to DB (no migration)
npx prisma migrate dev   # Create migration
npm run db:seed          # Seed demo data
```

## Project Structure

```
src/
├── app/
│   ├── api/questions/         # REST API (agent content ingestion)
│   ├── admin/                 # Admin panel + version preview
│   ├── companies/             # Company-filtered question views
│   ├── dashboard/             # User dashboard
│   ├── login/                 # Auth page
│   ├── practice/[slug]/       # Question practice workspace
│   └── questions/             # Question catalog + edit
├── components/                # Shared React components
└── lib/
    ├── actions.ts             # Server actions (all mutations)
    ├── api-auth.ts            # API key auth for agent endpoints
    ├── auth.ts                # Session/JWT auth
    ├── format.ts              # Utilities (slugify, etc.)
    └── prisma.ts              # Prisma client singleton
```

## Auth

- **Web UI**: JWT session cookies, role-based (END_USER / CONTRIBUTOR / ADMIN)
- **API**: Bearer token via `API_SECRET_KEY` env var

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string (Neon)
- `SESSION_SECRET` — JWT signing key
- `API_SECRET_KEY` — API bearer token for agent access

### Setting up the API key

1. Generate a secure key:
   ```bash
   openssl rand -base64 32
   ```

2. Add to Vercel (will prompt for value and environments):
   ```bash
   vercel env add API_SECRET_KEY
   ```

3. Redeploy for the new env var to take effect:
   ```bash
   vercel --prod
   ```

4. For local dev, pull the env var:
   ```bash
   vercel env pull .env.local
   cp .env.local .env
   ```

5. Test the API:
   ```bash
   curl -H "Authorization: Bearer <your-key>" https://hack2fire.com/api/questions
   ```

## Deployment

Deployed on Vercel. Push to `main` triggers production deploy.

```bash
vercel --prod           # Manual deploy
vercel env add          # Add env var
vercel env pull .env.local  # Pull env vars locally
```

## Seed Credentials

- Admin: `admin@hack2fire.com` / `Hack2Fire!2026`
- Contributor: `contributor@hack2fire.com` / `Hack2Fire!2026`
- User: `user@hack2fire.com` / `Hack2Fire!2026`
