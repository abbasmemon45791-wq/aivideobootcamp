'use client'
import { useState, useEffect, useCallback } from 'react'
import {
  CheckCircle, XCircle, Clock, Eye, Download, LogOut,
  Users, Wallet, TrendingUp, Filter, RefreshCw, Lock,
  AlertCircle, LoaderCircle, ExternalLink, ChevronDown
} from 'lucide-react'

interface Payment {
  id: string
  screenshot_url?: string
  transaction_id?: string
  amount?: number
  recipient_number?: string
  sender_name?: string
  direction?: string
  ai_verified?: boolean
  ai_result?: Record<string, unknown>
  submitted_at: string
  admin_approved?: boolean
  admin_note?: string
  approved_at?: string
}

interface Lead {
  id: string
  name: string
  email: string
  whatsapp: string
  city?: string
  status: string
  created_at: string
  payments?: Payment[]
}

const STATUS_LABEL: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:           { label: 'Awaiting Payment', color: 'text-slate-500 bg-slate-100', icon: <Clock className="h-3.5 w-3.5" /> },
  payment_submitted: { label: 'Payment Submitted', color: 'text-amber-700 bg-amber-100', icon: <Wallet className="h-3.5 w-3.5" /> },
  approved:          { label: 'Approved', color: 'text-emerald-700 bg-emerald-100', icon: <CheckCircle className="h-3.5 w-3.5" /> },
  rejected:          { label: 'Rejected', color: 'text-red-700 bg-red-100', icon: <XCircle className="h-3.5 w-3.5" /> },
}

