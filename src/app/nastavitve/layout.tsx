import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nastavitve | 350logatec',
}

export default function NastavitveLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
