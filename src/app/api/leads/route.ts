import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import crypto from 'crypto'

const hashData = (data: string) => crypto.createHash('sha256').update(data).digest('hex')

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, whatsapp } = body

    // Validation
    if (!name || name.trim().length < 2 || name.length > 100)
      return NextResponse.json({ error: 'Please enter your full name.' }, { status: 400 })
    if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 255)
      return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400 })
    if (!/^[+\d\s-]{7,20}$/.test(whatsapp))
      return NextResponse.json({ error: 'Please enter a valid WhatsApp number.' }, { status: 400 })

    // Check duplicate email — if already pending or submitted, return existing lead
    const { data: existing } = await supabaseAdmin
      .from('leads')
      .select('id, status')
      .eq('email', email.toLowerCase().trim())
      .in('status', ['pending', 'payment_submitted', 'approved'])
      .single()

    if (existing) {
      return NextResponse.json({ id: existing.id, existing: true })
    }

    // Get IP for basic rate limiting / fraud tracking
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 
                req.headers.get('x-real-ip') ?? 'unknown'

    const { data, error } = await supabaseAdmin
      .from('leads')
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        whatsapp: whatsapp.trim(),
        ip_address: ip,
        status: 'pending',
      })
      .select('id')
      .single()

    if (error) throw error

    // Send Facebook CAPI Lead Event
    try {
      const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID
      const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN
      if (PIXEL_ID && ACCESS_TOKEN) {
        const hashedEmail = hashData(email.toLowerCase().trim())
        // Extract only digits for phone hash per FB specs (include country code, no + or -)
        const digitsOnly = whatsapp.replace(/\D/g, '')
        const hashedPhone = digitsOnly ? hashData(digitsOnly) : undefined
        
        await fetch(`https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: [
              {
                event_name: 'Lead',
                event_time: Math.floor(Date.now() / 1000),
                action_source: 'website',
                user_data: {
                  em: [hashedEmail],
                  ...(hashedPhone && { ph: [hashedPhone] }),
                  client_ip_address: ip,
                  client_user_agent: req.headers.get('user-agent') ?? '',
                }
              }
            ]
          })
        })
      }
    } catch (fbErr) {
      console.error('FB CAPI Error (Lead):', fbErr)
    }

    return NextResponse.json({ id: data.id })
  } catch (err) {
    console.error('[POST /api/leads]', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
