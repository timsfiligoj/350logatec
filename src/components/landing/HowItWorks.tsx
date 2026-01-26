const steps = [
  {
    number: "1",
    title: "Izberite okoliš",
    description:
      "Vnesite naslov ulice ali samo izberite okoliš, če ga že poznate.",
  },
  {
    number: "2",
    title: "Koledar",
    description:
      "Videli boste datume in koledar za odvoz odpadkov v vašem okolišu.",
  },
  {
    number: "3",
    title: "Prejmite obvestilo",
    description:
      "Ustvarite brezplačen račun in prejmite obvestilo 1 dan pred odvozom.",
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
