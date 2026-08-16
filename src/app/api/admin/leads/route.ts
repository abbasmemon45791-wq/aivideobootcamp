import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

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
    .maybeSingle()
  return !!data
}

// ── GET: all leads with payment data ─────────────────────────────────────
export async function GET(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const status = url.searchParams.get('status')
  const search = url.searchParams.get('search')
  const startDate = url.searchParams.get('startDate')
  const endDate = url.searchParams.get('endDate')
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
  
  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,whatsapp.ilike.%${search}%`)
  }

  if (startDate) {
    query = query.gte('created_at', startDate)
  }

  if (endDate) {
    // Add 1 day to include the whole end date
    const end = new Date(endDate)
    end.setDate(end.getDate() + 1)
    query = query.lt('created_at', end.toISOString())
  }

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



  return NextResponse.json({ success: true, status: newLeadStatus })
}
