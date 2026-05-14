import type { Metadata } from 'next'
import { Clock, Sparkles } from 'lucide-react'
import { VesoljeShell } from '@/components/vesolje/VesoljeShell'
import { ForGeeksDialog } from '@/components/vesolje/ForGeeksDialog'
import { TimeLapseViewer } from '@/components/vesolje/TimeLapseViewer'
import { getMonthlyForView } from '@/lib/space/db'

export const metadata: Metadata = {
  title: 'Časovni pregled · Logatec iz vesolja | 350logatec',
  description:
    'Logatec skozi leta v naravnih barvah. Premikaj se po časovni osi ali predvajaj animacijo in opazuj, kako se občina spreminja.',
}

export const revalidate = 3600

export default async function CasovniPregledPage() {
  const history = await getMonthlyForView('true_color')
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
        razmaku 180°, skupaj prehajata isto točko vsakih 5 dni. To
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

  return (
    <VesoljeShell>
      <article className="container mx-auto px-4 py-5 md:py-6 max-w-6xl">
        <TimeLapseViewer frames={frames} actions={forGeeks} />

        <section className="mt-8 md:mt-10 rounded-2xl border bg-card p-6 md:p-8">
          <h2 className="font-display text-xl md:text-2xl font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-emerald-600" />
            Kaj prikazuje časovni pregled
          </h2>
          <div className="mt-3 space-y-3 text-base text-muted-foreground leading-relaxed">
            <p>
              Vsak prikaz je mesečni mozaik Logatca, sestavljen iz najboljših
              satelitskih posnetkov v izbranem mesecu. Sentinel-2 občino
              večkrat preleti, sistem pa iz teh prehodov izbere najčistejše
              dele, kjer je čim manj oblakov in meglice.
            </p>
            <p>
              Ko predvajaš časovni pregled, lahko vidiš, kako se občina
              spreminja skozi leto. Spomladi ozelenijo gozdovi in polja, poleti
              je rastje najgostejše, jeseni barve počasi bledijo, pozimi pa se
              pojavijo sneg, mokra tla in poplavljena območja.
            </p>
            <p>
              Ker imamo večletni arhiv, lahko primerjamo tudi razlike med
              sezonami. Nekatera leta prej ozelenijo, druga imajo več snega
              ali daljša mokra obdobja. To je preprost pogled iz vesolja na
              lokalne spremembe, ki jih s tal pogosto težko opazimo.
            </p>
          </div>
        </section>

        <div className="mt-6 space-y-2 text-xs text-muted-foreground leading-relaxed">
          <p>
            Vsebuje obdelane podatke misije Copernicus Sentinel-2 za obdobje{' '}
            {firstYear}
            {firstYear !== lastYear ? `–${lastYear}` : ''}. Vizualizacije so
            samodejno ustvarjene za območje Logatca, Hotedršice in Planinskega
            polja. Na prikaz lahko vplivajo oblaki, megla, sence in
            razpoložljivost satelitskih posnetkov.
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
