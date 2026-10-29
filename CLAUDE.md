# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A data science portfolio (`frontend/`, Next.js 15 App Router → Vercel) backed by a
full CMS (`backend/`, FastAPI + SQLAlchemy 2 → Render, Neon Postgres, Cloudflare
R2 media). **Nothing on the public site is hardcoded** — every string, image, and
section comes from the database and is editable at `/admin`. When adding a public
feature, the content for it must come from a model + admin screen, not from a
literal in a component.

Two docs carry the intent behind the code and are worth reading before non-trivial
changes:

- `skills.md` — the original product spec. Code comments reference its sections
  (`§36`, `§43`, "per skills.md §49–50"); when you see a `§` number, look it up there.
- `DESIGN.md` — the visual system: palette tokens, the type ramp, and the
  "pattern budget" (85% calm interface / 15% cloth).

## Commands

Backend (`cd backend`, venv active):

```bash
pip install -r requirements.txt
alembic upgrade head                  # apply migrations
alembic revision --autogenerate -m "…"  # after editing app/models.py
python -m app.seed                    # idempotent; --force wipes content tables and reseeds
uvicorn app.main:app --reload --port 8000
```

Frontend (`cd frontend`):

```bash
npm run dev          # localhost:3000
npm run typecheck    # tsc --noEmit
npm run build
npm run lint
```

Start the backend first — public pages fetch from it at build time.

### Checking work

There is no test suite. Verification is: `npm run typecheck && npm run build` on the
frontend, and booting the backend against SQLite for the API:

```bash
cd backend
DATABASE_URL="sqlite:///./test.db" STORAGE_BACKEND=local python -m app.seed
DATABASE_URL="sqlite:///./test.db" STORAGE_BACKEND=local uvicorn app.main:app --port 8000
# then exercise /docs (available whenever ENVIRONMENT != production)
```

For local dev without Postgres or R2: `DATABASE_URL=sqlite:///./local.db`,
`STORAGE_BACKEND=local`, `COOKIE_SECURE=false`, `COOKIE_SAMESITE=lax`.

## Backend architecture

`app/main.py` mounts everything under `/api/v1`: one public router plus admin
routers for auth, settings, dashboard, media, posts, projects, and `content`.

**The CRUD factory is the main structural idea.** `app/api/crud.py`
`build_crud_router()` generates the identical eight operations (list, get, create,
patch, delete, reorder, …) for every "simple" entity; `app/api/admin/content.py`
is just a list of factory calls with optional `on_create` / `on_update` hooks
(e.g. `_sync_achievements`, `_ensure_slug`). Adding a simple collection means a
model, three schemas, and one `include_router(build_crud_router(...))` block —
not a new hand-written router. Only projects, posts, and media have bespoke
routers, because only they need soft delete, publishing, or uploads.

Two constraints in that file are load-bearing: **no `from __future__ import
annotations`** in `crud.py` (PEP 563 would stringify the runtime `create_schema`
annotations and FastAPI would silently read the body as query params), and the
mirror of this on the frontend is `resource<T>()` in `lib/api.ts`.

Other things to know:

- **Config** (`app/config.py`) — list env vars (`CORS_ORIGINS`,
  `ALLOWED_IMAGE_TYPES`) are declared as `str` and parsed by `_csv_list`, not as
  `List[str]`; pydantic-settings JSON-decodes complex types at import time and
  would crash on `a,b`. Accepts both CSV and JSON array. The app refuses to boot
  in production with the default `SECRET_KEY`.
- **Auth** (`app/api/deps.py`) — JWT in an HTTP-only cookie (`pf_access` /
  `pf_refresh`), with a `Bearer` header fallback for scripts/SSR. `require_admin`
  gates every admin router. Login failures are deliberately uniform.
- **Sanitization** (`app/core/sanitize.py`) — all rich text is nh3-cleaned against
  an allowlist **on write**. Widening what the Tiptap editor can produce means
  widening `ALLOWED_TAGS` / `ALLOWED_ATTRIBUTES` too, or the markup gets stripped.
- **Storage** (`app/core/storage.py`) — one `StorageBackend` interface; R2/S3 and
  local disk. Uploads are downscaled to 1920px and stored next to a `.webp`
  derivative the site prefers. Categories are a fixed set (`VALID_CATEGORIES`).
  Swapping providers is env-only.
