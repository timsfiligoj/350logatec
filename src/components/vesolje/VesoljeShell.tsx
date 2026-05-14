import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { VesoljeNav } from './VesoljeNav'

export function VesoljeShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <VesoljeNav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
