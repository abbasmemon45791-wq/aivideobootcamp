import crypto from 'crypto'

export const hashData = (data: string) =>
  crypto.createHash('sha256').update(data).digest('hex')

/**
 * Normalizes a phone number for Meta Ads CAPI / SHA256 hashing.
 * Meta requires country code without '+' or leading zeros (e.g., 923180236635).
 */
export function normalizePhoneForMeta(phone?: string | null): string {
  if (!phone) return ''
  let digits = phone.replace(/\D/g, '')
  if (digits.startsWith('0')) {
    digits = '92' + digits.slice(1)
  } else if (digits.length === 10 && digits.startsWith('3')) {
    digits = '92' + digits
  }
  return digits
}

export function hashPhoneForMeta(phone?: string | null): string | undefined {
  const normalized = normalizePhoneForMeta(phone)
  return normalized ? hashData(normalized) : undefined
}

export function hashEmailForMeta(email?: string | null): string {
  if (!email) return ''
  return hashData(email.toLowerCase().trim())
}

/**
 * Normalizes a phone number to E.164 format for Google Enhanced Conversions (e.g. +923180298090).
 */
export function normalizePhoneForGoogle(phone?: string | null): string {
  const metaDigits = normalizePhoneForMeta(phone)
  return metaDigits ? `+${metaDigits}` : ''
}

export function hashPhoneForGoogle(phone?: string | null): string | undefined {
  const e164 = normalizePhoneForGoogle(phone)
  return e164 ? hashData(e164) : undefined
}
