import type { Metadata } from 'next'
import { Droplet, Waves, Sparkles } from 'lucide-react'
import { VesoljeShell } from '@/components/vesolje/VesoljeShell'
import { ViewHero } from '@/components/vesolje/ViewHero'
import { MetricCard } from '@/components/vesolje/MetricCard'
import { ForGeeksDialog } from '@/components/vesolje/ForGeeksDialog'
import { getHistoryForView, getLatestForView, peakBy } from '@/lib/space/db'

export const metadata: Metadata = {
  title: 'Planinsko polje — Logatec iz vesolja | 350logatec',
  description:
    'Kdaj Planinsko polje poplavi? Skozi vodni indeks MNDWI vidimo, kako se karstno polje južno od Logatca čez leto polni in prazni.',
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

function describeWater(pct: number): string {
  if (pct >= 30) return 'velika poplava'
  if (pct >= 10) return 'opazna poplava'
  if (pct >= 3) return 'rob polja namočen'
  if (pct >= 0.5) return 'rečice nad bregovi'
  return 'polje suho'
}

function siMonthYear(iso: string): string {
  return `${SI_MONTH_NAMES[Number(iso.slice(5, 7)) - 1]} ${iso.slice(0, 4)}`
}

export default async function PlaninskoPoljePage() {
  const [latest, history] = await Promise.all([
    getLatestForView('ndwi'),
    getHistoryForView('ndwi'),
  ])

  if (!latest) {
    return (
      <VesoljeShell>
        <EmptyState />
      </VesoljeShell>
    )
  }

  const peak = peakBy(history, 'polje_water_pct')
  const latestWaterPct = latest.metrics?.polje_water_pct ?? null
  const peakWaterPct = peak?.metrics?.polje_water_pct ?? null

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
        namesto klasičnega NDWI, ker je v Logatcu industrijska cona s
        svetlimi »cool roof« strehami, ki klasični NDWI = (B03 − B08) lažno
        klasificira kot vodo (visok green + visok NIR pri kovinskih
        prevlekah). MNDWI zamenja NIR z SWIR (B11): voda absorbira SWIR
        skoraj popolnoma, kovinske strehe pa ne — tako se odpravi večina
        urbanih lažnih pozitivov.
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
        Dodatno modro barvo v vizualizaciji omejimo na piksle, ki jih
        Sen2Cor klasifikator označi kot razred 6 = WATER. To dvojno
        zaščito pred lažnimi pozitivi obdrži modre samo prave vodne
        površine.
      </p>
      <p>
        Metriko <em>% polja pod vodo</em> računamo nad ožjim sub-okvirjem
        Planinskega polja (~7×4 km, samo občinska meja polja brez
        Logatca), tako da rečice in jezerca v dolini Logaščice ne
        zamegljujejo poplavne zgodbe.
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
          <p className="text-xs uppercase tracking-widest text-blue-600 font-semibold">
            350space · planinsko polje
          </p>
          <h1 className="mt-1 font-display text-2xl md:text-3xl font-bold tracking-tight">
            Kdaj <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500">Planinsko polje</span> poplavi?
          </h1>
          <p className="mt-1.5 text-sm md:text-base text-muted-foreground max-w-2xl">
            Karstno polje južno od Logatca skozi leto: kdaj voda pride iz
            podzemnih izvirov, kako se razlije, in kdaj se umakne.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] md:gap-6">
          <ViewHero
            acquisition={latest}
            alt={`MNDWI prikaz Planinskega polja, ${latest.captured_at.slice(0, 10)}`}
            actions={forGeeks}
            className="max-h-[58vh] md:max-h-[68vh]"
          />

          <div className="flex flex-col gap-4">
            {latestWaterPct !== null ? (
              <MetricCard
                label={`Najnovejša scena · ${siMonthYear(latest.captured_at)}`}
                value={`${latestWaterPct.toFixed(1)}`}
                unit="%"
                hint={`Pod vodo — ${describeWater(latestWaterPct)}`}
                icon={Droplet}
                accent="blue"
              />
            ) : null}
            {peak && peakWaterPct !== null ? (
              <MetricCard
                label="Največja poplava v podatkih"
                value={`${peakWaterPct.toFixed(1)}`}
                unit="%"
                hint={`Najvišji vodostaj: ${siMonthYear(peak.captured_at)}`}
                icon={Waves}
                accent="blue"
              />
            ) : null}
          </div>
        </div>

        <section className="mt-8 md:mt-10 rounded-2xl border bg-card p-6 md:p-8">
          <h2 className="font-display text-xl md:text-2xl font-semibold flex items-center gap-2">
            <Waves className="h-5 w-5 text-blue-600" />
            Kaj gledaš
          </h2>
          <div className="mt-3 space-y-3 text-base text-muted-foreground leading-relaxed">
            <p>
              Planinsko polje je <strong>karstno polje</strong> — velika
              ravnina, ki nima površinskega odtoka. Voda priteče iz
              ponikalnic in podzemnih izvirov in ponovno izgine v
              kraška požiralnika. Nivo je odvisen od podtalnice.
            </p>
            <p>
              <strong>Pozimi in zgodaj spomladi</strong> se nivo dvigne,
              polje se napolni in postane plitvo jezero, ki traja tedne ali
              mesece. <strong>Poleti</strong> je polje suho, raste trava in
              se kosi.
            </p>
            <p>
              Slika prikazuje vodo z <strong>modro</strong> barvo, suho zemljo
              z <strong>tan</strong>/peščeno-rjavo. Modra je prisotna samo
              tam, kjer satelitski klasifikator dejansko zazna vodno
              površino, ne na svetlih industrijskih strehah severno od
              Logatca, ki bi sicer zmedle preprost vodni indeks.
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
      <Sparkles className="mx-auto h-10 w-10 text-blue-500" />
      <h1 className="mt-4 font-display text-3xl font-bold">
        Še nismo zbrali NDWI scene
      </h1>
      <p className="mt-3 text-muted-foreground">
        Pridobivanje podatkov je v teku. Vrni se čez nekaj minut.
      </p>
    </div>
  )
}
