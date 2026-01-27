import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";

export default function ZasebnostPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <article className="prose prose-emerald max-w-none">
          <h1 className="font-display text-3xl font-bold mb-2">Politika zasebnosti</h1>
          <p className="text-muted-foreground mb-8">
            Zadnja posodobitev: 27. januar 2026
          </p>

          <section className="mb-8">
            <h2 className="font-display text-xl font-semibold mb-3">1. Uvod</h2>
            <p className="text-muted-foreground">
              350logatec spoštuje vašo zasebnost. Ta politika pojasnjuje, katere podatke zbiramo in kako jih uporabljamo.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-semibold mb-3">2. Kateri podatki se zbirajo</h2>

            <h3 className="font-semibold mt-4 mb-2">Ob registraciji:</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Email naslov</li>
              <li>Ime</li>
            </ul>

            <h3 className="font-semibold mt-4 mb-2">Ob uporabi aplikacije:</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Izbrani okoliš (E/M in Bio)</li>
              <li>Nastavitve obvestil</li>
            </ul>

            <h3 className="font-semibold mt-4 mb-2">Avtomatsko:</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Osnovni podatki o uporabi (preko Vercel Analytics, če je omogočeno)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-semibold mb-3">3. Kako uporabljamo podatke</h2>
            <p className="text-muted-foreground mb-2">Vaše podatke uporabljamo izključno za:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Prikaz relevantnega koledarja odvozov</li>
              <li>Pošiljanje email opomnikov (če ste jih omogočili)</li>
              <li>Izboljšanje aplikacije</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-semibold mb-3">4. Deljenje podatkov</h2>
            <p className="text-muted-foreground mb-2">
              Vaših podatkov NE prodajamo, oddajamo ali delimo s tretjimi osebami, razen:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>
                Supabase (hramba podatkov) -{" "}
                <Link href="https://supabase.com/privacy" target="_blank" className="text-primary hover:underline">
                  supabase.com/privacy
                </Link>
              </li>
              <li>
                Resend (pošiljanje emailov) -{" "}
                <Link href="https://resend.com/legal/privacy-policy" target="_blank" className="text-primary hover:underline">
                  resend.com/legal/privacy-policy
                </Link>
              </li>
              <li>
                Google (če uporabljate Google prijavo) -{" "}
                <Link href="https://policies.google.com/privacy" target="_blank" className="text-primary hover:underline">
                  policies.google.com/privacy
                </Link>
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-semibold mb-3">5. Varnost podatkov</h2>
            <p className="text-muted-foreground mb-2">Podatki so shranjeni v varni Supabase bazi podatkov z:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Šifriranjem pri prenosu (HTTPS)</li>
              <li>Row Level Security (RLS) politikami</li>
              <li>Varnim avtentikacijskim sistemom</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-semibold mb-3">6. Vaše pravice</h2>
            <p className="text-muted-foreground mb-2">Imate pravico do:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Dostopa do svojih podatkov</li>
              <li>Popravka netočnih podatkov (v nastavitvah)</li>
              <li>Izbrisa vašega računa (v nastavitvah pod &quot;Nevarno območje&quot;)</li>
              <li>Izvoza vaših podatkov</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              Izbris računa lahko opravite sami v nastavitvah. Za druge zahteve nas kontaktirajte na:{" "}
              <a href="mailto:tim@350life.com" className="text-primary hover:underline">
                tim@350life.com
              </a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-semibold mb-3">7. Piškotki</h2>
            <p className="text-muted-foreground mb-2">Aplikacija uporablja samo nujne piškotke za:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Avtentikacijo (prijava)</li>
              <li>Shranjevanje izbire okoliša (localStorage)</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              Ne uporabljamo sledilnih piškotkov ali oglaševalskih platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-semibold mb-3">8. Hramba podatkov</h2>
            <p className="text-muted-foreground mb-2">
              Vaše podatke hranimo dokler imate aktiven račun. Ob izbrisu računa:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Vaš prijavni račun (email, geslo) se trajno izbriše</li>
              <li>Anonimizirani podatki o uporabi (okoliš, nastavitve) se lahko ohranijo za statistične namene</li>
              <li>Ti podatki niso več povezani z vašo identiteto</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-semibold mb-3">9. Spremembe politike</h2>
            <p className="text-muted-foreground">
              O spremembah politike zasebnosti vas bomo obvestili preko aplikacije ali emaila.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-semibold mb-3">10. Kontakt</h2>
            <p className="text-muted-foreground">
              Za vprašanja glede zasebnosti:{" "}
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
