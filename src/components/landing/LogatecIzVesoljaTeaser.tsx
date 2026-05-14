import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Satellite } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Home-page teaser for the /vesolje widget. Renders between the trash-
 * focused hero and the HowItWorks section so the main flow stays
 * trash-first; this banner introduces vesolje as an additive widget
 * to curious visitors. Sub-page links (navbar / hero CTA) deliberately
 * stay unchanged — most vesolje traffic comes from shared /vesolje URLs.
 */
export function LogatecIzVesoljaTeaser({
  thumbUrl,
}: {
  thumbUrl: string | null
}) {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="rounded-3xl border bg-gradient-to-br from-slate-50 via-emerald-50/40 to-sky-50/60 p-6 md:p-10">
          <div className="grid gap-6 md:grid-cols-2 md:gap-10 items-center max-w-5xl mx-auto">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border bg-muted shadow-sm">
              {thumbUrl ? (
                <Image
                  src={thumbUrl}
                  alt="Najnovejši posnetek Logatca iz Sentinel-2 satelita"
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 480px, 100vw"
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-emerald-50 text-emerald-700/60 text-xs px-3 text-center">
                  Še pridobivam podatke…
                </div>
              )}
            </div>
            <div className="flex flex-col gap-5 text-center md:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-4 py-1.5 text-sm font-medium text-emerald-700 w-fit mx-auto md:mx-0">
                <Satellite className="h-4 w-4" />
                Logatec z neba
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
                Logatec iz vesolja
              </h2>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                Vsakih nekaj dni evropski sateliti Sentinel-2 preletijo tudi
                Logatec. Iz njihovih posnetkov spremljamo, kako se skozi leto
                spreminjajo gozdovi, polja, voda in sneg v naši občini.
                Preprosto in razumljivo.
              </p>
              <div className="flex justify-center md:justify-start">
                <Button asChild size="lg" className="gap-2">
                  <Link href="/vesolje">
                    Odpri Logatec iz vesolja
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
