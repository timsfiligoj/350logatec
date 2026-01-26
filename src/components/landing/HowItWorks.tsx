const steps = [
  {
    number: "1",
    title: "Izberite okoliš",
    description:
      "Poiščite svoj naslov ali izberite okoliš iz seznama. Logatec je razdeljen na 12 E/M okolišev in 2 Bio okoliša.",
  },
  {
    number: "2",
    title: "Preglejte datume",
    description:
      "Na koledarju vidite vse datume odvozov za vaš okoliš. Embalaža, mešani in bio odpadki so označeni z različnimi barvami.",
  },
  {
    number: "3",
    title: "Nastavite opomnike",
    description:
      "Prijavite se in nastavite email obvestila. Dan pred vsakim odvozom boste prejeli opomnik.",
  },
];

export function HowItWorks() {
  return (
    <section id="kako-deluje" className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Kako deluje?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            V treh preprostih korakih do urejenega odvoza odpadkov
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector line (hidden on mobile and last item) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-gradient-to-r from-primary/50 to-primary/20" />
              )}

              <div className="flex flex-col items-center text-center">
                {/* Number circle */}
                <div className="relative mb-6">
                  <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-display text-2xl font-bold shadow-lg shadow-primary/25">
                    {step.number}
                  </div>
                </div>

                {/* Content */}
                <h3 className="font-display text-xl font-semibold mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed max-w-xs">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
