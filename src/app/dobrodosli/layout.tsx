import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dobrodošli | 350logatec',
}

export default function DobrodosliLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
