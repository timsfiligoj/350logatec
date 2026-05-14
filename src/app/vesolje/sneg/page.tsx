import type { Metadata } from 'next'
import { Snowflake, Mountain, Sparkles } from 'lucide-react'
import { VesoljeShell } from '@/components/vesolje/VesoljeShell'
import { ViewHero } from '@/components/vesolje/ViewHero'
import { MetricCard } from '@/components/vesolje/MetricCard'
import { ForGeeksDialog } from '@/components/vesolje/ForGeeksDialog'
import { getHistoryForView, getLatestForView, peakBy } from '@/lib/space/db'

export const metadata: Metadata = {
  title: 'Sneg — Logatec iz vesolja | 350logatec',
  description:
    'Kako dolga je snežna sezona nad Logatcem? Skozi snežni indeks NDSI vidimo, kdaj sneg prekrije občino in kako dolgo se obdrži.',
}

export const revalidate = 3600

const SI_MONTH_NAMES = [
  'januar',
  'februar',
  'marec',
  'april',
  'maj',
  'junij',
  'julij',
  'avgust',
  'september',
  'oktober',
  'november',
  'december',
]

function describeSnow(pct: number): string {
  if (pct >= 50) return 'snežna odeja čez večino občine'
  if (pct >= 20) return 'obsežen sneg, večinoma višine'
  if (pct >= 5) return 'sneg ostaja na hribih'
  if (pct >= 0.5) return 'samo posamezne sledi'
  return 'brez snega'
}

function siMonthYear(iso: string): string {
  return `${SI_MONTH_NAMES[Number(iso.slice(5, 7)) - 1]} ${iso.slice(0, 4)}`
}

