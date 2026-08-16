import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

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
        const { error: paymentError } = await supabaseAdmin
          .from('payments')
          .update({
            admin_approved: true,
            approved_at: new Date().toISOString(),
            approved_by: 'admin_bulk'
          })
          .in('lead_id', leadIds)
        if (paymentError) throw paymentError
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
