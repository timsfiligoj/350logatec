import type { Metadata } from 'next'
import { Clock, Sparkles } from 'lucide-react'
import { VesoljeShell } from '@/components/vesolje/VesoljeShell'
import { ForGeeksDialog } from '@/components/vesolje/ForGeeksDialog'
import { TimeLapseViewer } from '@/components/vesolje/TimeLapseViewer'
import { getHistoryForView } from '@/lib/space/db'

export const metadata: Metadata = {
  title: 'Časovni pregled — Logatec iz vesolja | 350logatec',
  description:
    'Logatec skozi leta v naravnih barvah. Premikaj se po časovni osi ali predvajaj animacijo in opazuj, kako se občina spreminja.',
}

export const revalidate = 3600

export default async function CasovniPregledPage() {
  const history = await getHistoryForView('true_color')
  const frames = history.map((row) => ({
    publicUrl: row.public_url,
    capturedAt: row.captured_at,
    cloudCoverPct: row.cloud_cover_pct,
  }))

  if (frames.length === 0) {
    return (
      <VesoljeShell>
        <div className="container mx-auto px-4 py-20 max-w-3xl text-center">
          <Sparkles className="mx-auto h-10 w-10 text-emerald-500" />
          <h1 className="mt-4 font-display text-3xl font-bold">
            Še nismo zbrali nobene scene
          </h1>
          <p className="mt-3 text-muted-foreground">
            Pridobivanje podatkov je v teku. Vrni se čez nekaj minut.
          </p>
        </div>
      </VesoljeShell>
    )
  }

  const forGeeks = (
    <ForGeeksDialog
      variant="overlay"
      title="Časovni pregled · tehnično ozadje"
      description="Kako sestavimo letno animacijo"
    >
      <p>
        Vsaka sličica je mesečni mozaik <strong>Sentinel-2 L2A</strong>{' '}
        true-color kompozita iz pasov B04 (rdeča), B03 (zelena) in B02
        (modra). Za vsak koledarski mesec poiščemo katalog scen z manj kot
        20 % oblačnosti in izberemo najčistejšo. Sentinel Hub Process API
        nato za vsak piksel mozaika izbere najboljši vir iz 10-dnevnega
        okna okoli izbrane scene (»leastCC« strategija), tako da
        tile-boundaries med prehodi izginejo.
      </p>
      <p>
        Po renderiranju shranimo PNG (2100 × 1780 px pri 10 m/piksel) v
        Supabase Storage in vpišemo vrstico v tabelo <code>
          space_acquisitions
        </code>. Časovni pregled bere iz te tabele in animira sliko po
        sličici.
      </p>
      <ul>
        <li>
          <strong>Hitrost animacije</strong>: 1 sličica vsakih 0.9 sekunde.
        </li>
        <li>
          <strong>Manjkajoči meseci</strong>: če v določenem mesecu ni
          scene s sprejemljivo oblačnostjo, ga drsnik preprosto preskoči.
        </li>
        <li>
          <strong>Resolucija</strong>: 10 m/piksel je nativna razdalja
          Sentinel-2 vidnih pasov; vsak piksel pokriva 10 × 10 m terena.
        </li>
      </ul>
      <p>
        Sentinel-2 misija šteje dva satelita (S2A in S2B), ki krožita v
        razmaku 180° — skupaj prehajata isto točko vsakih 5 dni. To
        omogoča gosto časovno serijo, ki je javno odprta vsem evropskim
        državljanom kot del programa <strong>Copernicus</strong>.
      </p>
      <p>
        Vir: <strong>Sentinel-2 L2A</strong> · Copernicus Data Space
        Ecosystem · Sentinel Hub Process API.
      </p>
    </ForGeeksDialog>
  )

  const firstYear = frames[0].capturedAt.slice(0, 4)
  const lastYear = frames[frames.length - 1].capturedAt.slice(0, 4)
  const yearLabel = firstYear === lastYear ? firstYear : `${firstYear}–${lastYear}`

  return (
    <VesoljeShell>
      <article className="container mx-auto px-4 py-5 md:py-6 max-w-6xl">
        <header className="mb-4 md:mb-5">
          <p className="text-xs uppercase tracking-widest text-emerald-600 font-semibold">
            350space · časovni pregled
          </p>
          <h1 className="mt-1 font-display text-2xl md:text-3xl font-bold tracking-tight">
            Logatec skozi <span className="text-gradient">{yearLabel}</span>
          </h1>
        </header>

        <TimeLapseViewer frames={frames} actions={forGeeks} />

        <section className="mt-8 md:mt-10 rounded-2xl border bg-card p-6 md:p-8">
          <h2 className="font-display text-xl md:text-2xl font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-emerald-600" />
            Kaj gledaš
          </h2>
          <div className="mt-3 space-y-3 text-base text-muted-foreground leading-relaxed">
            <p>
              Vsaka slika je <strong>mesečni mozaik</strong>, sestavljen iz
              najčistejših prehodov satelita v tistem mesecu. Brez oblakov,
              brez senc — kot bi gledali občino z orbitalne postaje na
              jasnem dnevu.
            </p>
            <p>
              Med predvajanjem opaziš, kako se zelena barva premika čez
              leto: spomladi začnejo polja in gozdovi zeleneti, poleti so v
              polni rasti, jeseni se prebarvajo, pozimi se pojavlja sneg
              na hribih. Industrijska cona ostaja prepoznavna skozi vse
              leto, polja se spreminjajo glede na poljedelske cikle.
            </p>
            <p>
              S petletnim arhivom lahko primerjamo, ali se sezone začenjajo
              prej ali kasneje kot v preteklosti — neposredni vesoljski
              signal lokalne klime.
            </p>
          </div>
        </section>

        <p className="mt-6 text-xs text-muted-foreground leading-relaxed">
          Contains modified Copernicus Sentinel data {firstYear}
          {firstYear !== lastYear ? `–${lastYear}` : ''}. Vir: Copernicus
          Data Space Ecosystem · Sentinel Hub Process API. Vse vizualizacije
          so generirane samodejno mesečno za območje Logatec + Hotedršica +
          Planinsko polje.
        </p>
      </article>
    </VesoljeShell>
  )
}
