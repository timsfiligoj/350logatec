import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Odvoz odpadkov | 350logatec',
}

export default function OdvozLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