export default async function SnegPage() {
  const [latest, history] = await Promise.all([
    getLatestForView('ndsi'),
    getHistoryForView('ndsi'),
  ])

  if (!latest) {
    return (
      <VesoljeShell>
        <EmptyState />
      </VesoljeShell>
    )
  }

  const peak = peakBy(history, 'snow_pct')
  const latestSnowPct = latest.metrics?.snow_pct ?? null
  const peakSnowPct = peak?.metrics?.snow_pct ?? null

  const forGeeks = (
    <ForGeeksDialog
      variant="overlay"
      title="Sneg · tehnično ozadje"
      description="Kako zaznamo sneg z neba"
    >
      <p>
        <strong>NDSI = (B03 − B11) / (B03 + B11)</strong>
      </p>
      <p>
        Normalised Difference Snow Index (Dozier, 1989) izkorišča, da sneg
        močno odbija zeleno svetlobo, a hkrati absorbira bližnjo
        kratkovalovno infrardečo (SWIR). NASA-priporočen prag za
        »piksel je sneg« je <strong>NDSI ≥ 0.4</strong>.
      </p>
      <ul>
        <li>
          <strong>B03 (Green, 560 nm)</strong> — sveži sneg je skoraj bel,
          močno odbija vso vidno svetlobo.
        </li>
        <li>
          <strong>B11 (SWIR, 1610 nm)</strong> — sneg in led to dolgovalovno
          infrardečo absorbirata, oblaki (ki sicer odbijajo zeleno) pa ne —
          tako razločimo sneg od oblačnosti.
        </li>
      </ul>
      <p>
        Za snežne scene zviša prag dovoljene oblačnosti na 60 % (slovenske
        zime so pogosto pod oblaki — z 20 % filtrom bi izgubili polovico
        zimske sezone). Sentinel Hub leastCC mozaikalnik kljub temu
        sestavi najčistejše piksle iz 10-dnevnega okna, tako da je končna
        slika boljša od katere koli posamezne scene.
      </p>
      <p>
        Metriko <em>% pod snegom</em> izračunamo iz histograma NDSI nad
        celotnim AOI: število pikslov z NDSI nad 0.4, deljeno s skupnim
        številom validnih pikslov.
      </p>
      <p>
        Vir: <strong>Sentinel-2 L2A</strong> · Copernicus Data Space
        Ecosystem · Sentinel Hub Process + Statistical API.
      </p>
    </ForGeeksDialog>
  )

  return (
    <VesoljeShell>
      <article className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
        <header className="mb-5 md:mb-6">
          <p className="text-xs uppercase tracking-widest text-slate-600 font-semibold">
            350space · sneg
          </p>
          <h1 className="mt-1 font-display text-2xl md:text-3xl font-bold tracking-tight">
            Kako dolga je <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-700 to-sky-500">snežna sezona</span>?
          </h1>
          <p className="mt-1.5 text-sm md:text-base text-muted-foreground max-w-2xl">
            Satelit zazna sneg po tem, kako odbija zeleno svetlobo in kako
            močno absorbira kratkovalovno infrardečo — celo skozi delno
            oblačnost.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] md:gap-6">
          <ViewHero
            acquisition={latest}
            alt={`NDSI prikaz Logatca, ${latest.captured_at.slice(0, 10)}`}
            actions={forGeeks}
            className="max-h-[58vh] md:max-h-[68vh]"
          />

          <div className="flex flex-col gap-4">
            {latestSnowPct !== null ? (
              <MetricCard
                label={`Najnovejša scena · ${siMonthYear(latest.captured_at)}`}
                value={`${latestSnowPct.toFixed(1)}`}
                unit="%"
                hint={`Pod snegom — ${describeSnow(latestSnowPct)}`}
                icon={Snowflake}
                accent="slate"
              />
            ) : null}
            {peak && peakSnowPct !== null ? (
              <MetricCard
                label="Največja snežna pokritost v podatkih"
                value={`${peakSnowPct.toFixed(1)}`}
                unit="%"
                hint={`Najgloblja zima: ${siMonthYear(peak.captured_at)}`}
                icon={Mountain}
                accent="slate"
              />
            ) : null}
          </div>
        </div>

        <section className="mt-8 md:mt-10 rounded-2xl border bg-card p-6 md:p-8">
          <h2 className="font-display text-xl md:text-2xl font-semibold flex items-center gap-2">
            <Mountain className="h-5 w-5 text-slate-600" />
            Kaj gledaš
          </h2>
          <div className="mt-3 space-y-3 text-base text-muted-foreground leading-relaxed">
            <p>
              Slika kaže, kako »snežen« je vsak piksel občine. Snežne
              površine so označene <strong>svetlomodro-bele</strong>, sredina
              kontinua (<strong>siva</strong>) pomeni rob taljenja ali mokra
              tla, najtemnejši odtenki so vegetacija in mesto.
            </p>
            <p>
              V <strong>poletnih mesecih</strong> je slika večinoma temno
              siva — brez snega na nizki nadmorski višini Logatca. Pozimi
              se pojavijo modro-beli pasovi: najprej hribi okrog občine,
              v hladnejših mesecih pa pogosto cela dolina.
            </p>
            <p>
              S kombinacijo mesečnih posnetkov vidimo, kako se snežna sezona
              razteza skozi čas — koliko dni pokriva določen del občine,
              ali se začne in konča prej ali kasneje kot v prejšnjih letih.
              To je tudi prvi vesoljski signal podnebnih sprememb na lokalni
              ravni.
            </p>
          </div>
        </section>

        <p className="mt-6 text-xs text-muted-foreground leading-relaxed">
          Contains modified Copernicus Sentinel data{' '}
          {latest.captured_at.slice(0, 4)}. Vir: Copernicus Data Space
          Ecosystem · Sentinel Hub Process API. Vse vizualizacije so
          generirane samodejno mesečno za območje Logatec + Hotedršica +
          Planinsko polje.
        </p>
      </article>
    </VesoljeShell>
  )
}

function EmptyState() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-3xl text-center">
      <Sparkles className="mx-auto h-10 w-10 text-slate-500" />
      <h1 className="mt-4 font-display text-3xl font-bold">
        Še nismo zbrali NDSI scene
      </h1>
      <p className="mt-3 text-muted-foreground">
        Pridobivanje podatkov je v teku. Vrni se čez nekaj minut.
      </p>
    </div>
  )
}
