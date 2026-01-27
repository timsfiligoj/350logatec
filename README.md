# 350Logatec

Spletna aplikacija za sledenje odvozov odpadkov v občini Logatec.

## Funkcionalnosti

### Koledar odvozov
- Izbira E/M okoliša (1-12) za embalažo in mešane odpadke
- Izbira Bio okoliša (B1, B2) za biološke odpadke
- Koledar odvozov za leto 2026
- Prikaz naslednjega odvoza in prihajajočih odvozov
- Popup s seznamom vseh okolišev in ulic
- Iskanje po naslovu za avtomatsko nastavitev okoliša

### Uporabniški račun
- Registracija z emailom ali Google računom
- Prijava in odjava
- Onboarding za nove uporabnike
- Upravljanje nastavitev (okoliš, obvestila, profil)
- Izbris računa z ohranitvijo anonimiziranih podatkov

### Obvestila
- Email obvestila dan pred odvozom
- Možnost vklopa/izklopa obvestil

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **Fonts:** Plus Jakarta Sans (display), Inter (body)
- **Icons:** Lucide React
- **Date handling:** date-fns (Slovenian locale)
- **Authentication:** Supabase Auth (Email, Google OAuth)
- **Database:** Supabase (PostgreSQL)
- **Email:** Resend
- **Hosting:** Vercel

## Struktura projekta

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── odvoz/page.tsx        # Koledar odvozov
│   ├── prijava/page.tsx      # Prijava
│   ├── registracija/page.tsx # Registracija
│   ├── dobrodosli/page.tsx   # Onboarding
│   ├── nastavitve/page.tsx   # Uporabniške nastavitve
│   ├── pogoji/page.tsx       # Pogoji uporabe
│   ├── zasebnost/page.tsx    # Politika zasebnosti
│   ├── api/
│   │   └── account/delete/   # API za izbris računa
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles + color palette
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── landing/
│   │   ├── Hero.tsx
│   │   └── HowItWorks.tsx
│   ├── odvoz/
│   │   ├── OkolisSelector.tsx      # Dropdown izbira okoliša
│   │   ├── OkolisiDialog.tsx       # Popup s seznamom okolišev
│   │   ├── AddressSearch.tsx       # Iskanje po naslovu
│   │   ├── WasteCalendar.tsx       # Mesečni koledar
│   │   ├── UpcomingCollection.tsx  # Naslednji odvozi
│   │   └── WasteTypeBadge.tsx      # Badge komponenta za tip odpadka
│   ├── auth/
│   │   └── AuthProvider.tsx        # Auth context
│   ├── settings/
│   │   └── DeleteAccountDialog.tsx # Dialog za izbris računa
│   └── ui/                   # shadcn/ui components
├── hooks/
│   └── useLocalStorage.ts    # Hook za localStorage s sinhronizacijo
└── lib/
    ├── data/
    │   ├── okolisi.ts        # Definicije okolišev in ulic
    │   └── schedule-2026.ts  # Koledar odvozov za 2026
    ├── supabase/
    │   ├── client.ts         # Supabase client
    │   ├── server.ts         # Supabase server client
    │   └── admin.ts          # Supabase admin client
    ├── email/
    │   └── resend.ts         # Email pošiljanje
    └── utils.ts              # cn() helper
```

## Barvno kodiranje odpadkov

| Tip | Barva | Opis |
|-----|-------|------|
| E (Embalaža) | Modra | Plastična in kovinska embalaža |
| M (Mešani) | Črna/siva | Mešani komunalni odpadki |
| B (Bio) | Zelena | Biološko razgradljivi odpadki |

## Zagon

```bash
# Namestitev
npm install

# Development
npm run dev

# Build
npm run build

# Start production
npm start
```

## Podatki

Koledar odvozov je ekstrahiran iz uradnega dokumenta `koledar2026.pdf` Komunalnega podjetja Logatec d.o.o.

- 12 E/M okolišev za embalažo in mešane odpadke
- 2 Bio okoliša za biološke odpadke
- Okoliš 11 ima tedenski odvoz (bloki, podjetja)
