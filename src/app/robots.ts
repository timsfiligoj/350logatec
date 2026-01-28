import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/prijava', '/registracija'],
    },
    sitemap: 'https://www.350logatec.si/sitemap.xml',
  }
}
