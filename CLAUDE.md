@AGENTS.md

# Project: lotushack2026

## Tech Stack

- **Framework:** Next.js 16 (App Router, React 19)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 + Radix UI Themes
- **Database/Auth:** Supabase (`@supabase/supabase-js`, `@supabase/ssr`)
- **AI:** OpenRouter API
- **React Compiler:** Enabled

## Project Structure

```
src/
  app/          # Next.js App Router pages and layouts
```

Path alias: `@/*` maps to `./src/*`

## Commands

- `yarn dev` — Start dev server
- `yarn supabase:start` / `supabase:stop` / `supabase:status` — Local Supabase (Docker)
- `yarn supabase:migration:new <name>` — New SQL migration under `supabase/migrations/`
- `yarn supabase:db:reset` — Apply migrations + `supabase/seed.sql` to local DB
- `yarn build` — Production build
- `yarn start` — Start production server
- `yarn lint` — Run ESLint
- **Railway** — See [`RAILWAY.md`](./RAILWAY.md) for two-service setup (Next.js + `Dockerfile.valsea` proxy). `yarn start:valsea-proxy` runs the proxy locally.

## Environment Variables

See `.env.example` for required variables:
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase client config
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase server-only key (never expose to client)
- `OPENROUTER_API_KEY` — OpenRouter API key (server-only)
- `NEXT_PUBLIC_APP_URL` — App base URL

## Conventions

- Use `NEXT_PUBLIC_` prefix only for env vars that must be available client-side
- Server-side secrets (`SUPABASE_SERVICE_ROLE_KEY`, `OPENROUTER_API_KEY`) must never be imported in client components
- Use Radix UI Themes components for UI; Tailwind for custom styling
- Prefer Server Components by default; use `"use client"` only when needed
- Follow Next.js App Router conventions for routing, layouts, and data fetching
- Minimize `useEffect` usage — prefer Server Components, Server Actions, or event handlers. Only use `useEffect` for synchronizing with external systems (subscriptions, DOM measurements, third-party libs)
- Types go in colocated `.types.ts` files (e.g., `meetings.types.ts` next to `meetings/page.tsx`)
- Constants go in colocated `constants.ts` files
- Utility functions go in colocated `utils.ts` files
- One component per file — name the file after the component
