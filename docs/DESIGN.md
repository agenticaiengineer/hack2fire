# Hack2Fire — Architecture & Design

## Overview

Hack2Fire is a role-based interview preparation platform. Users practice coding questions, contributors create content, and admins manage the catalog. A REST API enables AI agents to programmatically push content.

## System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Vercel (Production)                   │
│                                                              │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │  Next.js 16  │  │  API Routes  │  │  Server Actions    │  │
│  │  App Router  │  │  /api/*      │  │  (mutations)       │  │
│  │  (SSR + ISR) │  │  (JSON API)  │  │                    │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬───────────┘  │
│         │                 │                    │              │
│         └────────────┬────┘────────────────────┘              │
│                      │                                        │
│              ┌───────▼────────┐                               │
│              │  Prisma ORM    │                               │
│              │  (Client v5)   │                               │
│              └───────┬────────┘                               │
└──────────────────────┼───────────────────────────────────────┘
                       │
              ┌────────▼────────┐
              │  Neon Postgres  │
              │  (Serverless)   │
              └─────────────────┘
```

## User Roles & Permissions

| Capability | END_USER | CONTRIBUTOR | ADMIN |
|------------|----------|-------------|-------|
| View published questions | ✓ | ✓ | ✓ |
| Practice & save attempts | ✓ | ✓ | ✓ |
| Create questions | — | ✓ (→ REVIEW) | ✓ (→ PUBLISHED) |
| Edit own questions | — | ✓ | ✓ |
| Edit any question | — | — | ✓ |
| Publish/archive questions | — | — | ✓ |
| Manage users/roles | — | — | ✓ |
| Create templates/categories | — | — | ✓ |

## Data Model

```
User ──────────< Question >────────── Category
  │                  │                     
  │                  │──────────── QuestionTemplate
  │                  │
  │            QuestionVersion
  │                  
  └──────────< Attempt
```

### Question Versioning

Every question has a linear version history. Each version is an immutable snapshot.

```
Question
├── currentVersion = 3    (latest version number)
├── publishedVersion = 2  (which version end-users see)
│
├── QuestionVersion v1 (PUBLISHED) ── "Initial version"
├── QuestionVersion v2 (PUBLISHED) ── "Added solution notes"  ← LIVE
└── QuestionVersion v3 (REVIEW)    ── "Updated via API"       ← LATEST
```

**Key rules:**
- `currentVersion` increments on every edit (UI or API)
- `publishedVersion` only changes when an admin explicitly publishes a version
- End users always see `publishedVersion` content
- Admins can preview any version and publish any version (not just latest)
- Versions are never deleted or modified after creation

## Content Lifecycle

```
                    ┌─────────────┐
                    │   DRAFT     │  (manual creation)
                    └──────┬──────┘
                           │
              ┌────────────▼─────────────┐
              │         REVIEW           │  (contributor creates)
              └────────────┬─────────────┘
                           │ admin approves
              ┌────────────▼─────────────┐
              │        PUBLISHED         │  (visible to all users)
              └────────────┬─────────────┘
                           │ admin archives
              ┌────────────▼─────────────┐
              │        ARCHIVED          │  (hidden from catalog)
              └──────────────────────────┘
```

**API-created content** skips REVIEW and goes directly to PUBLISHED (agent is trusted).

## Authentication

### Web UI — JWT Sessions

```
Browser → POST /login (server action)
       → authenticate(email, password)
       → bcrypt.compare(password, passwordHash)
       → createSession() → sign JWT with jose
       → Set httpOnly cookie "session" (7-day expiry)

Subsequent requests:
       → getSessionUser() → verify JWT from cookie
       → requireRole([...]) → redirect if unauthorized
```

### API — Bearer Token

```
Agent → GET /api/questions
        Authorization: Bearer <API_SECRET_KEY>
     → requireApiKey() → compare against env var
     → 401 if mismatch, proceed if valid
```

The API key is a shared secret stored in `API_SECRET_KEY` environment variable on Vercel.

## API Design

### Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/questions | API key | List questions (filterable) |
| POST | /api/questions | API key | Create question |
| GET | /api/questions/:slug | API key | Get question + versions |
| PUT | /api/questions/:slug | API key | Update question (auto-versions) |
| DELETE | /api/questions/:slug | API key | Soft delete (archive) |

### Auto-Versioning on PUT

Every PUT request automatically:
1. Reads the current question state
2. Merges updates with existing fields
3. Creates a new `QuestionVersion` with the merged snapshot
4. Increments `currentVersion` on the question
5. All within a database transaction

The caller never needs to manage versions — it's transparent.

## Page Routing

| Route | Purpose | Auth |
|-------|---------|------|
| `/` | Landing page (ISR, 10min cache) | Public |
| `/login` | Login/register | Public |
| `/questions` | Question catalog | Public |
| `/practice/:slug` | Practice workspace | Public (save requires login) |
| `/companies` | Companies listing | Public |
| `/companies/:company` | Company-filtered questions | Public |
| `/dashboard` | User dashboard + contribution form | Authenticated |
| `/admin` | Admin control room | ADMIN |
| `/admin/questions/:slug/versions/:version` | Version preview + publish | ADMIN |
| `/questions/:slug/edit` | Edit question (new version) | CONTRIBUTOR+ |

## Deployment

- **Platform:** Vercel (Fluid Compute)
- **Database:** Neon Postgres (via Vercel Marketplace)
- **Region:** iad1 (US East)
- **Build:** `prisma generate && next build`
- **Home page caching:** ISR with 600s revalidation

### Environment Variables (Vercel)

| Variable | Purpose |
|----------|---------|
| DATABASE_URL | Neon pooled connection string |
| DATABASE_URL_UNPOOLED | Direct connection (for migrations) |
| API_SECRET_KEY | Agent API bearer token |
| SESSION_SECRET | JWT signing key (optional, uses default in code) |

## Local Development

### With Docker

```bash
docker compose up
# App at http://localhost:3000
# Postgres at localhost:5432 (hack2fire/hack2fire)
# Auto-runs: prisma migrate deploy + db:seed + next dev
```

### Without Docker

```bash
npm install
vercel env pull .env.local
cp .env.local .env
npx prisma db push
npm run db:seed
npm run dev
```

## File Reference

| File | Purpose |
|------|---------|
| `src/lib/auth.ts` | JWT session management, password auth, role guards |
| `src/lib/actions.ts` | All server actions (11 exported functions) |
| `src/lib/api-auth.ts` | API key validation middleware |
| `src/lib/prisma.ts` | Prisma client singleton |
| `src/lib/format.ts` | slugify, difficultyClass, roleLabel |
| `prisma/schema.prisma` | Database schema (6 models, 4 enums) |
| `prisma/seed.ts` | Demo data (3 users, 2 templates, 3 categories, 2 questions) |
| `scripts/local-preview.mjs` | Standalone HTML preview server (no DB) |
