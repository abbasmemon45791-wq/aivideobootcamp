import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { password } = body

  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) {
    return NextResponse.json({ error: 'Admin not configured.' }, { status: 500 })
  }

  if (password !== adminPassword) {
    return NextResponse.json({ error: 'Wrong password.' }, { status: 401 })
  }

  const token = crypto.randomBytes(32).toString('hex')

  await supabaseAdmin.from('admin_sessions').insert({
    token,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  })

  const res = NextResponse.json({ success: true, token })
  res.cookies.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  })
  return res
}
