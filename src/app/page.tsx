import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/landing/Hero";
import { LogatecIzVesoljaTeaser } from "@/components/landing/LogatecIzVesoljaTeaser";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { AboutProject } from "@/components/landing/AboutProject";
import { Footer } from "@/components/layout/Footer";
import { AccountDeletedNotification } from "@/components/notifications/AccountDeletedNotification";
import { getLatestForView } from "@/lib/space/db";

export const revalidate = 3600;

export default async function Home() {
  const latestTrueColor = await getLatestForView("true_color");

  return (
    <div className="min-h-screen flex flex-col">
      <Suspense fallback={null}>
        <AccountDeletedNotification />
      </Suspense>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <LogatecIzVesoljaTeaser
          thumbUrl={latestTrueColor?.public_url ?? null}
        />
        <AboutProject />
      </main>
      <Footer />
    </div>
  );
}
