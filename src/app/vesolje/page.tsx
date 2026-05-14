import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Leaf, Droplet, Snowflake, Clock, Satellite, ArrowRight } from 'lucide-react'
import { VesoljeShell } from '@/components/vesolje/VesoljeShell'
import { getLatestForView } from '@/lib/space/db'
import type { ViewKind } from '@/lib/space/storage'

export const metadata: Metadata = {
  title: 'Logatec iz vesolja | 350logatec',
  description:
    'Civilna iniciativa, ki Logatec gleda skozi odprte podatke evropskih satelitov Copernicus Sentinel-2. Pet pogledov na občino: rastje, voda, sneg in čas.',
}

export const revalidate = 3600

type ViewCard = {
  href: string
  label: string
  indexCode: string
  icon: typeof Leaf
  teaser: string
  viewKind: ViewKind
}

const VIEW_CARDS: ViewCard[] = [
  {
    href: '/vesolje/casovni-pregled',
    label: 'Časovni pregled',
    indexCode: 'RGB',
    icon: Clock,
    teaser: 'Logatec v naravnih barvah skozi leta — kot animacija iz orbite.',
    viewKind: 'true_color',
  },
  {
    href: '/vesolje/rastje',
    label: 'Rastje',
    indexCode: 'NDVI',
    icon: Leaf,
    teaser: 'Kako gosto raste Logatec skozi leto in kdaj rast doseže vrhunec.',
    viewKind: 'ndvi',
  },
  {
    href: '/vesolje/planinsko-polje',
    label: 'Planinsko polje',
    indexCode: 'NDWI',
    icon: Droplet,
    teaser: 'Kdaj polje poplavlja in koliko vode se zadrži po obilnem dežju.',
    viewKind: 'ndwi',
  },
  {
    href: '/vesolje/sneg',
    label: 'Sneg',
    indexCode: 'NDSI',
    icon: Snowflake,
    teaser: 'Kako dolga je snežna sezona in koliko občine je prekrite belo.',
    viewKind: 'ndsi',
  },
]

export default async function VesoljePage() {
  const latestByView = await Promise.all(
    VIEW_CARDS.map((card) => getLatestForView(card.viewKind)),
  )

  return (
    <VesoljeShell>
      <article className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        <header className="max-w-3xl">
          <p className="text-xs uppercase tracking-widest text-emerald-600 font-semibold">
            350space · civilna iniciativa
          </p>
          <h1 className="mt-2 font-display text-3xl md:text-5xl font-bold tracking-tight">
            Logatec <span className="text-gradient">iz vesolja</span>
          </h1>
          <p className="mt-5 text-base md:text-lg text-muted-foreground leading-relaxed">
            Vsakih 5 dni Evropa pošlje dva satelita 786 km nad Logatec. 350space
            te slike prevede v štiri zgodbe o občini — gozdovih, poljih, vodi
            in snegu — ter eno animacijo skozi leta v naravnih barvah.
          </p>
        </header>

        <section className="mt-10 md:mt-12">
          <h2 className="font-display text-sm md:text-base uppercase tracking-widest text-muted-foreground font-semibold">
            Štirje pogledi na občino
          </h2>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {VIEW_CARDS.map((card, i) => (
              <ViewCardLink
                key={card.href}
                card={card}
                thumbUrl={latestByView[i]?.public_url ?? null}
              />
            ))}
          </div>
        </section>

        <section className="mt-10 md:mt-14 rounded-2xl border bg-card p-6 md:p-8">
          <h2 className="font-display text-xl md:text-2xl font-semibold flex items-center gap-2">
            <Satellite className="h-5 w-5 text-emerald-600" />
            Kaj je Copernicus Sentinel-2
          </h2>
          <ul className="mt-4 grid gap-3 md:grid-cols-2 text-base text-muted-foreground leading-relaxed">
            <li className="flex gap-3">
              <span className="text-emerald-600 font-bold shrink-0">·</span>
              <span>
                Dva identična satelita (S2A, S2B) krožita <strong>786 km</strong>{' '}
                nad Zemljo v razmaku 180°.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-600 font-bold shrink-0">·</span>
              <span>
                Skupaj preletita isto točko <strong>vsakih 5 dni</strong>, kar
                omogoča gosto časovno serijo.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-600 font-bold shrink-0">·</span>
              <span>
                <strong>13 spektralnih pasov</strong> — vidijo, kar oči ne morejo:
                klorofil, vlago, sneg, oblake.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-600 font-bold shrink-0">·</span>
              <span>
                Nativna ločljivost <strong>10 m/piksel</strong>; vsak piksel
                pokriva 10 × 10 m terena.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-600 font-bold shrink-0">·</span>
              <span>
                Odprti podatki, financira EU preko programa{' '}
                <strong>Copernicus</strong>. Dostopni vsakemu državljanu.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-600 font-bold shrink-0">·</span>
              <span>
                Naša AOI pokriva <strong>~250 km²</strong>: Logatec, Hotedršica
                in Planinsko polje.
              </span>
            </li>
          </ul>
        </section>

        <footer className="mt-10 md:mt-12 space-y-3 text-xs text-muted-foreground leading-relaxed">
          <p>
            Contains modified Copernicus Sentinel data 2025–2026. Vir:
            Copernicus Data Space Ecosystem · Sentinel Hub Process +
            Statistical API.
          </p>
          <p>
            350space je neprofitna civilna iniciativa brez uradnega
            partnerstva z Občino Logatec.
          </p>
        </footer>
      </article>
    </VesoljeShell>
  )
}

function ViewCardLink({
  card,
  thumbUrl,
}: {
  card: ViewCard
  thumbUrl: string | null
}) {
  const Icon = card.icon
  return (
    <Link
      href={card.href}
      className="group block rounded-2xl border bg-card overflow-hidden transition-all hover:border-emerald-500/50 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {thumbUrl ? (
          <Image
            src={thumbUrl}
            alt={`Najnovejša ${card.label.toLowerCase()} scena Logatca iz vesolja`}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(min-width: 768px) 220px, 50vw"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-emerald-50 text-emerald-700/60 text-xs px-3 text-center">
            Še pridobivam podatke…
          </div>
        )}
        <span className="absolute top-2 right-2 rounded-full bg-black/50 backdrop-blur-sm px-2 py-0.5 text-[10px] font-mono font-semibold text-white tracking-wider">
          {card.indexCode}
        </span>
      </div>
      <div className="p-3 md:p-4">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-emerald-600 shrink-0" />
          <h3 className="font-display text-sm md:text-base font-semibold">
            {card.label}
          </h3>
        </div>
        <p className="mt-1.5 hidden md:line-clamp-2 text-xs text-muted-foreground leading-snug">
          {card.teaser}
        </p>
        <div className="mt-2 md:mt-3 flex items-center justify-end text-xs">
          <span className="flex items-center gap-1 font-medium text-emerald-600 group-hover:gap-2 transition-all">
            Odpri
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}
