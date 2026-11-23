import type { Metadata } from 'next'
import { Waves, Sparkles, Radar, TrendingUp } from 'lucide-react'
import { VesoljeShell } from '@/components/vesolje/VesoljeShell'
import { ForGeeksDialog } from '@/components/vesolje/ForGeeksDialog'
import { TimeLapseViewer } from '@/components/vesolje/TimeLapseViewer'
import { ColorLegend } from '@/components/vesolje/ColorLegend'
import { RadarFloodViewer } from '@/components/vesolje/RadarFloodViewer'
import { MetricCard } from '@/components/vesolje/MetricCard'
import { getMonthlyForView, getRadarFloodHistory } from '@/lib/space/db'
import { formatKm2 } from '@/lib/space/describe'

export const metadata: Metadata = {
  title: 'Planinsko polje · Logatec iz vesolja | 350logatec',
  description:
    'Kdaj Planinsko polje poplavi? Z radarskimi posnetki iz vesolja spremljamo poplavo skoraj vsak dan, tudi skozi oblake, z mesečnimi posnetki pa, kako se kraško polje čez leto polni in prazni.',
}

export const revalidate = 3600

export default async function PlaninskoPoljePage() {
  const [history, radar] = await Promise.all([
    getMonthlyForView('ndwi'),
    getRadarFloodHistory(),
  ])
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

  if (frames.length === 0 && radar.length === 0) {
    return (
      <VesoljeShell>
        <EmptyState />
      </VesoljeShell>
    )
  }

  const firstYear = frames[0]?.capturedAt.slice(0, 4)
  const lastYear = frames[frames.length - 1]?.capturedAt.slice(0, 4)
  const yearRange = firstYear === lastYear ? firstYear : `${firstYear}–${lastYear}`

  const radarFrames = radar.map((r) => ({
    publicUrl: r.public_url,
    capturedAt: r.captured_at,
    waterKm2: r.water_km2,
  }))
  const radarPeak = radar.reduce<(typeof radar)[number] | null>(
    (best, r) => (!best || r.water_km2 > best.water_km2 ? r : best),
    null,
  )
  const radarFirstYear = radar[0]?.captured_at.slice(0, 4)

  const radarForGeeks = (
    <ForGeeksDialog
      variant="overlay"
      title="Radarski pogled · tehnično ozadje"
      description="Kako radar vidi vodo skozi oblake"
    >
      <p>
        <strong>Sentinel-1 GRD, IW, VV polarizacija</strong>
      </p>
      <p>
        Sentinel-1 je radar s sintetično odprtino (SAR) v pasu C. Sam
        oddaja mikrovalove, zato ne potrebuje sonca in vidi skozi oblake.
        Mirna vodna gladina deluje kot ogledalo: signal se odbije stran od
        satelita, zato voda na posnetku vrne zelo malo. Piksel štejemo za
        vodo, ko je povratni signal <em>γ⁰ VV</em> nižji od{' '}
        <strong>−16,5 dB</strong>.
      </p>
      <ul>
        <li>
          <strong>Obdelava</strong>: terenska korekcija γ⁰ (Copernicus DEM),
          ortorektifikacija, Leejev filter šuma 5×5.
        </li>
        <li>
          <strong>Podlaga</strong>: posvetljen posnetek Sentinel-2 L2A z dne
          26. 10. 2026, enak pod vsemi dnevi, da se premika samo modra.
        </li>
        <li>
          <strong>km²</strong>: število vodnih pikslov × površina piksla
          (~10 × 10 m) v okvirju 14,19–14,33° V, 45,80–45,89° S. Okoli
          0,3 km² je vedno »voda«: Unica in nekaj ribnikov.
        </li>
        <li>
          Poplavljen gozd ob strugi radar vidi kot kopno, ker se signal od
          vode odbije v debla in nazaj. Zato ostanejo vijuge Unice rjave.
        </li>
      </ul>
      <p>
        Vir: <strong>Sentinel-1 GRD</strong> in <strong>Sentinel-2 L2A</strong>{' '}
        · Copernicus Data Space Ecosystem · Sentinel Hub Process API.
      </p>
    </ForGeeksDialog>
  )

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
        {radarFrames.length > 0 ? (
          <section className="mb-10 md:mb-12">
            <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Radar className="h-6 w-6 text-blue-600" />
              Poplava dan za dnem
            </h1>
            <p className="mt-2 mb-4 text-base text-muted-foreground leading-relaxed max-w-3xl">
              Radarski satelit vidi skozi oblake in ponoči, zato lahko
              Planinsko polje spremljamo skoraj vsak dan. Modro je voda.
            </p>
            <div
              className={
                radarPeak
                  ? 'grid gap-4 md:gap-6 md:grid-cols-[minmax(0,1fr)_minmax(220px,280px)]'
                  : undefined
              }
            >
              <RadarFloodViewer frames={radarFrames} actions={radarForGeeks} />
              {radarPeak ? (
                <div className="md:self-start">
                  <MetricCard
                    label="Največ vode"
                    value={formatKm2(radarPeak.water_km2)}
                    unit="km²"
                    hint={new Date(radarPeak.captured_at).toLocaleDateString('sl-SI', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      timeZone: 'Europe/Ljubljana',
                    })}
                    icon={TrendingUp}
                    accent="blue"
                  />
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {frames.length > 0 ? (
          <>
        {radarFrames.length > 0 ? (
          <h2 className="font-display text-xl md:text-2xl font-semibold mb-1">
            Kako se polje polni čez leto
          </h2>
        ) : null}
        {radarFrames.length > 0 ? (
          <p className="mb-4 text-base text-muted-foreground leading-relaxed max-w-3xl">
            En jasen posnetek na mesec, ko je bila na polju voda.
          </p>
        ) : null}
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
          </>
        ) : null}

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
              Radarski pogled na vrhu pokaže stanje skoraj vsak dan, tudi ko
              je nad Logatcem oblačno, številka ob sliki pa pove, koliko
              kvadratnih kilometrov je pod vodo. Mesečni pogled spodaj je iz
              običajnih fotografij iz vesolja in pokaže, kako se voda čez
              leto širi, zadržuje in nato postopoma umika.
            </p>
          </div>
        </section>

        <div className="mt-6 space-y-2 text-xs text-muted-foreground leading-relaxed">
          <p>
            Vsebuje obdelane podatke misij Copernicus Sentinel-1
            {radarFirstYear ? ` (od ${radarFirstYear})` : ''} in Sentinel-2
            {yearRange ? ` za obdobje ${yearRange}` : ''}. Vizualizacije so samodejno ustvarjene za območje
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
