import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import PwaRegister from '@/components/PwaRegister'

const geist = Geist({ variable: '--font-sans', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Cadott Golf',
  description: 'Cadott High School Golf Team',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Cadott Golf',
    startupImage: ['/icons/apple-touch-icon.png'],
  },
  icons: {
    icon: [
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/favicon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#FFD700',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="h-full bg-background text-foreground antialiased">
        <PwaRegister />
        {children}
      </body>
    </html>
  )
}
