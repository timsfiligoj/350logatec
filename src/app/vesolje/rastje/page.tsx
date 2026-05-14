import type { Metadata } from 'next'
import { Sprout, Sparkles } from 'lucide-react'
import { VesoljeShell } from '@/components/vesolje/VesoljeShell'
import { ForGeeksDialog } from '@/components/vesolje/ForGeeksDialog'
import { IndexedTimeLapseView } from '@/components/vesolje/IndexedTimeLapseView'
import { ColorLegend } from '@/components/vesolje/ColorLegend'
import { getMonthlyForView, peakBy } from '@/lib/space/db'

export const metadata: Metadata = {
  title: 'Rastje — Logatec iz vesolja | 350logatec',
  description:
    'Kako gosto raste Logatec? Skozi vegetacijski indeks NDVI vidimo, kdaj se začnejo zeleneti gozdovi in polja in kdaj rast doseže vrhunec.',
}

export const revalidate = 60

export default async function RastjePage() {
  const history = await getMonthlyForView('ndvi')
  const frames = history.map((row) => ({
    publicUrl: row.public_url,
    capturedAt: row.captured_at,
    cloudCoverPct: row.cloud_cover_pct,
    metrics: row.metrics,
  }))

  if (frames.length === 0) {
    return (
      <VesoljeShell>
        <EmptyState />
      </VesoljeShell>
    )
  }

  const peakRow = peakBy(history, 'mean')
  const peakMean = peakRow?.metrics?.mean ?? null

  const forGeeks = (
    <ForGeeksDialog
      variant="overlay"
      title="Rastje · tehnično ozadje"
      description="Kako pridemo od svetlobe do zelene v sliki"
    >
      <p>
        <strong>NDVI = (B08 − B04) / (B08 + B04)</strong>
      </p>
      <p>Sentinel-2 ima 13 spektralnih pasov. Za vegetacijo uporabljamo dva:</p>
      <ul>
        <li>
          <strong>B04 (Red, 665 nm)</strong> — klorofil močno absorbira rdečo
          svetlobo, da napaja fotosintezo. Zato je z neba videti temna na
          zdravih rastlinah.
        </li>
        <li>
          <strong>B08 (NIR, 842 nm)</strong> — bližnjo infrardečo celična
          struktura listov močno odbija. Več plasti listja → več NIR → svetlejši
          signal.
        </li>
      </ul>
      <p>
        Razmerje med njima daje vrednost med −1 in +1. Vrednosti pod 0 pomenijo
        vodo, sneg ali oblake. Med 0 in 0.2 so gola tla in umetne površine.
        Med 0.2 in 0.4 redka vegetacija, nad 0.6 gozdovi in polja v polni rasti.
      </p>
      <p>
        Vir: <strong>Sentinel-2 L2A</strong> · Copernicus Data Space Ecosystem ·
        Sentinel Hub Process + Statistical API.
      </p>
    </ForGeeksDialog>
  )

  return (
    <VesoljeShell>
      <article className="container mx-auto px-4 py-5 md:py-6 max-w-6xl">
        <header className="mb-4 md:mb-5">
          <p className="text-xs uppercase tracking-widest text-emerald-600 font-semibold">
            350space · rastje
          </p>
          <h1 className="mt-1 font-display text-2xl md:text-3xl font-bold tracking-tight">
            Kako gosto <span className="text-gradient">raste Logatec</span>?
          </h1>
        </header>

        <IndexedTimeLapseView
          viewKind="ndvi"
          frames={frames}
          actions={forGeeks}
          peak={
            peakRow && peakMean !== null
              ? {
                  value: peakMean.toFixed(2),
                  capturedAt: peakRow.captured_at,
                  hintPrefix: 'Najgosteje:',
                  icon: 'TrendingUp',
                }
              : null
          }
        />

        <ColorLegend
          className="mt-4"
          caption="Kako brati barve"
          stops={[
            { color: '#33312e', label: 'voda / oblak' },
            { color: '#8a715a', label: 'gola tla' },
            { color: '#d9cc73', label: 'travniki' },
            { color: '#73bf4d', label: 'polja' },
            { color: '#0d6614', label: 'gozdovi' },
          ]}
        />

        <section className="mt-8 md:mt-10 rounded-2xl border bg-card p-6 md:p-8">
          <h2 className="font-display text-xl md:text-2xl font-semibold flex items-center gap-2">
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
              Premikaj se po časovni osi ali pritisni Predvajaj — opazuj, kako
              se občina »oblači« v zeleno spomladi in postopno »slači« jeseni.
            </p>
          </div>
        </section>

        <p className="mt-6 text-xs text-muted-foreground leading-relaxed">
          Contains modified Copernicus Sentinel data{' '}
          {frames[0].capturedAt.slice(0, 4)}–
          {frames[frames.length - 1].capturedAt.slice(0, 4)}. Vir: Copernicus
          Data Space Ecosystem · Sentinel Hub Process API.
        </p>
      </article>
    </VesoljeShell>
  )
}

function EmptyState() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-3xl text-center">
      <Sparkles className="mx-auto h-10 w-10 text-emerald-500" />
      <h1 className="mt-4 font-display text-3xl font-bold">
        Še nismo zbrali NDVI scen
      </h1>
      <p className="mt-3 text-muted-foreground">
        Pridobivanje podatkov je v teku. Vrni se čez nekaj minut.
      </p>
    </div>
  )
}
