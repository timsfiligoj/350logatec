import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '350space · Logatec iz vesolja | 350logatec',
  description:
    'Civilna iniciativa, ki domeno vesolja približuje Logatcu. Satelitski pogledi na občino z odprtimi podatki Copernicus Sentinel-2.',
  keywords: [
    '350space',
    'logatec iz vesolja',
    'copernicus logatec',
    'sentinel-2 logatec',
    'planinsko polje satelit',
    'esa logatec',
    'cassini logatec',
  ],
  openGraph: {
    title: '350space · Logatec iz vesolja',
    description:
      'Civilna iniciativa, ki domeno vesolja približuje Logatcu. Satelitski pogledi na občino z odprtimi podatki Copernicus Sentinel-2.',
  },
}

export default function VesoljeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
