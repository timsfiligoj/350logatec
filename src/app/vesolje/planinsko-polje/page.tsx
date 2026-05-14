import type { Metadata } from 'next'
import { Waves, Sparkles } from 'lucide-react'
import { VesoljeShell } from '@/components/vesolje/VesoljeShell'
import { ForGeeksDialog } from '@/components/vesolje/ForGeeksDialog'
import { IndexedTimeLapseView } from '@/components/vesolje/IndexedTimeLapseView'
import { ColorLegend } from '@/components/vesolje/ColorLegend'
import { getMonthlyForView, peakBy } from '@/lib/space/db'

export const metadata: Metadata = {
  title: 'Planinsko polje — Logatec iz vesolja | 350logatec',
  description:
    'Kdaj Planinsko polje poplavi? Skozi vodni indeks MNDWI vidimo, kako se karstno polje južno od Logatca čez leto polni in prazni.',
}

export const revalidate = 60

export default async function PlaninskoPoljePage() {
  const history = await getMonthlyForView('ndwi')
  // Only show months where Planinsko polje actually had water — months
  // with 0 % polje surface flooded are visually redundant on the slider.
  const floodMonths = history.filter(
    (row) => (row.metrics?.polje_water_pct ?? 0) > 0,
  )
  const frames = floodMonths.map((row) => ({
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

  // Peak is always taken from the full history, so the "vrh" label is
  // honest even when the slider is filtered.
  const peakRow = peakBy(history, 'polje_water_pct')
  const peakPct = peakRow?.metrics?.polje_water_pct ?? null

  const forGeeks = (
    <ForGeeksDialog
      variant="overlay"
      title="Planinsko polje · tehnično ozadje"
      description="Kako prepoznamo vodo z neba"
    >
      <p>
        <strong>MNDWI = (B03 − B11) / (B03 + B11)</strong>
      </p>
      <p>
        Modified Normalized Difference Water Index (Xu, 2006) uporabljamo
        namesto klasičnega NDWI, ker je v Logatcu industrijska cona s svetlimi
        »cool roof« strehami, ki klasični NDWI = (B03 − B08) lažno klasificira
        kot vodo (visok green + visok NIR pri kovinskih prevlekah). MNDWI
        zamenja NIR z SWIR (B11): voda absorbira SWIR skoraj popolnoma,
        kovinske strehe pa ne — tako se odpravi večina urbanih lažnih
        pozitivov.
      </p>
      <ul>
        <li>
          <strong>B03 (Green, 560 nm)</strong> — voda zmerno odbija zeleno.
        </li>
        <li>
          <strong>B11 (SWIR, 1610 nm)</strong> — voda absorbira to bližnjo
          kratkovalovno infrardečo skoraj v celoti.
        </li>
      </ul>
      <p>
        Dodatno modro barvo v vizualizaciji omejimo na piksle, ki jih Sen2Cor
        klasifikator označi kot razred 6 = WATER. To dvojno zaščito pred
        lažnimi pozitivi obdrži modre samo prave vodne površine.
      </p>
      <p>
        Metriko <em>% polja pod vodo</em> računamo nad ožjim sub-okvirjem
        Planinskega polja (~7×4 km, samo občinska meja polja brez Logatca).
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
          <p className="text-xs uppercase tracking-widest text-blue-600 font-semibold">
            350space · planinsko polje
          </p>
          <h1 className="mt-1 font-display text-2xl md:text-3xl font-bold tracking-tight">
            Kdaj{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500">
              Planinsko polje
            </span>{' '}
            poplavi?
          </h1>
        </header>

        <IndexedTimeLapseView
          viewKind="ndwi"
          frames={frames}
          actions={forGeeks}
          peak={
            peakRow && peakPct !== null
              ? {
                  value: peakPct.toFixed(1),
                  unit: '%',
                  capturedAt: peakRow.captured_at,
                  hintPrefix: 'Najvišji vodostaj:',
                  icon: 'Waves',
                }
              : null
          }
        />

        <ColorLegend
          className="mt-4"
          caption="Kako brati barve"
          stops={[
            { color: '#a3683f', label: 'suho' },
            { color: '#d8b48c', label: 'močvirno' },
            { color: '#a3c1d6', label: 'plitva voda' },
            { color: '#1e4d8c', label: 'globlja voda' },
          ]}
        />

        <p className="mt-3 text-xs text-muted-foreground">
          Drsnik prikazuje samo mesece, ko je polje imelo opazno vodno
          površino. Mesece brez poplavljanja smo izpustili.
        </p>

        <section className="mt-8 md:mt-10 rounded-2xl border bg-card p-6 md:p-8">
          <h2 className="font-display text-xl md:text-2xl font-semibold flex items-center gap-2">
            <Waves className="h-5 w-5 text-blue-600" />
            Kaj gledaš
          </h2>
          <div className="mt-3 space-y-3 text-base text-muted-foreground leading-relaxed">
            <p>
              Planinsko polje je <strong>karstno polje</strong> — velika
              ravnina, ki nima površinskega odtoka. Voda priteče iz ponikalnic
              in podzemnih izvirov in ponovno izgine v kraška požiralnika. Nivo
              je odvisen od podtalnice.
            </p>
            <p>
              <strong>Pozimi in zgodaj spomladi</strong> se nivo dvigne, polje
              se napolni in postane plitvo jezero, ki traja tedne ali mesece.{' '}
              <strong>Poleti</strong> je polje suho, raste trava in se kosi.
            </p>
            <p>
              Predvajaj časovno os in opazuj, kako se modra površina iz mesta v
              mesec spreminja — to je sezonski ritem kraške hidrologije, neposredno
              z neba.
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
      <Sparkles className="mx-auto h-10 w-10 text-blue-500" />
      <h1 className="mt-4 font-display text-3xl font-bold">
        Še nismo zbrali NDWI scen
      </h1>
      <p className="mt-3 text-muted-foreground">
        Pridobivanje podatkov je v teku. Vrni se čez nekaj minut.
      </p>
    </div>
  )
}
