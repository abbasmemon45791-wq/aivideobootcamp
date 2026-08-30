import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { hashEmailForMeta, hashPhoneForMeta } from '@/lib/tracking'

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

    if (!leadId) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }

    // Verify lead exists
    const { data: lead } = await supabaseAdmin
      .from('leads')
      .select('id, name, email, whatsapp, status, utm_content')
      .eq('id', leadId)
      .maybeSingle()

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found.' }, { status: 404 })
    }

    const matchAmount = lead?.utm_content?.match(/\[amount:(\d+)\]/)
    const fallbackAmount = matchAmount ? Number(matchAmount[1]) : (Number(process.env.COURSE_PRICE) || 1999)
    const finalAmount = Number(amount) || fallbackAmount
    const wasAlreadySubmitted = lead.status === 'payment_submitted' || lead.status === 'approved'

    // Upload screenshot to Supabase Storage if fileBase64 provided
    let screenshotUrl: string | undefined
    if (fileBase64 && fileName) {
      const imageBuffer = Buffer.from(fileBase64, 'base64')
      const storagePath = `screenshots/${leadId}/${Date.now()}-${fileName}`

      const { error: uploadError } = await supabaseAdmin.storage
        .from('payment-screenshots')
        .upload(storagePath, imageBuffer, {
          contentType: contentType || 'image/jpeg',
          upsert: false,
        })

      if (!uploadError) {
        const { data: urlData } = supabaseAdmin.storage
          .from('payment-screenshots')
          .getPublicUrl(storagePath)
        screenshotUrl = urlData?.publicUrl
      }
    }

    // Insert or update payment record
    const { data: existingPayment } = await supabaseAdmin
      .from('payments')
      .select('id')
      .eq('lead_id', leadId)
      .maybeSingle()

    if (existingPayment) {
      await supabaseAdmin
        .from('payments')
        .update({
          screenshot_url: screenshotUrl,
          image_hash: imageHash,
          transaction_id: transactionId,
          amount: finalAmount,
          recipient_number: recipientNumber,
          sender_name: senderName,
          direction,
          ai_verified: aiResult?.valid ?? false,
          ai_result: aiResult,
        })
        .eq('id', existingPayment.id)
    } else {
      const { error: paymentError } = await supabaseAdmin
        .from('payments')
        .insert({
          lead_id: leadId,
          screenshot_url: screenshotUrl,
          image_hash: imageHash,
          transaction_id: transactionId,
          amount: finalAmount,
          recipient_number: recipientNumber,
          sender_name: senderName,
          direction,
          ai_verified: aiResult?.valid ?? false,
          ai_result: aiResult,
        })

      if (paymentError) throw paymentError
    }

    // Update lead status
    await supabaseAdmin
      .from('leads')
      .update({ status: 'payment_submitted' })
      .eq('id', leadId)

    // Send Facebook CAPI Purchase Event only if not already submitted
    if (!wasAlreadySubmitted) {
      try {
        const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || process.env.NEXT_PUBLIC_FB_PIXEL_ID || '2170349516868440'
        const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN
        if (PIXEL_ID && ACCESS_TOKEN && lead.email) {
          const hashedEmail = hashEmailForMeta(lead.email)
          const hashedPhone = hashPhoneForMeta(lead.whatsapp)
          
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
                    value: finalAmount,
                  }
                }
              ]
            })
          }).catch(err => console.error('FB CAPI Error (Purchase):', err))
        }
      } catch (fbErr) {
        console.error('FB CAPI Error (Purchase):', fbErr)
      }
    }

    return NextResponse.json({ success: true, alreadyTracked: wasAlreadySubmitted })
  } catch (err) {
    console.error('[POST /api/submit-payment]', err)
    return NextResponse.json({ error: 'Submission failed. Please try again.' }, { status: 500 })
  }
}
