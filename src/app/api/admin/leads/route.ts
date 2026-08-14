import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { Resend } from 'resend'

const getResend = () => new Resend(process.env.RESEND_API_KEY ?? 'placeholder')

// ── Admin auth middleware ──────────────────────────────────────────────────
function getAdminToken(req: NextRequest) {
  return req.headers.get('x-admin-token') ?? 
         req.cookies.get('admin_token')?.value
}

async function verifyAdmin(req: NextRequest) {
  const token = getAdminToken(req)
  if (!token) return false
  const { data } = await supabaseAdmin
    .from('admin_sessions')
    .select('token')
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .single()
  return !!data
}

// ── GET: all leads with payment data ─────────────────────────────────────
export async function GET(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const status = url.searchParams.get('status')
  const page = parseInt(url.searchParams.get('page') ?? '1')
  const limit = 50
  const offset = (page - 1) * limit

  let query = supabaseAdmin
    .from('leads')
    .select(`
      *,
      payments (
        id, screenshot_url, transaction_id, amount, recipient_number,
        sender_name, direction, ai_verified, ai_result,
        submitted_at, admin_approved, admin_note, approved_at
      )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) query = query.eq('status', status)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ leads: data, total: count, page, limit })
}

// ── POST: approve or reject a lead ───────────────────────────────────────
export async function POST(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { leadId, paymentId, action, note } = body
  // action: 'approve' | 'reject'

  if (!leadId || !action) {
    return NextResponse.json({ error: 'Missing leadId or action.' }, { status: 400 })
  }

  const newLeadStatus = action === 'approve' ? 'approved' : 'rejected'

  // Update lead status
  await supabaseAdmin
    .from('leads')
    .update({ status: newLeadStatus })
    .eq('id', leadId)

  // Update payment record if paymentId provided
  if (paymentId) {
    await supabaseAdmin
      .from('payments')
      .update({
        admin_approved: action === 'approve',
        admin_note: note,
        approved_at: new Date().toISOString(),
        approved_by: 'admin',
      })
      .eq('id', paymentId)
  }

  // If approved → send access email
  if (action === 'approve') {
    const { data: lead } = await supabaseAdmin
      .from('leads')
      .select('name, email, whatsapp')
      .eq('id', leadId)
      .single()

    if (lead?.email && process.env.RESEND_API_KEY) {
      await getResend().emails.send({
        from: `${process.env.COURSE_NAME ?? 'AI Bootcamp'} <${process.env.FROM_EMAIL ?? 'no-reply@yourdomain.com'}>`,
        to: lead.email,
        subject: `🎉 Your Access is Ready — ${process.env.COURSE_NAME ?? 'AI Bootcamp'}`,
        html: `
          <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
            <h1 style="color: #1e293b;">Welcome aboard, ${lead.name}! 🚀</h1>
            <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
              Your payment has been verified. Here's your access link:
            </p>
            <a href="${process.env.COURSE_ACCESS_LINK ?? '#'}" 
               style="display: inline-block; background: linear-gradient(135deg, #2563eb, #06b6d4);
                      color: white; padding: 16px 32px; border-radius: 50px; 
                      text-decoration: none; font-weight: 600; font-size: 16px; margin: 24px 0;">
              Access Your Course →
            </a>
            <p style="color: #64748b; font-size: 14px;">
              Need help? WhatsApp: <strong>${process.env.WHATSAPP_SUPPORT ?? '+92 XXX XXXXXXX'}</strong>
            </p>
          </div>
        `,
      }).catch(console.error)
    }
  }

  return NextResponse.json({ success: true, status: newLeadStatus })
}
