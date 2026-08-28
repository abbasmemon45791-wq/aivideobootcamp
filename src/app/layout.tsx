import type { Metadata } from 'next'
import Script from 'next/script'
import { Inter, Sora, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const sora = Sora({ subsets: ['latin'], variable: '--font-sora', weight: ['400','600','700','800'] })
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta', weight: ['500','600','700'] })

export const metadata: Metadata = {
  title: 'AI Video Bootcamp Pakistan — Practical AI Content Creation Course',
  description: "Practical AI creator training in Pakistan. Master AI video generation, prompt engineering, product photography, and creative workflows. 10 structured modules.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yourdomain.com'),
  openGraph: {
    type: 'website',
    title: 'AI Video Bootcamp Pakistan',
    description: 'Learn practical AI video generation and creative workflows. PKR 1,999 one-time payment. Lifetime access.',
  },
  twitter: { card: 'summary_large_image' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID || '2170349516868440'
  const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA4_ID || process.env.NEXT_PUBLIC_GA_ID || 'AW-18327926458'

  return (
    <html lang="en" className={`${inter.variable} ${sora.variable} ${jakarta.variable}`}>
      <body className="font-[Inter,sans-serif] antialiased">
        {/* Meta Pixel Code */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${FB_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>

        {/* Google Analytics / Google Ads gtag — loads before conversion triggers */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-tracking-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              allow_enhanced_conversions: true,
              send_page_view: true
            });
          `}
        </Script>

        {children}
      </body>
    </html>
  )
}
