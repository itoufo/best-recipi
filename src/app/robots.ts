import { MetadataRoute } from 'next'
import { SITE } from '@/lib/constants/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/search?'],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  }
}
