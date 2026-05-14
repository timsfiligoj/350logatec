import { Metadata } from 'next'

const VESOLJE_DESCRIPTION =
  'Logatec skozi odprte podatke evropskih satelitov Copernicus Sentinel-2. Štiri zgodbe o občini: rastje, voda, sneg in čas.'

export const metadata: Metadata = {
  title: '350space · Logatec iz vesolja | 350logatec',
  description: VESOLJE_DESCRIPTION,
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
    title: 'Logatec iz vesolja',
    description: VESOLJE_DESCRIPTION,
    type: 'website',
    locale: 'sl_SI',
    siteName: '350logatec',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Logatec iz vesolja',
    description: VESOLJE_DESCRIPTION,
  },
}

export default function VesoljeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
