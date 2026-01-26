import Link from "next/link";
import { ArrowRight, Recycle, Trash2, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const wasteTypes = [
  {
    name: "Embalaža",
    icon: Recycle,
    color: "bg-blue-500",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    description: "Plastika, kovine",
  },
  {
    name: "Mešani",
    icon: Trash2,
    color: "bg-gray-500",
    bgColor: "bg-gray-100",
    textColor: "text-gray-700",
    description: "Komunalni odpadki",
  },
  {
    name: "Bio",
    icon: Leaf,
    color: "bg-green-500",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    description: "Organski odpadki",
  },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left side - Text content */}
          <div className="flex flex-col gap-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary w-fit mx-auto lg:mx-0">
              <Leaf className="h-4 w-4" />
              Očistimo Logatec
            </div>

            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Nikoli več ne zamudite{" "}
              <span className="text-gradient">odvoza odpadkov</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
              Preprosta aplikacija za sledenje odvozov smeti v občini Logatec.
              Izberite svoj okoliš in vedno vedite, kdaj morate pripraviti
              zabojnike.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button asChild size="lg" className="gap-2">
                <Link href="/odvoz">
                  Koledar odvoza
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="#kako-deluje">Kako deluje?</Link>
              </Button>
            </div>
          </div>

          {/* Right side - Waste type cards (hidden on mobile) */}
          <div className="hidden sm:grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {wasteTypes.map((type) => (
              <Card
                key={type.name}
                className={`${type.bgColor} border-0 card-hover`}
              >
                <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                  <div
                    className={`${type.color} h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-lg`}
                  >
                    <type.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className={`font-display font-semibold ${type.textColor}`}>
                      {type.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {type.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
