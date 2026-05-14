import type { Metadata } from 'next'
import { Leaf, Sprout, TrendingUp, Sparkles } from 'lucide-react'
import { VesoljeShell } from '@/components/vesolje/VesoljeShell'
import { ViewHero } from '@/components/vesolje/ViewHero'
import { MetricCard } from '@/components/vesolje/MetricCard'
import { ForGeeksDialog } from '@/components/vesolje/ForGeeksDialog'
import { getHistoryForView, getLatestForView, peakBy } from '@/lib/space/db'

export const metadata: Metadata = {
  title: 'Rastje — Logatec iz vesolja | 350logatec',
  description:
    'Kako gosto raste Logatec? Skozi vegetacijski indeks NDVI vidimo, kdaj se začnejo zeleneti gozdovi in polja in kdaj rast doseže vrhunec.',
}

export const revalidate = 3600 // 1h ISR

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

function describeNdvi(mean: number): string {
  if (mean >= 0.75) return 'zelo gosto rastje'
  if (mean >= 0.6) return 'gosto rastje'
  if (mean >= 0.4) return 'zmerno rastje'
  if (mean >= 0.2) return 'redko rastje'
  return 'pretežno gola tla'
}

export default async function RastjePage() {
  const [latest, history] = await Promise.all([
    getLatestForView('ndvi'),
    getHistoryForView('ndvi'),
  ])

  if (!latest) {
    return (
      <VesoljeShell>
        <EmptyState />
      </VesoljeShell>
    )
  }

  const peak = peakBy(history, 'mean')
  const latestMean = latest.metrics?.mean ?? null
  const peakMean = peak?.metrics?.mean ?? null
  const peakMonthLabel = peak
    ? `${SI_MONTH_NAMES[Number(peak.captured_at.slice(5, 7)) - 1]} ${peak.captured_at.slice(0, 4)}`
    : null

  return (
    <VesoljeShell>
      <article className="container mx-auto px-4 py-10 md:py-14 max-w-5xl">
        <header className="flex flex-col gap-3 mb-8">
          <p className="text-sm uppercase tracking-widest text-emerald-600 font-semibold">
            350space · rastje
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            Kako gosto <span className="text-gradient">raste Logatec</span>?
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Satelitski pogled na vegetacijo občine: kdaj se začne zeleneti, kdaj
            doseže vrhunec, in kdaj listje pade.
          </p>
        </header>

        <ViewHero
          acquisition={latest}
          alt={`NDVI prikaz Logatca, ${latest.captured_at.slice(0, 10)}`}
        />

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          {latestMean !== null ? (
            <MetricCard
              label={`Najnovejša scena · ${SI_MONTH_NAMES[Number(latest.captured_at.slice(5, 7)) - 1]} ${latest.captured_at.slice(0, 4)}`}
              value={latestMean.toFixed(2)}
              hint={`Povprečni NDVI — ${describeNdvi(latestMean)}`}
              icon={Leaf}
              accent="emerald"
            />
          ) : null}
          {peak && peakMean !== null && peakMonthLabel ? (
            <MetricCard
              label="Vrh rasti v podatkih"
              value={peakMean.toFixed(2)}
              hint={`Najgosteje letos: ${peakMonthLabel}`}
              icon={TrendingUp}
              accent="emerald"
            />
          ) : null}
        </section>

        <section className="mt-10 rounded-2xl border bg-card p-6 md:p-8">
          <h2 className="font-display text-2xl font-semibold flex items-center gap-2">
            <Sprout className="h-5 w-5 text-emerald-600" />
            Kaj gledaš
          </h2>
          <div className="mt-3 space-y-3 text-base text-muted-foreground leading-relaxed">
            <p>
              Slika ni navadna fotografija. Sentinel-2 satelit meri, koliko
              rdeče svetlobe rastline absorbirajo in koliko bližnje infrardeče
              odbijejo nazaj. Zdrava, gosta vegetacija močno odbija infrardečo
              — in to razmerje pretvorimo v <strong>NDVI</strong>, indeks od
              −1 do +1.
            </p>
            <p>
              Na sliki je vse <strong>temno zeleno</strong> gosto raščeno
              (gozdovi, polja v polni rasti). <strong>Svetlo zelena</strong> so
              travniki in nedavno obrezani vrtovi.{' '}
              <strong>Rjavkasto-rumena</strong> so gola polja, ceste, naselje.
            </p>
            <p>
              Z mesečnimi posnetki vidimo, kako se občina »oblači« v zeleno
              spomladi in postopno »slači« jeseni — bistveno za sledenje
              suše, vročinskih valov in spreminjajočih se vegetacijskih ciklov.
            </p>
          </div>
        </section>

        <div className="mt-8 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
            Contains modified Copernicus Sentinel data{' '}
            {latest.captured_at.slice(0, 4)}. Vir: Copernicus Data Space
            Ecosystem · Sentinel Hub Process API. Vse vizualizacije so
            generirane samodejno mesečno za območje Logatec + Hotedršica +
            Planinsko polje.
          </p>
          <ForGeeksDialog
            title="Rastje · tehnično ozadje"
            description="Kako pridemo od svetlobe do zelene v sliki"
          >
            <p>
              <strong>NDVI = (B08 − B04) / (B08 + B04)</strong>
            </p>
            <p>
              Sentinel-2 ima 13 spektralnih pasov. Za vegetacijo uporabljamo dva:
            </p>
            <ul>
              <li>
                <strong>B04 (Red, 665 nm)</strong> — klorofil močno absorbira
                rdečo svetlobo, da napaja fotosintezo. Zato je z neba videti
                temna na zdravih rastlinah.
              </li>
              <li>
                <strong>B08 (NIR, 842 nm)</strong> — bližnjo infrardečo
                celična struktura listov močno odbija. Več plasti listja → več
                NIR → svetlejši signal.
              </li>
            </ul>
            <p>
              Razmerje med njima daje vrednost med −1 in +1. Vrednosti pod 0
              pomenijo vodo, sneg ali oblake. Med 0 in 0.2 so gola tla in
              umetne površine. Med 0.2 in 0.4 redka vegetacija, nad 0.6
              gozdovi in polja v polni rasti.
            </p>
            <p>
              Za vsako mesečno sceno izberemo Sentinel-2 prehod z najmanj
              oblačnosti v tem mesecu. Sentinel Hub Process API mozaika
              robove med tile-i (sosednji prehodi v 10-dnevnem oknu) tako, da
              vedno dobimo najčistejši piksel za vsako lokacijo.
            </p>
            <p>
              Vir: <strong>Sentinel-2 L2A</strong> (atmosfersko korigirana
              raven), <strong>Copernicus Data Space Ecosystem</strong>, dnevno
              odprti EU vesoljski podatki.
            </p>
          </ForGeeksDialog>
        </div>
      </article>
    </VesoljeShell>
  )
}

function EmptyState() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-3xl text-center">
      <Sparkles className="mx-auto h-10 w-10 text-emerald-500" />
      <h1 className="mt-4 font-display text-3xl font-bold">
        Še nismo zbrali NDVI scene
      </h1>
      <p className="mt-3 text-muted-foreground">
        Pridobivanje podatkov je v teku. Vrni se čez nekaj minut.
      </p>
    </div>
  )
}
