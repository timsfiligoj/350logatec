import { VesoljeShell } from '@/components/vesolje/VesoljeShell'

const currentYear = new Date().getFullYear()

export default function VesoljePage() {
  return (
    <VesoljeShell>
      <section className="container mx-auto px-4 py-12 md:py-16 max-w-3xl">
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
          Pogledi so dostopni v zgornji navigaciji. Vsaka podstran kaže
          najnovejšo satelitsko sceno z razlago za vsakogar in
          tehničnim ozadjem za radovedneže.
        </p>

        <p className="mt-12 text-xs text-gray-500 leading-relaxed">
          Contains modified Copernicus Sentinel data {currentYear}. Vir
          podatkov: Copernicus Data Space Ecosystem · Sentinel Hub Process
          API. Projekt 350space je neprofitna, civilna iniciativa brez
          uradnega partnerstva z Občino Logatec.
        </p>
      </section>
    </VesoljeShell>
  )
}
