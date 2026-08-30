import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'
import type { VerificationResult } from '@/types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Your EasyPaisa / JazzCash / HBL account numbers, titles, and suffixes
const VALID_RECIPIENT_NUMBERS = [
  process.env.NEXT_PUBLIC_EASYPAISA_NUMBER ?? '03458996578',
  process.env.NEXT_PUBLIC_JAZZCASH_NUMBER ?? '03180236635',
  process.env.NEXT_PUBLIC_HBL_ACCOUNT ?? '22567902223303',
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '923180298090',
  '03458996578',
  '03180236635',
  '22567902223303',
  '03180298090',
].filter(Boolean)

const VALID_DIGIT_SUFFIXES = ['6578', '6635', '3303', '8090']
const VALID_TITLES = ['farman', 'ali', 'techpulse', 'tech pulse']

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { fileBase64, contentType, localTime, expectedAmount } = body

    if (!fileBase64 || !contentType?.startsWith('image/')) {
      return NextResponse.json({ valid: false, allowManualSubmission: true, reason: 'Invalid file type.' })
    }

    const defaultPrice = parseInt(process.env.COURSE_PRICE ?? '1999')
    const targetPrice = Number(expectedAmount) || defaultPrice
    const toleranceLow = Math.min(1800, targetPrice - 200)
    const toleranceHigh = Math.max(5000, targetPrice + 1000)

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
        allowManualSubmission: false,
        reason: 'This screenshot has already been submitted. Please send a fresh payment and upload the new receipt.',
        duplicate: true,
      })
    }

    // ── Layer 2: Gemini Flash Vision AI Verification ──────────────────────
    const prompt = `You are a payment verification system for a Pakistani online course.
Analyze this payment screenshot and extract the following information as JSON.

RULES:
- Look for Pakistani mobile payment apps: EasyPaisa, JazzCash, Sadapay, Nayapay, Bank Transfer apps, or Raast
- Identify the direction: was money SENT or RECEIVED by the screenshot owner
- Extract the recipient account number OR recipient name/title (the TO field, e.g. Farman Ali or phone number)
- Extract the exact amount transferred
- Extract the transaction ID or reference number
- Extract the timestamp of the transaction
- Determine if this is a genuine payment receipt. Check if it is a successful transfer receipt.

Return ONLY valid JSON, no markdown, no explanation:
{
  "valid": boolean,
  "platform": "easypaisa" | "jazzcash" | "sadapay" | "nayapay" | "bank_transfer" | "raast" | "unknown",
  "direction": "sent" | "received" | "unknown",
  "recipient_number": "string or null",
  "sender_name": "string or null",
  "amount": number or null,
  "transaction_id": "string or null",
  "date_time": "string or null",
  "status": "successful" | "pending" | "failed" | "unknown",
  "reason": "brief explanation if invalid, null if valid"
}

Expected amount is around PKR ${targetPrice}.
Submitted at local time: ${localTime}`

    // Official production Gemini models
    const FALLBACK_MODELS = [
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-2.0-flash',
      'gemini-1.5-pro'
    ]

    let result
    let lastError
    
    for (const modelName of FALLBACK_MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName })
        result = await model.generateContent([
          prompt,
          { inlineData: { mimeType: contentType, data: fileBase64 } },
        ])
        if (result?.response?.text()) {
          break // Success!
        }
      } catch (e) {
        console.warn(`Model ${modelName} failed, trying next...`, e)
        lastError = e
      }
    }

    if (!result) {
      console.error('[AI Verification] All Gemini models failed:', lastError)
      return NextResponse.json({
        valid: false,
        allowManualSubmission: true,
        imageHash,
        reason: 'Automatic AI check is currently busy. You can submit your screenshot directly for quick manual approval by our team.',
      })
    }

    let aiResult: VerificationResult
    try {
      const text = result.response.text().trim()
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      aiResult = JSON.parse(jsonMatch?.[0] ?? text)
    } catch {
      return NextResponse.json({
        valid: false,
        allowManualSubmission: true,
        imageHash,
        reason: 'Could not automatically scan the screenshot text. You can submit it for manual review.',
      })
    }

    // ── Layer 3: Business Rule Validation ─────────────────────────────────
    const validationErrors: string[] = []

    // Must be a SENT transaction (not received)
    if (aiResult.direction === 'received') {
      validationErrors.push('This screenshot shows money being received, not sent.')
    }

    // Recipient check: accepts full phone number, account title (Farman Ali), or last 4 digits (6578/6635/3303)
    const recipientRaw = (aiResult.recipient_number || '').toLowerCase().trim()
    const recipientDigits = recipientRaw.replace(/\D/g, '')

    let recipientValid = false
    if (!recipientRaw) {
      // Some bank apps only show reference ID and no recipient text - allow manual submission fallback
      recipientValid = true
    } else {
      const matchesFull = VALID_RECIPIENT_NUMBERS.some(n => {
        const cleanN = n.replace(/\D/g, '')
        return cleanN && (recipientDigits.includes(cleanN) || cleanN.includes(recipientDigits))
      })
      const matchesSuffix = VALID_DIGIT_SUFFIXES.some(suffix => recipientDigits.includes(suffix))
      const matchesTitle = VALID_TITLES.some(title => recipientRaw.includes(title))

      recipientValid = matchesFull || matchesSuffix || matchesTitle
    }

    if (recipientRaw && !recipientValid) {
      validationErrors.push(`Payment recipient (${aiResult.recipient_number}) does not match our account (Farman Ali / 03458996578).`)
    }

    // Amount validation
    if (aiResult.amount !== null && aiResult.amount !== undefined) {
      if (aiResult.amount < toleranceLow) {
        validationErrors.push(`Amount Rs. ${aiResult.amount} is less than required Rs. ${targetPrice}.`)
      } else if (aiResult.amount > toleranceHigh) {
        validationErrors.push(`Amount Rs. ${aiResult.amount} seems higher than expected.`)
      }
    }

    // Payment status check
    if (aiResult.status === 'failed') {
      validationErrors.push('This transaction shows as failed. Please upload a completed receipt.')
    }
    if (aiResult.status === 'pending') {
      validationErrors.push('This transaction is still pending in your payment app.')
    }

    // Check transaction ID for duplicates
    if (aiResult.transaction_id) {
      const { data: txDup } = await supabaseAdmin
        .from('payments')
        .select('id')
        .eq('transaction_id', aiResult.transaction_id)
        .maybeSingle()

      if (txDup) {
        validationErrors.push('This transaction ID has already been used on our system.')
      }
    }

    const isValid = aiResult.valid && validationErrors.length === 0

    return NextResponse.json({
      valid: isValid,
      allowManualSubmission: true,
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
      allowManualSubmission: true,
      reason: 'Could not auto-verify image. You can submit for manual team approval.',
    }, { status: 200 })
  }
}