- **Slugs** — always through `app/core/slugs.py` `unique_slug()`, which appends
  `-2`, `-3` … and tolerates an entity keeping its own slug on edit.
- **Soft delete** is blog-posts-only: `BlogPost.deleted_at`. Admin and public
  queries must filter `deleted_at.is_(None)`.
- **Neon** autosuspends, hence `pool_pre_ping` / `pool_recycle=280` in
  `database.py`. Migrations run at boot via `render.yaml`'s `startCommand`.

## Frontend architecture

Route groups separate the two experiences: `app/(site)/*` is the public portfolio
(wrapped in `(site)/layout.tsx`, which fetches profile/settings/social links),
`app/admin/*` is the CMS with its own layout and `robots: noindex`.

**All API access goes through `lib/api.ts`.** Three distinct call styles, and the
choice matters:

- `publicGet` — ISR (`next: { revalidate: 300 }`), returns `null` on any failure
  so a page renders its empty state rather than 500ing. Public pages each declare
  `export const revalidate = 300`.
- `publicGetStrict` — throws `ApiError` so detail pages can call `notFound()`.
- `adminFetch` — `credentials: "include"`, `cache: "no-store"`; never stores a
  token in JS. Client components only.

Admin screens are built from two shared pieces rather than bespoke forms:
`components/admin/CollectionManager.tsx` (declarative `FieldDef[]` → list + form +
confirm + reorder, paired with `resources.*` from `lib/api.ts`) and
`components/admin/fields.tsx`. A new simple admin screen is a `FieldDef[]` and a
`describe()` function. Projects and posts get their own editors
(`ProjectEditor`, `PostEditor`, Tiptap-based `Editor`).

### Design system — not optional styling

`app/globals.css` defines every token. Two separate palettes, and mixing them is a
bug:

- `--pat-*` **pigments** are artwork only, identical in both themes, and only ever
  appear inside SVG bandwork where black outlines carry the contrast. **Never use a
  pigment for text or borders.**
- Interface colors (`--bg`, `--surface`, `--text`, `--muted`, `--gold`, `--clay`,
  `--indigo`, `--palm`, `--plum`, `--ember`) shift per theme. `--plum` is
  AI/deep-learning only; `--ember` is destructive/error only.

Type sizes come from the fixed ramp in `@theme` (`--text-2xs` … `--text-5xl`) — no
arbitrary sizes. Three fonts, three non-overlapping jobs: Sora (display + all UI),
Newsreader (long-form body only), JetBrains Mono (code only).

`components/weave/Weave.tsx` is the pattern generator: a seeded mulberry32 PRNG
drives motif choice so server and client render identical markup and a given seed
always yields the same cloth. It appears at exactly four weights — `Weave` (full
panel), `WeaveStrip` (band), `WeaveRule` (13px heading rule), `WeaveMark` (logo
lozenge). Items without a cover image get a panel seeded from their own id.

### Conventions that bite

- Remote image hosts must be allow-listed in `next.config.ts` `remotePatterns` or
  `next/image` refuses them. Skill icons accept any URL (Devicon → Iconify →
  Simple Icons, in preference order); a missing or 404ing icon falls back to a
  lettered tile via `SmartImage`, never a broken image and never an emoji.
- Buttons for optional URLs (live demo, GitHub, verification) render only when the
  URL exists — never as a dead button.
- Featured content drives the homepage, with a most-recent fallback so it is never
  empty. Project case-study sections are each optional and hidden when blank.

## Env and deploy

`backend/.env.example` and `frontend/.env.example` list everything. Backend secrets
are set in the Render dashboard (`sync: false` in `render.yaml`), `SECRET_KEY` is
Render-generated. `CORS_ORIGINS` must list **every** browser origin including Vercel
preview domains, or the CMS breaks there. Frontend needs `NEXT_PUBLIC_API_URL`
(including the `/api/v1` suffix), `NEXT_PUBLIC_SITE_URL`, and
`NEXT_PUBLIC_MEDIA_HOST` (hostname only). The canonical site URL for OG tags and
`sitemap.xml` comes from CMS **Site settings**, not from env.
