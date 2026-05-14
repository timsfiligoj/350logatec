import type { Metadata } from 'next'
import { Mountain, Sparkles } from 'lucide-react'
import { VesoljeShell } from '@/components/vesolje/VesoljeShell'
import { ForGeeksDialog } from '@/components/vesolje/ForGeeksDialog'
import { IndexedTimeLapseView } from '@/components/vesolje/IndexedTimeLapseView'
import { ColorLegend } from '@/components/vesolje/ColorLegend'
import { getMonthlyForView, peakBy } from '@/lib/space/db'

export const metadata: Metadata = {
  title: 'Sneg · Logatec iz vesolja | 350logatec',
  description:
    'Kako dolga je snežna sezona nad Logatcem? Skozi snežni indeks NDSI vidimo, kdaj sneg prekrije občino in kako dolgo se obdrži.',
}

export const revalidate = 3600

export default async function SnegPage() {
  const history = await getMonthlyForView('ndsi')
  // Only show months where there was measurable snow on the ground.
  // Snow-free months are visually identical and bury the actual seasonal
  // story.
  const snowyMonths = history.filter(
    (row) => (row.metrics?.snow_pct ?? 0) > 0,
  )
  const frames = snowyMonths.map((row) => ({
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

  // Peak is always taken from the full history (which includes 0 % snow
  // months) so the "vrh" label is the absolute deepest winter.
  const peakRow = peakBy(history, 'snow_pct')
  const peakPct = peakRow?.metrics?.snow_pct ?? null

  const firstYear = frames[0].capturedAt.slice(0, 4)
  const lastYear = frames[frames.length - 1].capturedAt.slice(0, 4)
  const yearRange = firstYear === lastYear ? firstYear : `${firstYear}–${lastYear}`

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
        Normalised Difference Snow Index (Dozier, 1989) izkorišča, da sneg močno
        odbija zeleno svetlobo, a hkrati absorbira bližnjo kratkovalovno
        infrardečo (SWIR). NASA-priporočen prag za »piksel je sneg« je{' '}
        <strong>NDSI ≥ 0.4</strong>.
      </p>
      <ul>
        <li>
          <strong>B03 (Green, 560 nm)</strong>: sveži sneg je skoraj bel, močno
          odbija vso vidno svetlobo.
        </li>
        <li>
          <strong>B11 (SWIR, 1610 nm)</strong>: sneg in led to dolgovalovno
          infrardečo absorbirata, oblaki (ki sicer odbijajo zeleno) pa ne, zato
          razločimo sneg od oblačnosti.
        </li>
      </ul>
      <p>
        Za snežne scene zviša prag dovoljene oblačnosti na 60 % (slovenske zime
        so pogosto pod oblaki, z 20 % filtrom bi izgubili polovico zimske
        sezone). Sentinel Hub leastCC mozaikalnik kljub temu sestavi najčistejše
        piksle iz 10-dnevnega okna.
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
        <IndexedTimeLapseView
          viewKind="ndsi"
          frames={frames}
          actions={forGeeks}
          peak={
            peakRow && peakPct !== null
              ? {
                  value: peakPct.toFixed(1),
                  unit: '%',
                  capturedAt: peakRow.captured_at,
                  title: 'Najmočnejša zima',
                  icon: 'Mountain',
                }
              : null
          }
        />

        <ColorLegend
          className="mt-4"
          caption="Kako brati barve"
          stops={[
            { color: '#2e2e2e', label: 'vegetacija' },
            { color: '#8c8c8c', label: 'gola tla' },
            { color: '#80bff2', label: 'rob taljenja' },
            { color: '#ffffff', label: 'sneg' },
          ]}
        />

        <p className="mt-3 text-xs text-muted-foreground">
          Drsnik prikazuje samo mesece z opazno snežno pokritostjo.
        </p>

        <section className="mt-8 md:mt-10 rounded-2xl border bg-card p-6 md:p-8">
          <h2 className="font-display text-xl md:text-2xl font-semibold flex items-center gap-2">
            <Mountain className="h-5 w-5 text-slate-600" />
            Kaj prikazuje sneg
          </h2>
          <div className="mt-3 space-y-3 text-base text-muted-foreground leading-relaxed">
            <p>
              Ta pogled pokaže, kateri deli občine so bili v izbranem mesecu
              pokriti s snegom. Satelit Sentinel-2 sneg prepozna drugače kot
              navadna kamera: meri odboj različnih vrst svetlobe in tako
              lažje loči sneg od gozdov, mokrih tal, oblakov in naselij.
            </p>
            <p>
              Svetlomodro-bele površine označujejo območja, kjer je bil
              zaznan sneg. Sivi toni prikazujejo predele brez jasne snežne
              odeje, temnejši deli pa so večinoma gozdovi, naselja, sence
              ali mokra tla. Pri robovih snega je prikaz lahko mehkejši, ker
              se tam pogosto mešajo sneg, vlaga, vegetacija in senca.
            </p>
            <p>
              V toplejših mesecih je prikaz večinoma siv, ker snega ni.
              Pozimi se najprej pobelijo višje lege in okoliški hribi, ob
              močnejšem sneženju pa tudi dolina. S predvajanjem lahko
              spremljaš, kdaj se snežna sezona začne, kako dolgo traja in
              kako hitro se sneg umika.
            </p>
          </div>
        </section>

        <div className="mt-6 space-y-2 text-xs text-muted-foreground leading-relaxed">
          <p>
            Vsebuje obdelane podatke misije Copernicus Sentinel-2 za obdobje{' '}
            {yearRange}. Vizualizacije so samodejno ustvarjene za območje
            Logatca, Hotedršice in Planinskega polja. Na prikaz lahko vplivajo
            oblaki, megla, sence in razpoložljivost satelitskih posnetkov.
          </p>
          <p>
            Vir: Copernicus Data Space Ecosystem, Sentinel Hub Process API,
            350logatec obdelava podatkov.
          </p>
        </div>
      </article>
    </VesoljeShell>
  )
}

function EmptyState() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-3xl text-center">
      <Sparkles className="mx-auto h-10 w-10 text-slate-500" />
      <h1 className="mt-4 font-display text-3xl font-bold">
        Še nismo zbrali NDSI scen
      </h1>
      <p className="mt-3 text-muted-foreground">
        Pridobivanje podatkov je v teku. Vrni se čez nekaj minut.
      </p>
    </div>
  )
}
