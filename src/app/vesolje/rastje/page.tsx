import type { Metadata } from 'next'
import { Sprout, Sparkles } from 'lucide-react'
import { VesoljeShell } from '@/components/vesolje/VesoljeShell'
import { ForGeeksDialog } from '@/components/vesolje/ForGeeksDialog'
import { IndexedTimeLapseView } from '@/components/vesolje/IndexedTimeLapseView'
import { ColorLegend } from '@/components/vesolje/ColorLegend'
import { getMonthlyForView, peakBy } from '@/lib/space/db'

export const metadata: Metadata = {
  title: 'Rastje · Logatec iz vesolja | 350logatec',
  description:
    'Kako gosto raste Logatec? Skozi vegetacijski indeks NDVI vidimo, kdaj se začnejo zeleneti gozdovi in polja in kdaj rast doseže vrhunec.',
}

export const revalidate = 3600

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

  const firstYear = frames[0].capturedAt.slice(0, 4)
  const lastYear = frames[frames.length - 1].capturedAt.slice(0, 4)
  const yearRange = firstYear === lastYear ? firstYear : `${firstYear}–${lastYear}`

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
          <strong>B04 (Red, 665 nm)</strong>: klorofil močno absorbira rdečo
          svetlobo, da napaja fotosintezo. Zato je z neba videti temna na
          zdravih rastlinah.
        </li>
        <li>
          <strong>B08 (NIR, 842 nm)</strong>: bližnjo infrardečo celična
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
        <IndexedTimeLapseView
          viewKind="ndvi"
          frames={frames}
          actions={forGeeks}
          peak={
            peakRow && peakMean !== null
              ? {
                  value: peakMean.toFixed(2),
                  capturedAt: peakRow.captured_at,
                  title: 'Najgostejše rastje',
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
            Kaj prikazuje rastje
          </h2>
          <div className="mt-3 space-y-3 text-base text-muted-foreground leading-relaxed">
            <p>
              To ni navadna fotografija. Ta pogled pokaže, kje je rastje
              najbolj aktivno. Satelit Sentinel-2 meri, koliko rdeče svetlobe
              rastline vpijejo in koliko bližnje infrardeče svetlobe odbijejo
              nazaj. Zdrave rastline to počnejo zelo izrazito, zato jih lahko
              satelit dobro prepozna.
            </p>
            <p>
              Iz teh meritev nastane NDVI, preprost indeks zelenja. Višja
              vrednost pomeni več aktivnega rastja. Nižja vrednost običajno
              pomeni gola tla, pozidane površine, vodo, oblake ali območja z
              manj vegetacije.
            </p>
            <p>
              Na sliki so temno zeleni deli območja z najmočnejšim rastjem,
              predvsem gozdovi in polja v polni rasti. Svetlejše zelene
              površine so pogosto travniki, pašniki, mlajše rastje ali
              nedavno pokošeni deli. Rjavkasti in sivi toni pomenijo manj
              rastja, gola tla, ceste, naselja ali območja, kjer rastje v
              tistem trenutku ni aktivno.
            </p>
            <p>
              Ko predvajaš časovni pregled, lahko vidiš, kako se občina skozi
              leto »obleče« v zeleno. Spomladi rastje hitro naraste, poleti
              doseže vrh, jeseni pa se vrednosti postopoma znižujejo.
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
