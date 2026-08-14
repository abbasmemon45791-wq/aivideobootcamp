import type { Metadata } from 'next'
import { Inter, Sora, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const sora = Sora({ subsets: ['latin'], variable: '--font-sora', weight: ['400','600','700','800'] })
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta', weight: ['500','600','700'] })

export const metadata: Metadata = {
  title: 'AI Video Bootcamp Pakistan — Earn $300–$15,000/Month',
  description: "Pakistan's #1 AI Video Creator training. Learn AI-powered video ads in 10 days, land your first client during training — or get your money back.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yourdomain.com'),
  openGraph: {
    type: 'website',
    title: 'AI Video Bootcamp Pakistan',
    description: 'Learn AI video ads, earn online. PKR 2,900 intro price. 726+ students enrolled.',
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
