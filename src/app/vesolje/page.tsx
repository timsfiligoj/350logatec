import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

const currentYear = new Date().getFullYear()

export default function VesoljePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-16 md:py-24 max-w-3xl">
          <p className="text-sm uppercase tracking-widest text-emerald-600 font-semibold">
            350space
          </p>
          <h1 className="mt-4 text-4xl md:text-5xl font-display font-bold tracking-tight">
            Logatec iz vesolja
          </h1>
          <p className="mt-6 text-lg text-gray-700 leading-relaxed">
            Civilna iniciativa, ki domeno vesolja približuje občanom Logatca.
            Skozi odprte podatke evropskih satelitov Copernicus Sentinel-2
            bomo Logatec gledali z višine: kako se spreminja barva poljščin,
            kdaj Planinsko polje poplavlja, kako dolga je snežna sezona.
          </p>
          <p className="mt-4 text-base text-gray-600 leading-relaxed">
            Projekt je v zgodnji fazi. Prvi pogledi prihajajo kmalu na tej
            strani — brez tehničnega žargona, kot zgodbe v slikah.
          </p>

          <div className="mt-12 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-6">
            <h2 className="text-lg font-semibold text-emerald-900">
              Kaj pripravljamo
            </h2>
            <ul className="mt-3 space-y-2 text-emerald-900/80 text-base list-disc list-inside">
              <li>Časovni potek Logatca v naravnih barvah</li>
              <li>Sezonske poplave Planinskega polja</li>
              <li>Kdaj se začne in konča rast v Logaški dolini</li>
              <li>Trajanje snežne sezone čez leta</li>
            </ul>
          </div>

          <p className="mt-12 text-xs text-gray-500 leading-relaxed">
            Contains modified Copernicus Sentinel data {currentYear}. Vir
            podatkov: Copernicus Data Space Ecosystem · Sentinel Hub Process
            API. Projekt 350space je neprofitna, civilna iniciativa brez
            uradnega partnerstva z Občino Logatec.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  )
}