// ── Login Page ─────────────────────────────────────────────────────────────
function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw]   = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(null); setLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      })
      if (!res.ok) { setErr('Wrong password.'); return }
      const data = await res.json()
      localStorage.setItem('admin_token', data.token)
      onLogin()
    } finally { setLoading(false) }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl text-white mb-5"
          style={{ background: 'linear-gradient(135deg,#2563eb,#06b6d4)' }}>
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="text-center text-xl font-bold text-slate-900">Admin Access</h1>
        <p className="mt-1 text-center text-sm text-slate-400">TechPulse AI Bootcamp</p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <input type="password" value={pw} onChange={e => setPw(e.target.value)}
            placeholder="Admin password" required autoFocus
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
          {err && <div className="flex items-center gap-2 text-xs font-medium text-red-600"><AlertCircle className="h-4 w-4" />{err}</div>}
          <button type="submit" disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-70"
            style={{ background: 'linear-gradient(135deg,#2563eb,#06b6d4)' }}>
            {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : 'Enter Admin Dashboard'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Lead Row ───────────────────────────────────────────────────────────────
function LeadRow({ lead, token, onUpdate }: { lead: Lead; token: string; onUpdate: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading]   = useState<'approve' | 'reject' | null>(null)
  const [note, setNote]         = useState('')

  const payment = lead.payments?.[0]
  const badge = STATUS_LABEL[lead.status] ?? STATUS_LABEL.pending

  const act = async (action: 'approve' | 'reject') => {
    setLoading(action)
    try {
      await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ leadId: lead.id, paymentId: payment?.id, action, note }),
      })
      onUpdate()
    } finally { setLoading(null) }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      {/* Main row */}
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-900">{lead.name}</span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${badge.color}`}>
              {badge.icon} {badge.label}
            </span>
          </div>
          <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-500">
            <span>{lead.email}</span>
            <a href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
              className="text-emerald-600 hover:underline">{lead.whatsapp}</a>
            {lead.city && <span>{lead.city}</span>}
            <span>{new Date(lead.created_at).toLocaleDateString('en-PK')}</span>
          </div>
          {payment && (
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
              {payment.amount && <span className="text-slate-700">Rs. {payment.amount.toLocaleString()}</span>}
              {payment.recipient_number && <span className="text-slate-500">→ {payment.recipient_number}</span>}
              {payment.transaction_id && <span className="font-mono text-slate-400">{payment.transaction_id}</span>}
              {payment.ai_verified !== undefined && (
                <span className={`font-semibold ${payment.ai_verified ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {payment.ai_verified ? '✓ AI Verified' : '⚠ Not AI Verified'}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {payment?.screenshot_url && (
            <a href={payment.screenshot_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100">
              <Eye className="h-3.5 w-3.5" /> Screenshot
            </a>
          )}
          {lead.status === 'payment_submitted' && (
            <>
              <button onClick={() => act('approve')} disabled={!!loading}
                className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
                {loading === 'approve' ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                Approve
              </button>
              <button onClick={() => act('reject')} disabled={!!loading}
                className="inline-flex items-center gap-1 rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60">
                {loading === 'reject' ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                Reject
              </button>
            </>
          )}
          {lead.status === 'approved' && (
            <a href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${lead.name},\n\nYour payment for the AI Bootcamp has been verified! 🎉\n\nHere is your course access link:\nhttps://your-lms-link.com\n\nHappy learning!`)}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-200">
              <ExternalLink className="h-3.5 w-3.5" /> Send Access
            </a>
          )}
          <button onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100">
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/80 px-4 pb-4 pt-3">
          <div className="grid gap-3 text-xs sm:grid-cols-2">
            <div>
              <div className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] mb-1">Lead Info</div>
              <div className="space-y-0.5 text-slate-700">
                <div><span className="text-slate-400">ID:</span> <span className="font-mono">{lead.id}</span></div>
                <div><span className="text-slate-400">Email:</span> {lead.email}</div>
                <div><span className="text-slate-400">City:</span> {lead.city ?? '—'}</div>
              </div>
            </div>
            {payment && (
              <div>
                <div className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] mb-1">Payment Info</div>
                <div className="space-y-0.5 text-slate-700">
                  <div><span className="text-slate-400">Amount:</span> Rs. {payment.amount?.toLocaleString() ?? '—'}</div>
                  <div><span className="text-slate-400">Recipient:</span> {payment.recipient_number ?? '—'}</div>
                  <div><span className="text-slate-400">Sender:</span> {payment.sender_name ?? '—'}</div>
                  <div><span className="text-slate-400">TX ID:</span> <span className="font-mono">{payment.transaction_id ?? '—'}</span></div>
                  <div><span className="text-slate-400">Direction:</span> {payment.direction ?? '—'}</div>
                  <div><span className="text-slate-400">Submitted:</span> {new Date(payment.submitted_at).toLocaleString('en-PK')}</div>
                </div>
              </div>
            )}
          </div>

          {/* Note field for rejection */}
          {lead.status === 'payment_submitted' && (
            <div className="mt-3">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Admin Note (optional)</label>
              <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
                placeholder="Reason for rejection or any note..."
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Dashboard ──────────────────────────────────────────────────────────────
function Dashboard({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [leads, setLeads]   = useState<Lead[]>([])
  const [total, setTotal]   = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [page, setPage]     = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (filter) params.set('status', filter)
    const res = await fetch(`/api/admin/leads?${params}`, { headers: { 'x-admin-token': token } })
    if (res.status === 401) { onLogout(); return }
    const data = await res.json()
    setLeads(data.leads ?? [])
    setTotal(data.total ?? 0)
    setLoading(false)
  }, [token, filter, page, onLogout])

  useEffect(() => { load() }, [load])

  // Stats
  const submitted  = leads.filter(l => l.status === 'payment_submitted').length
  const approved   = leads.filter(l => l.status === 'approved').length

  const exportCSV = () => {
    const rows = [
      ['Name', 'Email', 'WhatsApp', 'City', 'Status', 'Amount', 'TX ID', 'Enrolled'],
      ...leads.map(l => [
        l.name, l.email, l.whatsapp, l.city ?? '',
        l.status, l.payments?.[0]?.amount ?? '', l.payments?.[0]?.transaction_id ?? '',
        new Date(l.created_at).toLocaleDateString('en-PK'),
      ]),
    ]
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `leads-${new Date().toISOString().slice(0,10)}.csv`; a.click()
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl font-bold text-sm text-white"
              style={{ background: 'linear-gradient(135deg,#2563eb,#06b6d4)' }}>AI</div>
            <div>
              <div className="text-sm font-bold text-slate-900">Admin Dashboard</div>
              <div className="text-[11px] text-slate-400">TechPulse AI Bootcamp</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportCSV}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
            <button onClick={() => load()}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={onLogout}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50">
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Total Leads', val: total, icon: <Users className="h-5 w-5 text-blue-600" />, bg: 'bg-blue-50' },
            { label: 'Pending Review', val: submitted, icon: <Clock className="h-5 w-5 text-amber-600" />, bg: 'bg-amber-50' },
            { label: 'Approved', val: approved, icon: <CheckCircle className="h-5 w-5 text-emerald-600" />, bg: 'bg-emerald-50' },
            { label: 'Revenue (est.)', val: `Rs. ${(approved * 2900).toLocaleString()}`, icon: <TrendingUp className="h-5 w-5 text-purple-600" />, bg: 'bg-purple-50' },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${s.bg}`}>{s.icon}</div>
              <div>
                <div className="text-lg font-bold text-slate-900">{s.val}</div>
                <div className="text-[11px] text-slate-400">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {['', 'pending', 'payment_submitted', 'approved', 'rejected'].map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(1) }}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${filter === f ? 'text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
              style={filter === f ? { background: 'linear-gradient(135deg,#2563eb,#06b6d4)' } : {}}>
              {f === '' ? 'All' : STATUS_LABEL[f]?.label ?? f}
            </button>
          ))}
          <span className="ml-auto text-xs text-slate-400">{total} total</span>
        </div>

        {/* Lead list */}
        <div className="mt-4 space-y-2">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-400">
              <LoaderCircle className="h-5 w-5 animate-spin" /> Loading leads…
            </div>
          )}
          {!loading && leads.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-400">No leads found.</div>
          )}
          {!loading && leads.map(lead => (
            <LeadRow key={lead.id} lead={lead} token={token} onUpdate={load} />
          ))}
        </div>

        {/* Pagination */}
        {total > 50 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40">
              Previous
            </button>
            <span className="text-sm text-slate-500">Page {page}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={leads.length < 50}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40">
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const t = localStorage.getItem('admin_token')
    if (t) setToken(t)
    setReady(true)
  }, [])

  const logout = () => { localStorage.removeItem('admin_token'); setToken(null) }

  if (!ready) return null

  return token
    ? <Dashboard token={token} onLogout={logout} />
    : <AdminLogin onLogin={() => setToken(localStorage.getItem('admin_token')!)} />
}
