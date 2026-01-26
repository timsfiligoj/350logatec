# 350Logatec

Spletna aplikacija za sledenje odvozov odpadkov v občini Logatec.

## Funkcionalnosti

- Izbira E/M okoliša (1-12) za embalažo in mešane odpadke
- Izbira Bio okoliša (B1, B2) za biološke odpadke
- Koledar odvozov za leto 2026
- Prikaz naslednjega odvoza in prihajajočih odvozov
- Popup s seznamom vseh okolišev in ulic
- Shranjevanje izbire v localStorage

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **Fonts:** Plus Jakarta Sans (display), Inter (body)
- **Icons:** Lucide React
- **Date handling:** date-fns (Slovenian locale)

## Struktura projekta

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── odvoz/page.tsx        # Koledar odvozov
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
│   │   ├── WasteCalendar.tsx       # Mesečni koledar
│   │   ├── UpcomingCollection.tsx  # Naslednji odvozi
│   │   └── WasteTypeBadge.tsx      # Badge komponenta za tip odpadka
│   └── ui/                   # shadcn/ui components
├── hooks/
│   └── useLocalStorage.ts    # Hook za localStorage s sinhronizacijo
└── lib/
    ├── data/
    │   ├── okolisi.ts        # Definicije okolišev in ulic
    │   └── schedule-2026.ts  # Koledar odvozov za 2026
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
