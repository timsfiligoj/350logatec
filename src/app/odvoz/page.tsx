"use client";

import { useEffect, useState } from "react";
import { Calendar, MapPinOff } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { OkolisSelector } from "@/components/odvoz/OkolisSelector";
import { UpcomingCollection } from "@/components/odvoz/UpcomingCollection";
import { WasteCalendar } from "@/components/odvoz/WasteCalendar";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";

export default function OdvozPage() {
  const { user, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [emOkolis, setEmOkolis] = useState<number | null>(null);
  const [bioOkolis, setBioOkolis] = useState<number | null>(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Naloži nastavitve iz Supabase ali localStorage
  useEffect(() => {
    async function loadSettings() {
      // Če je uporabnik prijavljen, najprej poskusi naložiti iz Supabase
      if (user) {
        try {
          const { data, error } = await supabase
            .from('user_settings')
            .select('em_okolis, bio_okolis')
            .eq('user_id', user.id)
            .single();

          if (!error && data) {
            if (data.em_okolis !== null) setEmOkolis(data.em_okolis);
            if (data.bio_okolis !== null) setBioOkolis(data.bio_okolis);
            setSettingsLoaded(true);
            return;
          }
        } catch (err) {
          console.error('Error loading settings from Supabase:', err);
        }
      }

      // Fallback na localStorage
      const storedEm = localStorage.getItem('350logatec-em-okolis');
      const storedBio = localStorage.getItem('350logatec-bio-okolis');

      if (storedEm) {
        try {
          setEmOkolis(JSON.parse(storedEm));
        } catch {
          // Invalid JSON
        }
      }
      if (storedBio) {
        try {
          setBioOkolis(JSON.parse(storedBio));
        } catch {
          // Invalid JSON
        }
      }
      setSettingsLoaded(true);
    }

    if (!authLoading) {
      loadSettings();
    }
  }, [user, authLoading, supabase]);

  // Shrani v localStorage ko se spremeni (za neprijavljene uporabnike)
  useEffect(() => {
    if (settingsLoaded && !user) {
      if (emOkolis !== null) {
        localStorage.setItem('350logatec-em-okolis', JSON.stringify(emOkolis));
      }
      if (bioOkolis !== null) {
        localStorage.setItem('350logatec-bio-okolis', JSON.stringify(bioOkolis));
      }
    }
  }, [emOkolis, bioOkolis, settingsLoaded, user]);

  const hasSelection = emOkolis !== null && bioOkolis !== null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Page header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-bold">
                Koledar odvoza odpadkov
              </h1>
            </div>
            <p className="text-muted-foreground">
              Izberite svoj okoliš in preglejte datume odvozov za leto 2026
            </p>
          </div>

          {/* Main content grid */}
          <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
            {/* Left column - Selector */}
            <div className="space-y-6">
              <OkolisSelector
                emOkolis={emOkolis}
                bioOkolis={bioOkolis}
                onEmOkolisChange={setEmOkolis}
                onBioOkolisChange={setBioOkolis}
              />
            </div>

            {/* Right column - Calendar and upcoming */}
            <div className="space-y-6">
              {hasSelection ? (
                <>
                  <UpcomingCollection
                    emOkolis={emOkolis}
                    bioOkolis={bioOkolis}
                  />
                  <WasteCalendar emOkolis={emOkolis} bioOkolis={bioOkolis} />
                </>
              ) : (
                <EmptyState />
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-muted rounded-2xl bg-muted/20">
      <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <MapPinOff className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-display text-lg font-semibold text-center mb-2">
        Izberite svoj okoliš
      </h3>
      <p className="text-muted-foreground text-center max-w-sm">
        Izberite svoj E/M in Bio okoliš, da vidite koledar odvozov odpadkov.
      </p>
    </div>
  );
}
