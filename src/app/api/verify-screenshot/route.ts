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
    const prompt = `You are an automated payment verification system for a Pakistani online course.
Analyze this uploaded image carefully and extract structured information as JSON.

CRITICAL FIRST CHECK (IMAGE CLASSIFICATION):
- Determine what type of image this is:
  1. "payment_receipt": An actual mobile wallet / banking app transaction receipt (EasyPaisa, JazzCash, Sadapay, Nayapay, Bank Transfer, Raast, ATM slip, etc.) showing money transferred.
  2. "selfie_or_face": A selfie, portrait, photograph of a human face/person, camera selfie, avatar, or passport-style photo.
  3. "id_card_or_document": A CNIC, ID card, driving license, passport, certificate, or non-payment document.
  4. "random_photo": A nature photo, meme, screenshot of chats, wallpaper, car, building, or irrelevant picture.
  5. "other": Anything else not matching above.

RULES FOR PAYMENT RECEIPTS:
- Look for Pakistani mobile payment apps: EasyPaisa, JazzCash, Sadapay, Nayapay, Bank Transfer apps (HBL, Meezan, Alfalah, etc.), or Raast
- Identify the direction: was money SENT or RECEIVED by the screenshot owner
- Extract the recipient account number OR recipient name/title (the TO field, e.g. Farman Ali or phone number)
- Extract the exact amount transferred (e.g. 1999, 2498, 3497, etc.)
- Extract the transaction ID / reference number / TRX ID / TID
- Extract the timestamp of the transaction
- Determine if this is a genuine successful payment receipt

Return ONLY valid JSON without markdown code fences or explanation:
{
  "image_type": "payment_receipt" | "selfie_or_face" | "id_card_or_document" | "random_photo" | "other",
  "is_human_photo": boolean,
  "is_payment_receipt": boolean,
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

    // Production Gemini models in priority order
    const FALLBACK_MODELS = [
      'gemini-1.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash-8b',
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
        urdu_reason: 'آٹومیٹک اسکیننگ سسٹم مصروف ہے۔ آپ دستی تصدیق کے لیے جمع کروا سکتے ہیں۔',
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
        urdu_reason: 'اسکرین شاٹ کا متن خودکار طریقے سے نہیں پڑھا جا سکا۔ آپ دستی تصدیق کے لیے بھیج سکتے ہیں۔',
      })
    }

    // ── Layer 3: Image Classification Checks ─────────────────────────────
    // HARD REJECTION: Selfies, Face Photos, Personal Pictures
    if (aiResult.is_human_photo || aiResult.image_type === 'selfie_or_face') {
      return NextResponse.json({
        valid: false,
        allowManualSubmission: false,
        imageHash,
        image_type: 'selfie_or_face',
        rejection_code: 'SELFIE_DETECTED',
        reason: 'Personal photo / selfie detected. Please do NOT upload personal photos. Please upload your EasyPaisa, JazzCash, or Bank payment transfer screenshot from your gallery.',
        urdu_reason: 'یہ آپ کی ذاتی تصویر/سیلفی ہے۔ براہ کرم اپنی تصویر مت لگائیں — ایزی پیسہ یا جاز کیش سے فیس بھیجنے کے بعد آنے والی رسید کا اسکرین شاٹ لگائیں۔',
      })
    }

    // HARD REJECTION: ID Cards, Documents, Random Photos
    if (aiResult.image_type === 'id_card_or_document') {
      return NextResponse.json({
        valid: false,
        allowManualSubmission: false,
        imageHash,
        image_type: 'id_card_or_document',
        rejection_code: 'NOT_A_RECEIPT',
        reason: 'Identity card or document detected. Please upload your payment transfer receipt (EasyPaisa / JazzCash / Bank slip).',
        urdu_reason: 'شناختی کارڈ یا دستاویز نہیں چلے گی۔ براہ کرم پیمنٹ ٹرانسفر کی رسید لگائیں۔',
      })
    }

    if (aiResult.image_type === 'random_photo' || (aiResult.is_payment_receipt === false && !aiResult.valid)) {
      return NextResponse.json({
        valid: false,
        allowManualSubmission: false,
        imageHash,
        image_type: 'random_photo',
        rejection_code: 'NOT_A_RECEIPT',
        reason: 'The uploaded image is not a payment receipt. Please upload a clear screenshot of your EasyPaisa, JazzCash, or Bank transfer.',
        urdu_reason: 'یہ تصویر ادائیگی کی رسید نہیں ہے۔ براہ کرم اپنی فیس ٹرانسفر کا واضح اسکرین شاٹ اپلوڈ کریں۔',
      })
    }

    // ── Layer 4: Business Rule Validation for Payment Receipts ────────────
    const validationErrors: string[] = []
    let urduReason = ''

    // Must be a SENT transaction (not received)
    if (aiResult.direction === 'received') {
      validationErrors.push('This screenshot shows money being received, not sent.')
      urduReason = 'یہ اسکرین شاٹ رقم موصول ہونے کا ہے، بھیجنے کا نہیں۔'
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
      urduReason = `رقم ہمارے اکاؤنٹ (Farman Ali / 03458996578) پر منتقل نہیں کی گئی۔`
    }

    // Amount validation
    if (aiResult.amount !== null && aiResult.amount !== undefined) {
      if (aiResult.amount < toleranceLow) {
        validationErrors.push(`Amount Rs. ${aiResult.amount} is less than required Rs. ${targetPrice}.`)
        urduReason = `رقم (Rs. ${aiResult.amount}) مطلوبہ فیس (Rs. ${targetPrice}) سے کم ہے۔`
      } else if (aiResult.amount > toleranceHigh) {
        validationErrors.push(`Amount Rs. ${aiResult.amount} seems higher than expected.`)
      }
    }

    // Payment status check
    if (aiResult.status === 'failed') {
      validationErrors.push('This transaction shows as failed. Please upload a completed receipt.')
      urduReason = 'یہ ٹرانزیکشن ناکام (Failed) ہو چکی ہے۔ براہ کرم کامیاب رسید لگائیں۔'
    }
    if (aiResult.status === 'pending') {
      validationErrors.push('This transaction is still pending in your payment app.')
      urduReason = 'یہ ٹرانزیکشن ابھی پینڈنگ (Pending) ہے۔'
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
        urduReason = 'یہ ٹرانزیکشن آئی ڈی پہلے ہی استعمال ہو چکی ہے۔'
      }
    }

    const isValid = aiResult.valid && validationErrors.length === 0

    return NextResponse.json({
      valid: isValid,
      allowManualSubmission: true,
      imageHash,
      image_type: aiResult.image_type || 'payment_receipt',
      is_human_photo: aiResult.is_human_photo ?? false,
      is_payment_receipt: aiResult.is_payment_receipt ?? true,
      aiResult,
      senderName: aiResult.sender_name,
      amount: aiResult.amount,
      transactionId: aiResult.transaction_id,
      recipientNumber: aiResult.recipient_number,
      direction: aiResult.direction,
      urdu_reason: urduReason || (!isValid ? aiResult.urdu_reason : undefined),
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
      urdu_reason: 'تصویر خودکار طریقے سے اسکین نہیں ہو سکی۔ آپ مینوئل ریویو کے لیے بھیج سکتے ہیں۔',
    }, { status: 200 })
  }
}
