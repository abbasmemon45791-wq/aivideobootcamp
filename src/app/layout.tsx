import type { Metadata } from 'next'
import { Inter, Sora, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const sora = Sora({ subsets: ['latin'], variable: '--font-sora', weight: ['400','600','700','800'] })
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta', weight: ['500','600','700'] })

export const metadata: Metadata = {
  title: 'AI Video Bootcamp Pakistan — Learn & Earn in USD',
  description: "Pakistan's #1 AI Video Creator training. Master AI ad generation, faceless YouTube automation, and client outreach in 10 days. Land your first paying client or your money back.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yourdomain.com'),
  openGraph: {
    type: 'website',
    title: 'AI Video Bootcamp Pakistan',
    description: 'Master AI video generation and earn in USD. PKR 2,900 intro price. No experience needed.',
  },
  twitter: { card: 'summary_large_image' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable} ${jakarta.variable}`}>
      <body className="font-[Inter,sans-serif] antialiased">{children}</body>
    </html>
  )
}
