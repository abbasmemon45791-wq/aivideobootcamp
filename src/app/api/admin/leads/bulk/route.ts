import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { hashData, hashEmailForMeta, hashPhoneForMeta, hashPhoneForGoogle } from '@/lib/tracking'

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
      if (action === 'approve') {
        const { data: leadsToApprove } = await supabaseAdmin
          .from('leads')
          .select('*, payments(id, amount)')
          .in('id', leadIds)
          .neq('status', 'approved')

        if (leadsToApprove) {
          for (const l of leadsToApprove) {
            const wasPaymentSubmitted = l.status === 'payment_submitted'
            const existingPayment = (l.payments as any)?.[0]
            const match = l?.utm_content?.match(/\[amount:(\d+)\]/)
            const coursePrice = existingPayment?.amount ? Number(existingPayment.amount) : (match ? Number(match[1]) : (Number(process.env.COURSE_PRICE) || 1999))

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

            // ── Conversion events ONLY for leads whose purchase was NOT already tracked on SS submission ──
            if (!wasPaymentSubmitted) {
              const transactionId = `lead_${l.id}_${Date.now()}`

              // GA4 Measurement Protocol
              try {
                const GA4_ID     = process.env.NEXT_PUBLIC_GA4_ID || 'G-Y2SZLNREPD'
                const API_SECRET = process.env.GA4_API_SECRET || 'ZCnSzNHmT5Cte3cAOZ8rVQ'

                const gaClientIdFromUtm = l.utm_content?.match(/\[ga:([^\]]+)\]/)?.[1]
                const gaSessionIdFromUtm = l.utm_content?.match(/\[session:([^\]]+)\]/)?.[1]
                const wbraidFromUtm = l.utm_content?.match(/\[wbraid:([^\]]+)\]/)?.[1]
                const gbraidFromUtm = l.utm_content?.match(/\[gbraid:([^\]]+)\]/)?.[1]

                const resolvedClientId = l.ga_client_id || gaClientIdFromUtm || (l.email ? hashData(l.email.toLowerCase().trim()).slice(0, 20) : `admin_${Date.now()}`)
                const resolvedSessionId = l.ga_session_id || gaSessionIdFromUtm
                const resolvedWbraid = l.wbraid || wbraidFromUtm
                const resolvedGbraid = l.gbraid || gbraidFromUtm

                if (GA4_ID && API_SECRET) {
                  const purchaseParams: Record<string, any> = {
                    transaction_id: transactionId,
                    value: coursePrice,
                    currency: 'PKR',
                    ...(l.gclid && { gclid: l.gclid }),
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
                        user_data: {
                          ...(l.email && {
                            sha256_email_address: [hashEmailForMeta(l.email)],
                          }),
                          ...(l.whatsapp && {
                            sha256_phone_number: [hashPhoneForGoogle(l.whatsapp)],
                          }),
                        },
                        events: [{
                          name: 'purchase',
                          params: purchaseParams,
                        }],
                      }),

                    }
                  )
                }
              } catch (ga4Err) {
                console.error('[Bulk Approve] GA4 error:', ga4Err)
              }

              // Meta CAPI
              try {
                const PIXEL_ID     = process.env.NEXT_PUBLIC_FB_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID || '2170349516868440'
                const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || 'EAAVEgSnZBQVcBSEONSoDgGnhf1z2otZBF6EW3M6bttpjSCdqPt8ZCvuMZCZCSY2Wx10mJwxozG2e3HRqJjbgK0rkf48XnmaQVQygU1NvIzQikMOVVzZBYTDALbh4t5O3uZBDtZAS5vrA13vfy3XCMTlsbQb3ZCK11YNntxV5NpIZB4K7nmpp1rOy8kYmFIPqK4aAZDZD'

                if (PIXEL_ID && ACCESS_TOKEN && l.email) {
                  const hashedEmail = hashEmailForMeta(l.email)
                  const hashedPhone = hashPhoneForMeta(l.whatsapp)

                  await fetch(
                    `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
                    {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        data: [{
                          event_name:        'Purchase',
                          event_time:        Math.floor(Date.now() / 1000),
                          action_source:     'website',
                          event_source_url:  `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/enroll`,
                          event_id:          transactionId,
                          user_data: {
                            em: [hashedEmail],
                            ...(hashedPhone && { ph: [hashedPhone] }),
                            ...(l.ip_address && { client_ip_address: l.ip_address }),
                            ...(l.user_agent && { client_user_agent: l.user_agent }),
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
        }
      }

      const updateData: any = { status: action === 'approve' ? 'approved' : 'rejected' }
      const { error } = await supabaseAdmin
        .from('leads')
        .update(updateData)
        .in('id', leadIds)

      if (error) throw error

      if (action === 'reject') {
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

