import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function PogojiPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <article className="prose prose-emerald max-w-none">
          <h1 className="font-display text-3xl font-bold mb-2">Pogoji uporabe</h1>
          <p className="text-muted-foreground mb-8">
            Zadnja posodobitev: 26. januar 2026
          </p>

          <section className="mb-8">
            <h2 className="font-display text-xl font-semibold mb-3">1. Splošno</h2>
            <p className="text-muted-foreground">
              350logatec je brezplačna spletna aplikacija za sledenje odvozov odpadkov v občini Logatec.
              Z uporabo aplikacije se strinjate s temi pogoji.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-semibold mb-3">2. Namen aplikacije</h2>
            <p className="text-muted-foreground mb-2">Aplikacija omogoča:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Pregled koledarja odvozov odpadkov za leto 2026</li>
              <li>Izbiro okoliša glede na vaš naslov</li>
              <li>Prejemanje email opomnikov dan pred odvozom</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-semibold mb-3">3. Podatki o odvozih</h2>
            <p className="text-muted-foreground">
              Podatki o terminih odvozov so pridobljeni iz uradnega koledarja Komunalnega podjetja Logatec d.o.o.
              Čeprav si prizadevamo za točnost podatkov, ne prevzemamo odgovornosti za morebitne napake ali
              spremembe terminov. Za uradne informacije se obrnite na Komunalno podjetje Logatec.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-semibold mb-3">4. Uporabniški račun</h2>
            <p className="text-muted-foreground mb-2">
              Za uporabo naprednih funkcij (email obvestila) je potrebna registracija. Odgovorni ste za:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Varovanje svojih prijavnih podatkov</li>
              <li>Vse aktivnosti pod vašim računom</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-semibold mb-3">5. Email obvestila</h2>
            <p className="text-muted-foreground">
              Z vklopom email obvestil soglašate, da vam pošiljamo opomnike o odvozih odpadkov.
              Obvestila lahko kadarkoli izklopite v nastavitvah.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-semibold mb-3">6. Omejitev odgovornosti</h2>
            <p className="text-muted-foreground mb-2">
              Aplikacija je zagotovljena &quot;takšna kot je&quot; brez kakršnihkoli garancij. Ne odgovarjamo za:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Zamujene odvoze zaradi napačnih ali spremenjenih podatkov</li>
              <li>Tehnične težave ali izpade storitve</li>
              <li>Nedostavljeno email obvestilo</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-semibold mb-3">7. Spremembe pogojev</h2>
            <p className="text-muted-foreground">
              Pogoje lahko kadarkoli spremenimo. O bistvenih spremembah vas bomo obvestili preko aplikacije.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-semibold mb-3">8. Kontakt</h2>
            <p className="text-muted-foreground">
              Za vprašanja glede pogojev uporabe nas kontaktirajte na:{" "}
              <a href="mailto:tim@350life.com" className="text-primary hover:underline">
                tim@350life.com
              </a>
            </p>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}
