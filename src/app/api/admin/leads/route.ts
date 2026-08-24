import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import crypto from 'crypto'

const hashData = (data: string) => crypto.createHash('sha256').update(data).digest('hex')

// ── Admin auth ─────────────────────────────────────────────────────────────
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

// ── GET: all leads ─────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const status    = url.searchParams.get('status')
  const source    = url.searchParams.get('source')
  const site      = url.searchParams.get('site')
  const search    = url.searchParams.get('search')
  const startDate = url.searchParams.get('startDate')
  const endDate   = url.searchParams.get('endDate')
  const page      = parseInt(url.searchParams.get('page') ?? '1')
  const limit     = 50
  const offset    = (page - 1) * limit

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
  if (source && source !== 'all') query = query.eq('source', source)
  if (site && site !== 'all') {
    query = query.or(`site.eq.${site},utm_content.ilike.%[site:${site}]%`)
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,whatsapp.ilike.%${search}%`)
  }

  if (startDate) query = query.gte('created_at', startDate)

  if (endDate) {
    const end = new Date(endDate)
    end.setDate(end.getDate() + 1)
    query = query.lt('created_at', end.toISOString())
  }

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ leads: data, total: count, page, limit })
}

// ── POST: approve or reject ────────────────────────────────────────────────
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

  // Fetch lead for conversion data
  const { data: lead } = await supabaseAdmin
    .from('leads')
    .select('id, name, email, whatsapp, gclid, site, utm_content')
    .eq('id', leadId)
    .maybeSingle()

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

  // ── Fire conversion events only on APPROVE ────────────────────────────────
  if (action === 'approve' && lead) {
    const transactionId = `lead_${leadId}_${Date.now()}`
    
    // Determine exact price from payment record or site origin
    let coursePrice = 1999
    if (paymentId) {
      const { data: p } = await supabaseAdmin.from('payments').select('amount').eq('id', paymentId).maybeSingle()
      if (p?.amount && Number(p.amount) > 0) {
        coursePrice = Number(p.amount)
      }
    } else {
      coursePrice = Number(process.env.COURSE_PRICE) || 1999
    }

    // ── 1. GA4 Measurement Protocol (server-side) ─────────────────────────
    try {
      const GA4_ID     = process.env.NEXT_PUBLIC_GA4_ID || 'G-Y2SZLNREPD'
      const API_SECRET = process.env.GA4_API_SECRET || 'ZCnSzNHmT5Cte3cAOZ8rVQ'

      if (GA4_ID && API_SECRET) {
        await fetch(
          `https://www.google-analytics.com/mp/collect?measurement_id=${GA4_ID}&api_secret=${API_SECRET}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              client_id: lead.email
                ? hashData(lead.email.toLowerCase().trim()).slice(0, 20)
                : `admin_${Date.now()}`,
              events: [{
                name: 'purchase',
                params: {
                  transaction_id: transactionId,
                  value: coursePrice,
                  currency: 'PKR',
                  items: [{
                    item_id:   'ai-bootcamp-pk',
                    item_name: process.env.COURSE_NAME || 'AI Video Bootcamp Pakistan',
                    price:     coursePrice,
                    quantity:  1,
                  }],
                },
              }],
              ...(lead.email && {
                user_properties: {
                  email: { value: lead.email },
                },
              }),
            }),
          }
        )
      }
    } catch (ga4Err) {
      console.error('[Admin Approve] GA4 Measurement Protocol error:', ga4Err)
    }

    // ── 2. Facebook CAPI Purchase (server-side) ────────────────────────────
    try {
      const PIXEL_ID     = process.env.NEXT_PUBLIC_FB_PIXEL_ID
      const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN

      if (PIXEL_ID && ACCESS_TOKEN && lead.email) {
        const hashedEmail = hashData(lead.email.toLowerCase().trim())
        const digitsOnly  = lead.whatsapp?.replace(/\D/g, '')
        const hashedPhone = digitsOnly ? hashData(digitsOnly) : undefined

        await fetch(
          `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              data: [{
                event_name:        'Purchase',
                event_time:        Math.floor(Date.now() / 1000),
                action_source:     'other',
                event_source_url:  `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/enroll`,
                event_id:          transactionId,
                user_data: {
                  em: [hashedEmail],
                  ...(hashedPhone && { ph: [hashedPhone] }),
                },
                custom_data: {
                  currency: 'PKR',
                  value:    coursePrice,
                },
              }],
            }),
          }
        )
      }
    } catch (fbErr) {
      console.error('[Admin Approve] FB CAPI error:', fbErr)
    }
  }

  return NextResponse.json({ success: true, status: newLeadStatus })
}
