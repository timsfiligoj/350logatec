# 350Logatec

Aplikacija za sledenje odvozov odpadkov v občini Logatec.

## Tech Stack
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Auth + Database)
- Resend (Email)
- Vercel (Hosting)

## Live URL
https://350logatec.vercel.app

## GitHub
git@github.com:timsfiligoj/350logatec.git

## Supabase
- Project URL: https://terxkglsiydjshicgekg.supabase.co
- Tabele: user_settings, notification_log

## Ključne datoteke
- `src/lib/data/schedule-2026.ts` - koledar odvozov
- `src/lib/data/okolisi.ts` - definicije okolišev
- `src/app/api/cron/notify/route.ts` - email obvestila (cron vsak dan 17:00 UTC)

## Okoliši
- E/M okoliši: 1-12 (embalaža + mešani)
- Bio okoliši: 1-2

## Lokalni development
```bash
npm run dev
```

## Deploy
Push na main branch → avtomatski deploy na Vercel

## Environment Variables (Vercel)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `CRON_SECRET`

---

## Color Coding

Barve odpadkov:
- **Embalaža (E)**: MODRA (blue-500)
- **Mešani (M)**: ČRNA/SIVA (gray-700)
- **Bio (B)**: ZELENA (green-500)

## Data Source

Vsi podatki o okoliših in datumih odvozov so iz uradnega dokumenta:
- `/koledar2026.pdf` - Komunalno podjetje Logatec d.o.o.

## UI Patterns

- Shadcn/ui komponente
- Tailwind CSS v4
- Plus Jakarta Sans za naslove, Inter za body tekst
- Zelena/emerald primarna barva
- Slovenščina za vse tekste in datume (date-fns sl locale)
