import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: '11_HOUR - When you\'re out of time, we find more.',
  description:
    'AI-powered productivity companion that transforms deadline panic into structured action. Real-time urgency scoring, smart task management, and your personal AI assistant.',
  keywords: [
    'productivity',
    'task management',
    'AI assistant',
    'deadline manager',
    'urgency tracker',
  ],
  openGraph: {
    title: '11_HOUR - The Last-Minute Life Saver',
    description: 'When you\'re out of time, we find more.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
