This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Supabase (CLI & migrations)

The [Supabase CLI](https://supabase.com/docs/guides/cli) is used for local Postgres and SQL migrations. On macOS with Homebrew: `brew install supabase/tap/supabase` (already installed if `supabase --version` works).

- **Config:** `supabase/config.toml`
- **Migrations:** `supabase/migrations/*.sql` (run in timestamp order)
- **Seed:** `supabase/seed.sql` (runs after migrations on reset)

Common commands:

```bash
# Local stack (Docker required)
yarn supabase:start
yarn supabase:status

# New migration file
yarn supabase:migration:new add_profiles_table

# Apply migrations to local DB and run seed
yarn supabase:db:reset
```

Link this folder to your hosted project (one-time): `supabase login` then `supabase link --project-ref <ref>`. Push migrations to production: `supabase db push`.

## Python Exa Crawler

A Python module is available at `python/exa_crawler` for crawling URLs with Exa.

Quick start:

```bash
cd python
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# set EXA_API_KEY in .env
python -m exa_crawler https://example.com
```
