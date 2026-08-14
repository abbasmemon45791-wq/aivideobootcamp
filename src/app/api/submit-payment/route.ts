import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { Resend } from 'resend'

const getResend = () => new Resend(process.env.RESEND_API_KEY ?? 'placeholder')

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
    } = body

    if (!leadId || !fileBase64) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }

    // Verify lead exists
    const { data: lead } = await supabaseAdmin
      .from('leads')
      .select('id, name, email, whatsapp, status')
      .eq('id', leadId)
      .single()

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

    // Send confirmation email to student
    if (lead.email && process.env.RESEND_API_KEY) {
      await getResend().emails.send({
        from: `${process.env.COURSE_NAME ?? 'AI Bootcamp'} <${process.env.FROM_EMAIL ?? 'no-reply@yourdomain.com'}>`,
        to: lead.email,
        subject: `✅ Payment Received — Your seat is being confirmed`,
        html: `
          <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #fafafa;">
            <h1 style="color: #1e293b; font-size: 24px; margin-bottom: 8px;">
              Shukria ${lead.name}! 🎉
            </h1>
            <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
              We've received your payment screenshot. Our team is verifying it right now.
            </p>
            <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 24px 0;">
              <p style="margin: 0; font-size: 14px; color: #64748b;">What happens next:</p>
              <ol style="color: #1e293b; font-size: 15px; line-height: 2;">
                <li>We verify your payment (usually within 1 hour)</li>
                <li>You'll receive your course access link via WhatsApp & email</li>
                <li>Start learning immediately at your own pace</li>
              </ol>
            </div>
            <p style="color: #64748b; font-size: 14px;">
              Questions? WhatsApp us at <strong>${process.env.WHATSAPP_SUPPORT ?? '+92 XXX XXXXXXX'}</strong>
            </p>
          </div>
        `,
      }).catch(console.error) // don't fail if email fails
    }

    // Send WhatsApp notification to admin (via WhatsApp API link — manual trigger)
    // In production: integrate with WhatsApp Business API for auto-notify

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[POST /api/submit-payment]', err)
    return NextResponse.json({ error: 'Submission failed. Please try again.' }, { status: 500 })
  }
}
