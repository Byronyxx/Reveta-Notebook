import { env } from '@/lib/env';
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = env.NEXT_PUBLIC_APP_URL || 'https://reveta.app'
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/privacy', '/audio/share/*'],
      disallow: ['/dashboard', '/notebook/*', '/settings', '/api/*'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
