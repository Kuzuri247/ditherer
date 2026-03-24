import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Link from 'next/link'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Ditherer',
  description: 'Apply Dither shade to your images',
  icons: {
    icon: [
      {
        url: '/icon-light-32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32.png',
        media: '(prefers-color-scheme: dark)',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-mono antialiased">
        {children}
        <div className="fixed bottom-4 right-4 flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 font-medium z-50 pointer-events-none">
          made by <Link href="https://x.com/kuzuri247" target="_blank" rel="noopener noreferrer" className="pointer-events-auto hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors underline decoration-neutral-500/30 underline-offset-2">Rahul</Link> using <Link href="https://ui.aceternity.com/" target="_blank" rel="noopener noreferrer" className="pointer-events-auto hover:opacity-80 transition-opacity"><img src="/aceternity.png" alt="Aceternity" className="inline-block size-5" /></Link>
        </div>
        <Analytics />
      </body>
    </html>
  )
}
