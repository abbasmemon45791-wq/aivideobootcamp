import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
const hashData = (data: string) => crypto.createHash('sha256').update(data).digest('hex')

export async function POST(req: NextRequest) {
  const token = req.headers.get('x-admin-token')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify token
  const { data: session } = await supabaseAdmin
    .from('admin_sessions')
    .select('*')
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { leadIds, action } = await req.json()
    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json({ error: 'No lead IDs provided' }, { status: 400 })
    }

    if (!['approve', 'reject', 'delete'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    if (action === 'delete') {
      const { error } = await supabaseAdmin
        .from('leads')
        .delete()
        .in('id', leadIds)
      
      if (error) throw error
    } else {
      const updateData: any = { status: action === 'approve' ? 'approved' : 'rejected' }
      const { error } = await supabaseAdmin
        .from('leads')
        .update(updateData)
        .in('id', leadIds)

      if (error) throw error

      if (action === 'approve') {
        const { data: leadsToApprove } = await supabaseAdmin
          .from('leads')
          .select('id, name, email, whatsapp, site, utm_content, payments(id, amount)')
          .in('id', leadIds)

        if (leadsToApprove) {
          for (const l of leadsToApprove) {
            const existingPayment = (l.payments as any)?.[0]
            const coursePrice = existingPayment?.amount ? Number(existingPayment.amount) : (Number(process.env.COURSE_PRICE) || 1999)

            if (existingPayment?.id) {
              await supabaseAdmin
                .from('payments')
                .update({
                  admin_approved: true,
                  approved_at: new Date().toISOString(),
                  approved_by: 'admin_bulk'
                })
                .eq('id', existingPayment.id)
            } else {
              await supabaseAdmin
                .from('payments')
                .insert({
                  lead_id: l.id,
                  amount: coursePrice,
                  admin_approved: true,
                  approved_at: new Date().toISOString(),
                  approved_by: 'admin_bulk',
                  ai_verified: false
                })
            }

            // ── Conversion events for each approved lead ──
            const transactionId = `lead_${l.id}_${Date.now()}`

            // GA4 Measurement Protocol
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
                      client_id: l.email
                        ? hashData(l.email.toLowerCase().trim()).slice(0, 20)
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
                      ...(l.email && {
                        user_properties: {
                          email: { value: l.email },
                        },
                      }),
                    }),
                  }
                )
              }
            } catch (ga4Err) {
              console.error('[Bulk Approve] GA4 error:', ga4Err)
            }

            // Meta CAPI
            try {
              const PIXEL_ID     = process.env.NEXT_PUBLIC_FB_PIXEL_ID
              const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN

              if (PIXEL_ID && ACCESS_TOKEN && l.email) {
                const hashedEmail = hashData(l.email.toLowerCase().trim())
                const digitsOnly  = l.whatsapp?.replace(/\D/g, '')
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
              console.error('[Bulk Approve] FB CAPI error:', fbErr)
            }
          }
        }
      } else if (action === 'reject') {
        const { error: paymentError } = await supabaseAdmin
          .from('payments')
          .update({
            admin_approved: false,
            admin_note: 'Bulk rejected by admin',
            approved_at: new Date().toISOString(),
            approved_by: 'admin_bulk'
          })
          .in('lead_id', leadIds)
        if (paymentError) throw paymentError
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
