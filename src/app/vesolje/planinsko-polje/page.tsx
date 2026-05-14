import type { Metadata } from 'next'
import { Waves, Sparkles } from 'lucide-react'
import { VesoljeShell } from '@/components/vesolje/VesoljeShell'
import { ForGeeksDialog } from '@/components/vesolje/ForGeeksDialog'
import { TimeLapseViewer } from '@/components/vesolje/TimeLapseViewer'
import { ColorLegend } from '@/components/vesolje/ColorLegend'
import { getMonthlyForView } from '@/lib/space/db'

export const metadata: Metadata = {
  title: 'Planinsko polje · Logatec iz vesolja | 350logatec',
  description:
    'Kdaj Planinsko polje poplavi? Skozi vodni indeks MNDWI vidimo, kako se karstno polje južno od Logatca čez leto polni in prazni.',
}

export const revalidate = 3600

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

  const firstYear = frames[0].capturedAt.slice(0, 4)
  const lastYear = frames[frames.length - 1].capturedAt.slice(0, 4)
  const yearRange = firstYear === lastYear ? firstYear : `${firstYear}–${lastYear}`

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
        kovinske strehe pa ne, tako se odpravi večina urbanih lažnih
        pozitivov.
      </p>
      <ul>
        <li>
          <strong>B03 (Green, 560 nm)</strong>: voda zmerno odbija zeleno.
        </li>
        <li>
          <strong>B11 (SWIR, 1610 nm)</strong>: voda absorbira to bližnjo
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
        <TimeLapseViewer frames={frames} actions={forGeeks} />

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
          površino.
        </p>

        <section className="mt-8 md:mt-10 rounded-2xl border bg-card p-6 md:p-8">
          <h2 className="font-display text-xl md:text-2xl font-semibold flex items-center gap-2">
            <Waves className="h-5 w-5 text-blue-600" />
            Kaj prikazuje Planinsko polje
          </h2>
          <div className="mt-3 space-y-3 text-base text-muted-foreground leading-relaxed">
            <p>
              Planinsko polje je kraško polje, velika ravnica brez stalnega
              površinskega odtoka. Voda priteče iz izvirov in podzemnih
              kraških poti, nato pa počasi izginja skozi požiralnike. Ko je
              vode več, kot je požiralniki lahko sproti odvedejo, se polje
              začne polniti.
            </p>
            <p>
              Pozimi in zgodaj spomladi se Planinsko polje pogosto spremeni v
              plitvo jezero. Voda lahko tam ostane več tednov ali mesecev,
              odvisno od padavin, snega, podtalnice in hitrosti odtekanja v
              podzemlje. Poleti je polje običajno suho in ponovno postane
              travnata ravnica.
            </p>
            <p>
              Ta pogled pokaže, kateri deli polja so bili v izbranem mesecu
              pod vodo. Modra barva označuje vodno površino, svetlejši toni
              pa bolj mokra ali močvirna območja. S predvajanjem lahko
              spremljaš, kako se voda širi, zadržuje in nato postopoma umika.
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
