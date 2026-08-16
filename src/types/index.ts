export interface Lead {
  id: string
  name: string
  email: string
  whatsapp: string
  source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  user_agent?: string
  ip_address?: string
  status: 'pending' | 'payment_submitted' | 'approved' | 'rejected'
  created_at: string
  access_sent?: boolean
  access_sent_at?: string
}

export interface Payment {
  id: string
  lead_id: string
  screenshot_url?: string
  image_hash?: string
  transaction_id?: string
  amount?: number
  recipient_number?: string
  sender_name?: string
  direction?: 'sent' | 'received' | 'unknown'
  ai_verified: boolean
  ai_result?: VerificationResult
  submitted_at: string
  admin_approved?: boolean
  admin_note?: string
  approved_at?: string
  approved_by?: string
}

export interface LeadWithPayment extends Lead {
  payments?: Payment[]
}

export interface VerificationResult {
  valid: boolean
  recipient_number?: string
  amount?: number
  transaction_id?: string
  sender_name?: string
  direction?: 'sent' | 'received' | 'unknown'
  status?: string
  platform?: 'easypaisa' | 'jazzcash' | 'bank_transfer' | 'sadapay' | 'unknown'
  date_time?: string
  reason?: string
}

export interface EnrollFormData {
  name: string
  email: string
  whatsapp: string
  source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
}
