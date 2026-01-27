import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { AboutProject } from "@/components/landing/AboutProject";
import { Footer } from "@/components/layout/Footer";
import { AccountDeletedNotification } from "@/components/notifications/AccountDeletedNotification";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Suspense fallback={null}>
        <AccountDeletedNotification />
      </Suspense>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <AboutProject />
      </main>
      <Footer />
    </div>
  );
}
