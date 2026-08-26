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
    .select('*')
    .eq('id', leadId)
    .maybeSingle()

  // Update lead status
  await supabaseAdmin
    .from('leads')
    .update({ status: newLeadStatus })
    .eq('id', leadId)

  // Update or create payment record
  let currentPaymentId = paymentId
  if (!currentPaymentId) {
    const { data: existingPayment } = await supabaseAdmin
      .from('payments')
      .select('id')
      .eq('lead_id', leadId)
      .maybeSingle()

    if (existingPayment) {
      currentPaymentId = existingPayment.id
    }
  }

  let coursePrice = 1999
  if (currentPaymentId) {
    const { data: p } = await supabaseAdmin.from('payments').select('amount').eq('id', currentPaymentId).maybeSingle()
    if (p?.amount && Number(p.amount) > 0) {
      coursePrice = Number(p.amount)
    }
    await supabaseAdmin
      .from('payments')
      .update({
        admin_approved: action === 'approve',
        admin_note: note,
        approved_at: new Date().toISOString(),
        approved_by: 'admin',
      })
      .eq('id', currentPaymentId)
  } else if (action === 'approve') {
    coursePrice = Number(process.env.COURSE_PRICE) || 1999
    await supabaseAdmin
      .from('payments')
      .insert({
        lead_id: leadId,
        amount: coursePrice,
        admin_approved: true,
        admin_note: note,
        approved_at: new Date().toISOString(),
        approved_by: 'admin',
        ai_verified: false,
      })
  }

  // ── Fire conversion events only on APPROVE ────────────────────────────────
  if (action === 'approve' && lead) {
    const transactionId = `lead_${leadId}_${Date.now()}`

    // ── 1. GA4 Measurement Protocol (server-side) ─────────────────────────
    try {
      const GA4_ID     = process.env.NEXT_PUBLIC_GA4_ID || 'G-Y2SZLNREPD'
      const API_SECRET = process.env.GA4_API_SECRET || 'ZCnSzNHmT5Cte3cAOZ8rVQ'

      const gaClientIdFromUtm = lead.utm_content?.match(/\[ga:([^\]]+)\]/)?.[1]
      const gaSessionIdFromUtm = lead.utm_content?.match(/\[session:([^\]]+)\]/)?.[1]
      const wbraidFromUtm = lead.utm_content?.match(/\[wbraid:([^\]]+)\]/)?.[1]
      const gbraidFromUtm = lead.utm_content?.match(/\[gbraid:([^\]]+)\]/)?.[1]

      const resolvedClientId = lead.ga_client_id || gaClientIdFromUtm || (lead.email ? hashData(lead.email.toLowerCase().trim()).slice(0, 20) : `admin_${Date.now()}`)
      const resolvedSessionId = lead.ga_session_id || gaSessionIdFromUtm
      const resolvedWbraid = lead.wbraid || wbraidFromUtm
      const resolvedGbraid = lead.gbraid || gbraidFromUtm

      if (GA4_ID && API_SECRET) {
        const purchaseParams: Record<string, any> = {
          transaction_id: transactionId,
          value: coursePrice,
          currency: 'PKR',
          ...(lead.gclid && { gclid: lead.gclid }),
          ...(resolvedWbraid && { wbraid: resolvedWbraid }),
          ...(resolvedGbraid && { gbraid: resolvedGbraid }),
          items: [{
            item_id:   'ai-bootcamp-pk',
            item_name: process.env.COURSE_NAME || 'AI Video Bootcamp Pakistan',
            price:     coursePrice,
            quantity:  1,
          }],
        }

        // Stitch back to the user's active Google/YouTube ad session in GA4
        if (resolvedSessionId && !isNaN(Number(resolvedSessionId))) {
          purchaseParams.session_id = Number(resolvedSessionId)
          purchaseParams.engagement_time_msec = 100
        }

        await fetch(
          `https://www.google-analytics.com/mp/collect?measurement_id=${GA4_ID}&api_secret=${API_SECRET}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              client_id: resolvedClientId,
              events: [{
                name: 'purchase',
                params: purchaseParams,
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
