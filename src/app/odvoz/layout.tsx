import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Odvoz odpadkov | 350logatec',
  description: 'Preveri kdaj je odvoz smeti, embalaže in bioloških odpadkov v Logatcu. Izberi svoj okoliš in poglej datume odvozov.',
  keywords: [
    'odvoz odpadkov logatec',
    'koledar smeti logatec',
    'kdaj je odvoz odpadkov',
    'embalaža logatec',
    'bio odpadki logatec',
    'urnik odvoza smeti'
  ],
  openGraph: {
    title: 'Odvoz odpadkov | 350logatec',
    description: 'Preveri kdaj je odvoz smeti v Logatcu. Izberi svoj okoliš in poglej datume odvozov.',
  }
}

export default function OdvozLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
