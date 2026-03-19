import type { Metadata, Viewport } from 'next'
import { ServiceWorkerRegistrar } from '@/components/ServiceWorkerRegistrar'
import './globals.css'

export const metadata: Metadata = {
  title: 'TRON Fitness',
  description: 'App de acompanhamento de treinos para academia',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TRON Fitness',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0a0a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@100..1000&family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="bg-[#0a0a0a] text-white antialiased font-[family-name:var(--font-body)]">
        {children}
        <ServiceWorkerRegistrar />
      </body>
    </html>
  )
}
