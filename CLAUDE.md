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

## URL Konvencije

**POMEMBNO:** Vse nove strani ustvarjaj s slovenskimi imeni v URL-jih.

### Trenutni URL-ji
| URL | Namen |
|-----|-------|
| `/prijava` | Prijava uporabnika |
| `/registracija` | Registracija novega uporabnika |
| `/dobrodosli` | Onboarding po registraciji |
| `/nastavitve` | Uporabniške nastavitve |
| `/odvoz` | Koledar odvozov |
| `/pogoji` | Pogoji uporabe |
| `/zasebnost` | Politika zasebnosti |

### Izjeme (angleška imena)
- `/auth/callback` - OAuth callback (zahteva Google)
- `/api/*` - API endpoints (tehnična konvencija)

### Pravila za nove strani
1. Uporabi slovensko ime brez šumnikov (č→c, š→s, ž→z)
2. Uporabi male črke in vezaj za ločevanje besed
3. Primeri: `/moj-profil`, `/zgodovina-odvozov`, `/pomoc`

---

## Analytics & Monitoring

### Vercel Analytics
- Vključeno v `src/app/layout.tsx`
- Dashboard: https://vercel.com/timsfiligoj/350logatec/analytics
- Metrike: page views, visitors, referrers, devices

### Vercel Speed Insights
- Vključeno v `src/app/layout.tsx`
- Dashboard: https://vercel.com/timsfiligoj/350logatec/speed-insights
- Core Web Vitals:
  - **LCP** (Largest Contentful Paint) < 2.5s
  - **INP** (Interaction to Next Paint) < 200ms
  - **CLS** (Cumulative Layout Shift) < 0.1

### Performance optimizacije implementirane
- `next/image` za slike (auto lazy-loading, AVIF/WebP)
- Fonti preko `next/font` (no FOUT/FOIT)
- Moderne image formate v `next.config.ts`

---

## Periodic Tasks

### Tedenska analiza (vsakih 7 dni)
**OPOMNIK:** Na začetku vsake seje preveri ali je čas za tedensko analizo.

Naloge:
1. Preglej Vercel Analytics dashboard - trendi obiskov
2. Preglej Speed Insights - Core Web Vitals scores
3. Če so slabi rezultati (LCP > 2.5s, CLS > 0.1), predlagaj optimizacije
4. Preveri Supabase za morebitne napake v auth ali database

Ukazi za analizo:
```bash
# Lokalni lighthouse test
npx lighthouse https://350logatec.si --view

# Bundle size analiza
npm run build && cat .next/analyze/client.html
```
