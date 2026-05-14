import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { VesoljeNav } from './VesoljeNav'

export function VesoljeShell({
  children,
  showNav = true,
}: {
  children: React.ReactNode
  /** Sub-page nav strip. Hidden on the /vesolje landing where the
   *  cards already act as entry points. */
  showNav?: boolean
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {showNav ? <VesoljeNav /> : null}
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
