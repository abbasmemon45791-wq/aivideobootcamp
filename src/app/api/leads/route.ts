import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { hashEmailForMeta, hashPhoneForMeta } from '@/lib/tracking'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, whatsapp, total_amount, selected_upsells, source, utm_medium, utm_campaign, utm_content, eventId, gclid, wbraid, gbraid, fbclid, ga_client_id, ga_session_id } = body

    // Validation
    if (!name || name.trim().length < 2 || name.length > 100)
      return NextResponse.json({ error: 'Please enter your full name.' }, { status: 400 })
    if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 255)
      return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400 })
    if (!/^[+\d\s-]{7,20}$/.test(whatsapp))
      return NextResponse.json({ error: 'Please enter a valid WhatsApp number.' }, { status: 400 })

    const finalAmount = Number(total_amount) || 1999

    // Get IP and User-Agent for basic rate limiting / fraud tracking / attribution
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 
                req.headers.get('x-real-ip') ?? 'unknown'
    const userAgent = req.headers.get('user-agent') ?? 'unknown'

    // Extract Meta and GA browser cookies for signal quality
    const cookieHeader = req.headers.get('cookie') ?? ''
    const fbc = cookieHeader.match(/_fbc=([^;]+)/)?.[1]
    const fbp = cookieHeader.match(/_fbp=([^;]+)/)?.[1]
    const gaCookie = cookieHeader.match(/_ga=(?:GA\d\.\d\.)?(\d+\.\d+)/)?.[1]
    const gaSessionCookie = cookieHeader.match(/_ga_[A-Z0-9]+=GS\d\.\d\.(\d+)/)?.[1]
    const resolvedGaClientId = ga_client_id?.trim() || gaCookie || null
    const resolvedGaSessionId = ga_session_id?.trim() || gaSessionCookie || null

    const site = process.env.NEXT_PUBLIC_SITE_NAME || 'techpulse-replica'

    const gaTag = resolvedGaClientId ? ` [ga:${resolvedGaClientId}]` : ''
    const sessionTag = resolvedGaSessionId ? ` [session:${resolvedGaSessionId}]` : ''
    const wbraidTag = wbraid ? ` [wbraid:${wbraid}]` : ''
    const gbraidTag = gbraid ? ` [gbraid:${gbraid}]` : ''
    const siteTag = ` [site:${site}]`
    const upsellTag = selected_upsells?.length ? ` [upsells:${selected_upsells.join(',')}]` : ''
    const amountTag = ` [amount:${finalAmount}]`
    const updatedUtmContent = utm_content ? `${utm_content}${siteTag}${gaTag}${sessionTag}${wbraidTag}${gbraidTag}${upsellTag}${amountTag}` : `${siteTag}${gaTag}${sessionTag}${wbraidTag}${gbraidTag}${upsellTag}${amountTag}`

    // Check duplicate email — if already pending or submitted, update and return existing lead
    const { data: existing } = await supabaseAdmin
      .from('leads')
      .select('id, status')
      .eq('email', email.toLowerCase().trim())
      .in('status', ['pending', 'payment_submitted', 'approved'])
      .maybeSingle()

    if (existing) {
      if (existing.status === 'pending') {
        await supabaseAdmin
          .from('leads')
          .update({
            utm_content: updatedUtmContent.trim(),
            name: name.trim(),
            whatsapp: whatsapp.trim(),
          })
          .eq('id', existing.id)
      }
      return NextResponse.json({ id: existing.id, existing: true })
    }

    const leadPayload: Record<string, any> = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      whatsapp: whatsapp.trim(),
      ip_address: ip,
      user_agent: userAgent,
      status: 'pending',
      site: site,
      source: source || 'direct',
      utm_medium: utm_medium?.trim() || null,
      utm_campaign: utm_campaign?.trim() || null,
      utm_content: updatedUtmContent.trim(),
      gclid: gclid?.trim() || null,
      wbraid: wbraid?.trim() || null,
      gbraid: gbraid?.trim() || null,
      fbclid: fbclid?.trim() || null,
      ...(resolvedGaClientId ? { ga_client_id: resolvedGaClientId } : {}),
      ...(resolvedGaSessionId ? { ga_session_id: resolvedGaSessionId } : {}),
    }

    let insertRes = await supabaseAdmin
      .from('leads')
      .insert(leadPayload)
      .select('id')
      .single()

    // Fallback if ga_session_id, wbraid, gbraid, ga_client_id, or site column does not exist in Supabase yet
    if (insertRes.error) {
      delete leadPayload.ga_session_id
      delete leadPayload.wbraid
      delete leadPayload.gbraid
      delete leadPayload.ga_client_id
      insertRes = await supabaseAdmin.from('leads').insert(leadPayload).select('id').single()
      if (insertRes.error && insertRes.error.message?.includes('site')) {
        delete leadPayload.site
        insertRes = await supabaseAdmin.from('leads').insert(leadPayload).select('id').single()
      }
    }

    const { data, error } = insertRes
    if (error) throw error

    // Send Facebook CAPI Lead Event
    try {
      const PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID || '2170349516868440'
      const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN
      if (PIXEL_ID && ACCESS_TOKEN && email) {
        const hashedEmail = hashEmailForMeta(email)
        const hashedPhone = hashPhoneForMeta(whatsapp)
        
        await fetch(`https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: [
              {
                event_name: 'Lead',
                event_time: Math.floor(Date.now() / 1000),
                action_source: 'website',
                event_source_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aivideobootcamp.vercel.app'}/enroll`,
                // event_id matches the browser fbq() call — Meta deduplicates automatically
                ...(eventId && { event_id: eventId }),
                user_data: {
                  em: [hashedEmail],
                  ...(hashedPhone && { ph: [hashedPhone] }),
                  client_ip_address: ip,
                  client_user_agent: req.headers.get('user-agent') ?? '',
                  // _fbc/_fbp cookies — highest-quality signal for matching CAPI events to ad clicks
                  ...(fbc && { fbc }),
                  ...(fbp && { fbp }),
                },
                custom_data: {
                  currency: 'PKR',
                  value: finalAmount,
                },
              }
            ]
          })
        }).catch(err => console.error('FB CAPI Error (Lead):', err))
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
