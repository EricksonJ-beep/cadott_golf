import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cadott Golf',
    short_name: 'Cadott Golf',
    description: 'Cadott High School Golf Team',
    start_url: '/dashboard?tab=info',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#FFD700',
    orientation: 'portrait',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
