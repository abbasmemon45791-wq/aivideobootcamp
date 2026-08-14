import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'
import type { VerificationResult } from '@/types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Your EasyPaisa / JazzCash / HBL account numbers
const VALID_RECIPIENT_NUMBERS = [
  process.env.NEXT_PUBLIC_EASYPAISA_NUMBER ?? '',
  process.env.NEXT_PUBLIC_JAZZCASH_NUMBER ?? '',
  process.env.NEXT_PUBLIC_HBL_ACCOUNT ?? '',
].filter(Boolean)

const COURSE_PRICE = parseInt(process.env.COURSE_PRICE ?? '2900')
const PRICE_TOLERANCE_LOW = COURSE_PRICE - 150    // e.g. 2750
const PRICE_TOLERANCE_HIGH = COURSE_PRICE + 500   // e.g. 3400

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { fileBase64, contentType, localTime } = body

    if (!fileBase64 || !contentType?.startsWith('image/')) {
      return NextResponse.json({ valid: false, reason: 'Invalid file type.' })
    }

    // ── Layer 1: SHA-256 duplicate check ──────────────────────────────────
    const imageBuffer = Buffer.from(fileBase64, 'base64')
    const imageHash = crypto.createHash('sha256').update(imageBuffer).digest('hex')

    const { data: dupCheck } = await supabaseAdmin
      .from('payments')
      .select('id, lead_id')
      .eq('image_hash', imageHash)
      .maybeSingle()

    if (dupCheck) {
      return NextResponse.json({
        valid: false,
        reason: 'This screenshot has already been submitted. Please send a fresh payment and upload the new receipt.',
        duplicate: true,
      })
    }

    // ── Layer 2: Gemini Flash Vision AI Verification ──────────────────────
    // ── Layer 2: Gemini Flash Vision AI Verification ──────────────────────
    const prompt = `You are a payment verification system for a Pakistani online course.
Analyze this payment screenshot and extract the following information as JSON.

RULES:
- Look for Pakistani mobile payment apps: EasyPaisa, JazzCash, Sadapay, Nayapay
- Identify the direction: was money SENT or RECEIVED by the screenshot owner
- Extract the recipient account number (the TO field)
- Extract the exact amount transferred
- Extract the transaction ID or reference number
- Extract the timestamp of the transaction
- Determine if this is a genuine payment receipt (not a screenshot of a screenshot, not edited)

Return ONLY valid JSON, no markdown, no explanation:
{
  "valid": boolean,
  "platform": "easypaisa" | "jazzcash" | "sadapay" | "nayapay" | "bank_transfer" | "unknown",
  "direction": "sent" | "received" | "unknown",
  "recipient_number": "string or null",
  "sender_name": "string or null",
  "amount": number or null,
  "transaction_id": "string or null",
  "date_time": "string or null",
  "status": "successful" | "pending" | "failed" | "unknown",
  "reason": "brief explanation if invalid, null if valid"
}

Submitted at local time: ${localTime}`

    let result;
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-3.7-flash' })
      result = await model.generateContent([
        prompt,
        { inlineData: { mimeType: contentType, data: fileBase64 } },
      ])
    } catch (e) {
      console.warn('Primary model failed, falling back to gemini-2.5-flash', e)
      const fallbackModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
      result = await fallbackModel.generateContent([
        prompt,
        { inlineData: { mimeType: contentType, data: fileBase64 } },
      ])
    }

    let aiResult: VerificationResult
    try {
      const text = result.response.text().trim()
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      aiResult = JSON.parse(jsonMatch?.[0] ?? text)
    } catch {
      return NextResponse.json({
        valid: false,
        reason: 'Could not read the screenshot. Please upload a clear, unedited screenshot.',
      })
    }

    // ── Layer 3: Business Rule Validation ─────────────────────────────────
    const validationErrors: string[] = []

    // Must be a SENT transaction (not received)
    if (aiResult.direction === 'received') {
      validationErrors.push('This screenshot shows money being received, not sent.')
    }

    // Recipient number must match your account
    const recipientNormalized = aiResult.recipient_number?.replace(/\s|-/g, '') ?? ''
    const recipientValid = VALID_RECIPIENT_NUMBERS.some(n => 
      recipientNormalized.includes(n.replace(/\s|-/g, ''))
    )
    if (aiResult.recipient_number && !recipientValid) {
      validationErrors.push(`Payment was sent to wrong account (${aiResult.recipient_number}). Please send to the correct EasyPaisa number.`)
    }

    // Amount must be within tolerance
    if (aiResult.amount !== null && aiResult.amount !== undefined) {
      if (aiResult.amount < PRICE_TOLERANCE_LOW) {
        validationErrors.push(`Amount Rs. ${aiResult.amount} is less than required Rs. ${COURSE_PRICE}. Please send the correct amount.`)
      } else if (aiResult.amount > PRICE_TOLERANCE_HIGH) {
        validationErrors.push(`Amount Rs. ${aiResult.amount} seems too high. Please contact us on WhatsApp.`)
      }
    }

    // Payment must be successful
    if (aiResult.status === 'failed') {
      validationErrors.push('This transaction shows as failed. Please complete the payment and upload a successful receipt.')
    }
    if (aiResult.status === 'pending') {
      validationErrors.push('This transaction is still pending. Please wait for it to complete and then upload the receipt.')
    }

    // Check transaction ID for duplicates (in addition to image hash)
    if (aiResult.transaction_id) {
      const { data: txDup } = await supabaseAdmin
        .from('payments')
        .select('id')
        .eq('transaction_id', aiResult.transaction_id)
        .maybeSingle()

      if (txDup) {
        validationErrors.push('This transaction ID has already been used. Please contact us on WhatsApp if you think this is an error.')
      }
    }

    const isValid = aiResult.valid && validationErrors.length === 0

    return NextResponse.json({
      valid: isValid,
      imageHash,
      aiResult,
      senderName: aiResult.sender_name,
      amount: aiResult.amount,
      transactionId: aiResult.transaction_id,
      recipientNumber: aiResult.recipient_number,
      direction: aiResult.direction,
      reason: validationErrors.length > 0
        ? validationErrors[0]
        : (!isValid ? aiResult.reason : null),
    })
  } catch (err) {
    console.error('[POST /api/verify-screenshot]', err)
    return NextResponse.json({
      valid: false,
      reason: err instanceof Error ? `System Error: ${err.message}` : 'Verification failed. Please try again or contact support.',
    }, { status: 500 })
  }
}
