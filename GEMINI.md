# MDS Alumni - Next.js + Supabase

## Stack

- Next.js 16 (App Router)
- Supabase (auth, database)
- TypeScript, Tailwind, Shadcn UI

## Conventions

- Use Supabase client for DB queries
- PostgreSQL: use double quotes for table/column names
- Prefer Server Components, minimal `use client`
- Use `nuqs` for URL search params

## Skills

@./.gemini/skills

## Database Schema

@./docs/db-schema.md

## Supabase Clients

- `src/utils/supabase/client.ts` - Browser client
- `src/utils/supabase/server.ts` - Server client (needs cookieStore)
- `src/utils/supabase/middleware.ts` - Middleware client
