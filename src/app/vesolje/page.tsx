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
    'Logatec skozi odprte podatke evropskih satelitov Copernicus Sentinel-2. Štiri zgodbe o občini: rastje, voda, sneg in čas.',
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
    teaser:
      'Logatec v naravnih barvah skozi leto. Tako približno bi občino videli iz vesolja, če bi jo opazovali z zelo zmogljivo kamero.',
    viewKind: 'true_color',
  },
  {
    href: '/vesolje/rastje',
    label: 'Rastje',
    indexCode: 'NDVI',
    icon: Leaf,
    teaser:
      'Kje je narava najbolj živa? Ta pogled pokaže, kako močno rastejo gozdovi, travniki in polja. Bolj izrazita zelena običajno pomeni več aktivnega rastja.',
    viewKind: 'ndvi',
  },
  {
    href: '/vesolje/planinsko-polje',
    label: 'Planinsko polje',
    indexCode: 'NDWI',
    icon: Droplet,
    teaser:
      'Planinsko polje se po močnem dežju pogosto spremeni v začasno jezero. Satelitski podatki pomagajo pokazati, kdaj je polje poplavljeno in kako se voda sčasoma umika.',
    viewKind: 'ndwi',
  },
  {
    href: '/vesolje/sneg',
    label: 'Sneg',
    indexCode: 'NDSI',
    icon: Snowflake,
    teaser:
      'Satelit lahko razloči sneg od zemlje, gozda in vode. Tako lahko spremljamo, koliko občine je bilo prekrite s snegom in kako dolgo je trajala snežna sezona.',
    viewKind: 'ndsi',
  },
]

const FACTS = [
  { label: 'Hitrost', value: '~ 27.000 km/h' },
  { label: 'Višina', value: '~ 786 km nad Zemljo' },
  { label: 'En obhod Zemlje', value: '~ 100 minut' },
  { label: 'Obhodov na dan', value: '~ 14' },
  { label: 'Ločljivost', value: 'do 10 m na piksel' },
  { label: 'Spektralni pasovi', value: '13' },
  { label: 'Širina zajema', value: '~ 290 km' },
  { label: 'Dostop do podatkov', value: 'brezplačen, odprt' },
] as const

export default async function VesoljePage() {
  const latestByView = await Promise.all(
    VIEW_CARDS.map((card) => getLatestForView(card.viewKind)),
  )

  return (
    <VesoljeShell showNav={false}>
      <article className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        <header className="max-w-3xl">
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
            Logatec <span className="text-gradient">iz vesolja</span>
          </h1>
          <div className="mt-5 space-y-4 text-base md:text-lg text-muted-foreground leading-relaxed">
            <p>
              Vsakih nekaj dni evropski sateliti Sentinel-2 preletijo tudi
              Logatec. Letijo približno 786 km nad Zemljo, s hitrostjo okoli
              27.000 km/h, in v dobrih 100 minutah obkrožijo celoten planet.
            </p>
            <p>
              Iz njihovih posnetkov lahko vidimo, kako se skozi leto
              spreminjajo gozdovi, polja, voda in sneg v naši občini.
              350logatec te satelitske podatke prevede v preproste zgodbe,
              razumljive tudi brez znanja geografije ali vesoljske tehnologije.
            </p>
          </div>
        </header>

        <section className="mt-10 md:mt-14">
          <h2 className="font-display text-sm md:text-base uppercase tracking-widest text-muted-foreground font-semibold">
            Štirje pogledi na občino
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3 md:gap-5">
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
          <div className="mt-4 space-y-4 text-base text-muted-foreground leading-relaxed">
            <p>
              Copernicus Sentinel-2 je evropska satelitska misija za
              opazovanje Zemlje. Ne gre za vohunski satelit, ampak za javno
              infrastrukturo, ki spremlja stanje površja: gozdove, polja,
              vode, obalo, požare, sušo, poplave in druge spremembe v okolju.
            </p>
            <p>
              Sentinel-2 leti v tako imenovani sončno-sinhroni orbiti. To
              pomeni, da isto območje običajno opazuje ob podobni uri dneva.
              Zaradi tega lahko posnetke med seboj bolje primerjamo, saj so
              svetlobni pogoji bolj podobni.
            </p>
            <p>
              Satelit ne vidi samo običajnih barv, ki jih vidimo ljudje. Meri
              13 različnih delov svetlobe. Nekateri pokažejo klorofil v
              rastlinah, drugi vlago, sneg, oblake ali stanje tal. Zato lahko
              iz satelitskega posnetka izvemo precej več kot iz navadne
              fotografije.
            </p>
            <p>
              Najbolj podrobni posnetki imajo ločljivost 10 metrov na piksel.
              En piksel predstavlja približno površino 10 × 10 metrov. To ni
              dovolj, da bi prepoznali ljudi, avtomobile ali hišne podrobnosti.
              Je pa dovolj, da vidimo gozdove, travnike, večje njive, naselja,
              poplavljena območja in spremembe skozi letne čase.
            </p>
            <p>
              Eden največjih dosežkov programa Copernicus je, da so ti podatki
              prosto dostopni. Evropska unija je zgradila sistem, kjer se
              satelitski podatki ne zapirajo v predale, ampak so na voljo
              občinam, raziskovalcem, podjetjem, šolam in posameznikom. To je
              ena najboljših evropskih digitalnih javnih infrastruktur.
            </p>
          </div>

          <dl className="mt-6 md:mt-8 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-4 border-t pt-6">
            {FACTS.map((fact) => (
              <div key={fact.label}>
                <dt className="text-[10px] md:text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                  {fact.label}
                </dt>
                <dd className="mt-0.5 text-sm md:text-base font-medium text-foreground">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <footer className="mt-10 md:mt-12 space-y-3 text-xs text-muted-foreground leading-relaxed">
          <p>
            Vsebina uporablja obdelane podatke misije Copernicus Sentinel-2 za
            območje Logatca, Hotedršice in Planinskega polja. Posnetki so
            namenjeni splošnemu prikazu sprememb v prostoru in niso uradna
            geodetska podlaga. Na kakovost posameznega posnetka lahko vplivajo
            oblaki, megla, sneg in drugi vremenski pogoji.
          </p>
          <p>
            Vir podatkov: Copernicus Data Space Ecosystem, Sentinel Hub Process
            API, 350logatec obdelava podatkov.
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
            sizes="(min-width: 768px) 480px, 50vw"
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
      <div className="p-3 md:p-5">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-emerald-600 shrink-0" />
          <h3 className="font-display text-sm md:text-lg font-semibold">
            {card.label}
          </h3>
        </div>
        <p className="mt-2 hidden md:block text-sm text-muted-foreground leading-relaxed">
          {card.teaser}
        </p>
        <div className="mt-2 md:mt-4 flex items-center justify-end text-xs md:text-sm">
          <span className="flex items-center gap-1 font-medium text-emerald-600 group-hover:gap-2 transition-all">
            Odpri
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}
