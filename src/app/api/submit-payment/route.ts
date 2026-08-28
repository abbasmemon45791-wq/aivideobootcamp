import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import crypto from 'crypto'

const hashData = (data: string) => crypto.createHash('sha256').update(data).digest('hex')

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      leadId,
      fileBase64,
      contentType,
      fileName,
      imageHash,
      aiResult,
      transactionId,
      amount,
      recipientNumber,
      senderName,
      direction,
      eventId,
    } = body

    if (!leadId || !fileBase64) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }

    // Verify lead exists
    const { data: lead } = await supabaseAdmin
      .from('leads')
      .select('id, name, email, whatsapp, status')
      .eq('id', leadId)
      .maybeSingle()

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found.' }, { status: 404 })
    }

    // Upload screenshot to Supabase Storage
    const imageBuffer = Buffer.from(fileBase64, 'base64')
    const storagePath = `screenshots/${leadId}/${Date.now()}-${fileName}`

    const { error: uploadError } = await supabaseAdmin.storage
      .from('payment-screenshots')
      .upload(storagePath, imageBuffer, {
        contentType,
        upsert: false,
      })

    let screenshotUrl: string | undefined
    if (!uploadError) {
      const { data: urlData } = supabaseAdmin.storage
        .from('payment-screenshots')
        .getPublicUrl(storagePath)
      screenshotUrl = urlData?.publicUrl
    }

    // Insert payment record
    const { error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        lead_id: leadId,
        screenshot_url: screenshotUrl,
        image_hash: imageHash,
        transaction_id: transactionId,
        amount,
        recipient_number: recipientNumber,
        sender_name: senderName,
        direction,
        ai_verified: aiResult?.valid ?? false,
        ai_result: aiResult,
      })

    if (paymentError) throw paymentError

    // Update lead status
    await supabaseAdmin
      .from('leads')
      .update({ status: 'payment_submitted' })
      .eq('id', leadId)



    // Send WhatsApp notification to admin (via WhatsApp API link — manual trigger)
    // In production: integrate with WhatsApp Business API for auto-notify

    // Send Facebook CAPI Purchase Event
    try {
      const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || process.env.NEXT_PUBLIC_FB_PIXEL_ID || '2170349516868440'
      const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN
      if (PIXEL_ID && ACCESS_TOKEN && lead.email && lead.whatsapp) {
        const hashedEmail = hashData(lead.email.toLowerCase().trim())
        const digitsOnly = lead.whatsapp.replace(/\D/g, '')
        const hashedPhone = digitsOnly ? hashData(digitsOnly) : undefined
        
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? req.headers.get('x-real-ip') ?? 'unknown'

        // Extract Meta browser cookies for CAPI signal quality
        const cookieHeader = req.headers.get('cookie') ?? ''
        const fbc = cookieHeader.match(/_fbc=([^;]+)/)?.[1]
        const fbp = cookieHeader.match(/_fbp=([^;]+)/)?.[1]

        await fetch(`https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: [
              {
                event_name: 'Purchase',
                event_time: Math.floor(Date.now() / 1000),
                action_source: 'website',
                event_source_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aivideobootcamp.vercel.app'}/enroll`,
                ...(eventId && { event_id: eventId }),
                user_data: {
                  em: [hashedEmail],
                  ...(hashedPhone && { ph: [hashedPhone] }),
                  client_ip_address: ip,
                  client_user_agent: req.headers.get('user-agent') ?? '',
                  ...(fbc && { fbc }),
                  ...(fbp && { fbp }),
                },
                custom_data: {
                  currency: 'PKR',
                  value: Number(process.env.COURSE_PRICE) || 1999,
                }
              }
            ]
          })
        }).catch(err => console.error('FB CAPI Error (Purchase):', err))
      }
    } catch (fbErr) {
      console.error('FB CAPI Error (Purchase):', fbErr)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[POST /api/submit-payment]', err)
    return NextResponse.json({ error: 'Submission failed. Please try again.' }, { status: 500 })
  }
}
