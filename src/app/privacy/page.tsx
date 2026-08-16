'use client'
import Link from 'next/link'
import { ArrowLeft, Shield } from 'lucide-react'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl text-white font-bold text-sm shadow-sm" style={{ background: 'linear-gradient(135deg,#2563eb,#06b6d4)' }}>AI</div>
            <div className="leading-tight">
              <div className="font-['Sora'] text-sm font-bold tracking-tight sm:text-base">AI Bootcamp</div>
              <div className="-mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-600">Pakistan</div>
            </div>
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="mb-8 flex items-center gap-3">
          <Shield className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="font-['Sora'] text-3xl font-bold text-slate-900">Privacy Policy</h1>
            <p className="text-sm text-slate-500">Last updated: August 16, 2026</p>
          </div>
        </div>

        <div className="prose prose-slate max-w-none prose-headings:font-['Sora'] prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-p:leading-relaxed prose-li:leading-relaxed">

          <h2>1. Who We Are</h2>
          <p>
            AI Bootcamp Pakistan (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is an online education platform teaching practical AI creative skills to students in Pakistan and globally. Our website is hosted on Vercel. We are operated by an individual business and can be reached via WhatsApp at <a href="https://wa.me/923194448530" className="text-blue-600 hover:underline">+92 319 4448530</a>.
          </p>

          <h2>2. Information We Collect</h2>
          <p>We collect the following information when you interact with our website or enroll in our programs:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Personal identifiers:</strong> Full name, email address, WhatsApp/phone number</li>
            <li><strong>Payment information:</strong> Transaction references from JazzCash, EasyPaisa, or bank transfer screenshots (we do not store card details)</li>
            <li><strong>Technical data:</strong> IP address, browser type, device type, operating system, pages visited, time on site</li>
            <li><strong>Advertising identifiers:</strong> Google Click ID (GCLID), Meta Pixel ID, UTM parameters (source, medium, campaign, content), and cookies from ad platforms</li>
          </ul>

          <h2>3. Cookies &amp; Tracking Technologies</h2>
          <p>We use cookies and similar tracking technologies to operate and improve our services, measure the effectiveness of our advertising campaigns, and serve you relevant advertising. You can control cookies through your browser settings.</p>

          <h2>4. Google Ads &amp; Remarketing Disclosure</h2>
          <p>We use Google Ads (including Demand Gen and Search campaigns) to promote our bootcamp. This involves:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Using Google Conversion Tracking to measure when a user who clicked our ad completes an enrollment action</li>
            <li>Using Google Remarketing (via Google tag / gtag.js) to show our ads to past visitors across the Google Display Network and YouTube</li>
            <li>Using Google Analytics 4 (GA4) to understand user behavior on our website</li>
          </ul>
          <p className="mt-4"><strong>Your Advertising Choices with Google:</strong></p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Opt out of personalized advertising at <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">google.com/settings/ads</a></li>
            <li>Opt out via the <a href="https://optout.networkadvertising.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Network Advertising Initiative opt-out page</a></li>
            <li>Learn how Google uses data: <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">How Google uses data when you use our partners&apos; sites or apps</a></li>
          </ul>

          <h2>5. Meta Pixel &amp; Conversions API</h2>
          <p>We use the Meta Pixel (browser-side) to measure the effectiveness of our Facebook and Instagram advertising campaigns. This allows Meta to attribute conversions (enrollments) to the correct ad campaigns.</p>
          <p>To opt out of Meta&apos;s use of your data for ad targeting, visit your <a href="https://www.facebook.com/adpreferences" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Facebook Ad Preferences</a>.</p>

          <h2>6. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>To process your enrollment and communicate about your course access</li>
            <li>To send relevant course updates, announcements, and support via WhatsApp or email</li>
            <li>To measure and optimize the performance of our advertising campaigns</li>
            <li>To improve our website and user experience through analytics</li>
            <li>To prevent fraud and ensure payment integrity</li>
            <li>To comply with legal obligations</li>
          </ul>

          <h2>7. Data Sharing &amp; Third Parties</h2>
          <p>We do not sell your personal data. We share data only with the following categories of third parties, and only to the extent necessary:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Google LLC</strong> — For analytics (GA4) and advertising (Google Ads). <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Privacy Policy →</a></li>
            <li><strong>Meta Platforms, Inc.</strong> — For advertising measurement via Pixel. <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Meta Privacy Policy →</a></li>
            <li><strong>Vercel, Inc.</strong> — Our website hosting provider. <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Vercel Privacy Policy →</a></li>
            <li><strong>Supabase, Inc.</strong> — Our database provider for storing enrollment data. <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Supabase Privacy Policy →</a></li>
            <li><strong>Payment processors</strong> — JazzCash, EasyPaisa, or bank transfers handle payment processing under their own privacy policies</li>
          </ul>

          <h2>8. Data Retention</h2>
          <p>We retain your personal data for as long as necessary to provide our services and comply with legal obligations. Enrollment records are retained indefinitely for course access purposes. You may request deletion at any time (see section below).</p>

          <h2>9. Your Rights &amp; Choices</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Access:</strong> Request a copy of the data we hold about you</li>
            <li><strong>Correction:</strong> Ask us to correct inaccurate data</li>
            <li><strong>Deletion:</strong> Request deletion of your personal data (subject to legal requirements)</li>
            <li><strong>Opt-out of ads:</strong> Use the Google and Meta opt-out links provided in sections 4 and 5 above</li>
            <li><strong>Cookie control:</strong> Adjust your browser settings to block or delete cookies</li>
          </ul>
          <p>To exercise these rights, contact us via WhatsApp at <a href="https://wa.me/923194448530" className="text-blue-600 hover:underline">+92 319 4448530</a>.</p>

          <h2>10. Children&apos;s Privacy</h2>
          <p>Our services are not directed to children under 18. We do not knowingly collect personal information from minors. If you believe a minor has submitted data to us, please contact us immediately.</p>

          <h2>11. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. The &quot;Last updated&quot; date at the top will always reflect the most recent version. Continued use of our website after changes constitutes acceptance of the updated policy.</p>

          <h2>12. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy or how we handle your data, please contact us:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>WhatsApp: <a href="https://wa.me/923194448530" className="text-blue-600 hover:underline">+92 319 4448530</a></li>
          </ul>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-slate-900 px-4 py-10 text-white/70 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl text-white font-bold text-sm" style={{ background: 'linear-gradient(135deg,#2563eb,#06b6d4)' }}>AI</div>
            <div className="font-['Sora'] text-sm font-bold text-white">AI Bootcamp Pakistan</div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <Link href="/privacy" className="text-white/60 hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="text-white/60 hover:text-white">Terms of Service</Link>
            <span className="text-white/40">© 2026 AI Bootcamp Pakistan. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
