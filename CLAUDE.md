# 350Logatec - Claude Code Context

## Project Overview

350Logatec je spletna aplikacija za sledenje odvozov odpadkov v občini Logatec, Slovenija. Aplikacija omogoča prebivalcem, da izberejo svoj okoliš in pregledajo koledar odvozov za leto 2026.

## Key Files

### Data Files
- `src/lib/data/schedule-2026.ts` - Koledar odvozov (datumi za vse okoliše)
- `src/lib/data/okolisi.ts` - Definicije okolišev z ulicami

### Main Components
- `src/app/odvoz/page.tsx` - Glavna stran s koledarjem
- `src/components/odvoz/OkolisSelector.tsx` - Dropdown za izbiro okoliša
- `src/components/odvoz/OkolisiDialog.tsx` - Popup s seznamom vseh okolišev (točni podatki iz PDF)
- `src/components/odvoz/WasteCalendar.tsx` - Mesečni prikaz koledarja
- `src/components/odvoz/UpcomingCollection.tsx` - Kompakten prikaz prihajajočih odvozov
- `src/components/odvoz/WasteTypeBadge.tsx` - Badge in dot komponente za tip odpadka

### Hooks
- `src/hooks/useLocalStorage.ts` - Hook za localStorage s sinhronizacijo med komponentami (custom event)

## Color Coding (IMPORTANT)

Barve odpadkov so:
- **Embalaža (E)**: MODRA (blue-500, blue-100, blue-700)
- **Mešani (M)**: ČRNA/SIVA (gray-700, gray-100, gray-300)
- **Bio (B)**: ZELENA (green-500, green-100, green-700)

Te barve so definirane v `WasteTypeBadge.tsx` in morajo ostati konsistentne.

## Data Source

Vsi podatki o okoliših in datumih odvozov so iz uradnega dokumenta:
- `/koledar2026.pdf` - Komunalno podjetje Logatec d.o.o.

OkolisiDialog.tsx ima hardcoded podatke iz PDF-ja za natančen prikaz.

## UI Patterns

- Shadcn/ui komponente (button, card, select, badge, dialog, etc.)
- Tailwind CSS v4
- Plus Jakarta Sans za naslove, Inter za body tekst
- Zelena/emerald primarna barva (definirana v globals.css)
- Slovenščina za vse tekste in datume (date-fns sl locale)

## Development Notes

- useLocalStorage hook uporablja custom event "local-storage-change" za sinhronizacijo med komponentami v istem oknu
- Koledar se začne pri januarju 2026 in omogoča navigacijo samo znotraj leta 2026
- Kompaktni prikaz za UpcomingCollection (manj vertikalnega prostora)
