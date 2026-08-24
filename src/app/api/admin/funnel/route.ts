import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const token = req.headers.get('x-admin-token') ?? req.cookies.get('admin_token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: session } = await supabaseAdmin
    .from('admin_sessions')
    .select('*')
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const source = searchParams.get('source')
    const site = searchParams.get('site')

    let query = supabaseAdmin
      .from('leads')
      .select(`
        id, status, created_at, source, site, utm_content,
        payments (
          amount, admin_approved
        )
      `)

    if (source && source !== 'all') {
      query = query.eq('source', source)
    }
    if (site && site !== 'all') {
      query = query.or(`site.eq.${site},utm_content.ilike.%[site:${site}]%`)
    }
    if (startDate) {
      query = query.gte('created_at', new Date(startDate).toISOString())
    }
    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      query = query.lte('created_at', end.toISOString())
    }

    const { data: leads, error } = await query

    if (error) throw error

    // Calculate funnel metrics
    const registered = leads.length
    const paymentSubmitted = leads.filter(l => ['payment_submitted', 'approved', 'rejected'].includes(l.status)).length
    const approvedLeads = leads.filter(l => l.status === 'approved')
    const approved = approvedLeads.length
    const rejected = leads.filter(l => l.status === 'rejected').length
    const submitted = leads.filter(l => l.status === 'payment_submitted').length

    // Dynamic total revenue: sum exact amount recorded on approved payments
    let totalRevenue = 0
    approvedLeads.forEach(l => {
      const p = l.payments?.[0]
      if (p?.amount && Number(p.amount) > 0) {
        totalRevenue += Number(p.amount)
      } else {
        // Fallback if payment record had no custom amount
        totalRevenue += 1999
      }
    })

    return NextResponse.json({
      registered,
      paymentSubmitted,
      approved,
      rejected,
      submitted,
      totalRevenue,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
