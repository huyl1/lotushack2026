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
- One hook per file — name the file after the hook (e.g., `use-students.ts` for `useStudents`). Shared utilities like `fetchJSON` go in their own file (`fetch-json.ts`). Never bundle multiple hooks into a single file.

## Performance Rules

### Loading & Streaming

- Every route segment under `app/` must have a `loading.tsx` with skeleton UI
- Use `<Suspense>` boundaries to stream heavy data sections independently — render the shell instantly, stream data-dependent sections in
- Use the `.skeleton` CSS class (shimmer gradient) for loading placeholders — never `animate-pulse`
- Skeleton layouts must match the final rendered layout (same grid columns, heights) to avoid CLS

### Bundle Size

- Heavy libraries (`recharts`, `react-grid-layout`, `matter-js`, `motion`) must be dynamically imported via `next/dynamic` with `{ ssr: false }`
- Dynamic import at the **consumer level** — e.g., `const PanelStagePipeline = dynamic(() => import("./panel-stage-pipeline")...)` in the parent, not inside the component itself
- Never add `"use client"` to components that don't use hooks or browser APIs — pure UI components (badges, stat cards, empty states, section headers) stay as Server Components

### Data Fetching

- **Every database query must go through an API route** (`src/app/api/`) — never call Supabase directly from Server Components or `lib/data/queries.ts`. Pages and Server Components fetch data by calling internal API routes (e.g., `fetch("/api/students")`), not by importing query functions directly.
- All filtering, sorting, and aggregation of large datasets must happen server-side in the API route — never fetch all rows and filter in the client or Server Component
- Parallelize independent fetches with `Promise.all` — never await sequentially when requests don't depend on each other
- Wrap fetches called from multiple `<Suspense>` boundaries in React `cache()` to deduplicate per-request
- Data fetching happens server-side — no client-side fetching for initial page loads

### Charts (Recharts)

- Do NOT use `ResponsiveContainer` — it produces `width(-1) height(-1)` errors in flex/dynamic layouts
- Instead, measure the container with `ResizeObserver` and pass explicit `width`/`height` to the chart; only render the chart once dimensions are positive

### Responsive Layout

- Use the `.panels-row` class for side-by-side panels that stack on mobile (defined in `globals.css`)
- Prefer Tailwind responsive prefixes (`md:grid-cols-2`) over JS-based breakpoints
