import { Leaf, ExternalLink } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Logo & Description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Leaf className="h-5 w-5" />
              </div>
              <span className="font-display text-xl font-bold">350logatec</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Aplikacija za sledenje odvozov odpadkov v občini Logatec.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold">Povezave</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/odvoz"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Koledar odvozov
                </Link>
              </li>
              <li>
                <Link
                  href="/pogoji"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Pogoji uporabe
                </Link>
              </li>
              <li>
                <Link
                  href="/zasebnost"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Zasebnost
                </Link>
              </li>
              <li>
                <a
                  href="https://www.kp-logatec.si/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  KP Logatec
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Data source */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold">Vir podatkov</h4>
            <p className="text-sm text-muted-foreground">
              Podatki o odvozih so pridobljeni iz uradnega koledarja Komunalnega
              podjetja Logatec d.o.o.
            </p>
            <a
              href="https://www.kp-logatec.si/koledar-odvoza-odpadkov/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              Odpri uraden koledar
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} <a href="https://www.350life.com/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">350life</a></p>
        </div>
      </div>
    </footer>
  );
}
