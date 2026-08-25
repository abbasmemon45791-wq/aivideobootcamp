'use client'
import { useState, useEffect, useCallback } from 'react'
import {
  CheckCircle, XCircle, Clock, Eye, Download, LogOut,
  Users, Wallet, TrendingUp, Filter, RefreshCw, Lock,
  AlertCircle, LoaderCircle, ExternalLink, ChevronDown,
  Monitor, Smartphone, ArrowRight
} from 'lucide-react'

// Simple User Agent parser
const parseUA = (ua?: string) => {
  if (!ua) return { os: 'Unknown', browser: 'Unknown', icon: <Monitor className="h-3 w-3" /> }
  const uaLower = ua.toLowerCase()
  let os = 'Unknown', browser = 'Unknown'
  let icon = <Monitor className="h-3 w-3" />

  if (uaLower.includes('iphone') || uaLower.includes('ipad')) { os = 'iOS'; icon = <Smartphone className="h-3 w-3" /> }
  else if (uaLower.includes('android')) { os = 'Android'; icon = <Smartphone className="h-3 w-3" /> }
  else if (uaLower.includes('mac os')) os = 'macOS'
  else if (uaLower.includes('windows')) os = 'Windows'

  if (uaLower.includes('chrome')) browser = 'Chrome'
  else if (uaLower.includes('safari') && !uaLower.includes('chrome')) browser = 'Safari'
  else if (uaLower.includes('firefox')) browser = 'Firefox'
  else if (uaLower.includes('edge')) browser = 'Edge'

  return { os, browser, icon }
}

const formatWhatsAppNumber = (num: string) => {
  let cleaned = num.replace(/\D/g, '')
  if (cleaned.startsWith('0')) {
    cleaned = '92' + cleaned.substring(1)
  }
  return cleaned
}

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
  source?: string
  site?: string
  utm_content?: string
  status: string
  created_at: string
  access_sent?: boolean
  access_sent_at?: string
  user_agent?: string
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
        <p className="mt-1 text-center text-sm text-slate-400">AI Bootcamp Pakistan</p>
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
function LeadRow({ lead, token, onUpdate, isSelected, onToggleSelect }: { lead: Lead; token: string; onUpdate: () => void; isSelected: boolean; onToggleSelect: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading]   = useState<'approve' | 'reject' | null>(null)
  const [note, setNote]         = useState('')

  const payment = lead.payments?.[0]
  const badge = STATUS_LABEL[lead.status] ?? STATUS_LABEL.pending

  const isSite2 = lead.site === 'techpulse-noss' || lead.utm_content?.includes('[site:techpulse-noss]')

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

  // Source badge color logic
  const sourceColor = lead.source === 'facebook' || lead.source === 'instagram' ? 'bg-blue-100 text-blue-700' :
                      lead.source === 'google' ? 'bg-red-100 text-red-700' :
                      lead.source === 'tiktok' ? 'bg-slate-900 text-white' :
                      lead.source === 'youtube' ? 'bg-red-100 text-red-600' :
                      'bg-slate-100 text-slate-600'

  const markAccessSent = async () => {
    try {
      await fetch(`/api/admin/leads/${lead.id}/send-access`, {
        method: 'POST',
        headers: { 'x-admin-token': token },
      })
      onUpdate()
    } catch (e) {
      console.error('Failed to mark access sent', e)
    }
  }

  const handleSendAccess = () => {
    if (!lead.access_sent) {
      markAccessSent()
    }
    const formattedWa = formatWhatsAppNumber(lead.whatsapp)
    window.open(`https://wa.me/${formattedWa}?text=${encodeURIComponent(`Hi ${lead.name},\n\nYour payment for the AI Bootcamp has been verified! 🎉\n\nHere is your course access link:\nhttps://your-lms-link.com\n\nHappy learning!`)}`, '_blank')
  }

  const uaInfo = parseUA(lead.user_agent)
  const showApproveButtons = isSite2 ? lead.status !== 'approved' : lead.status === 'payment_submitted'

  return (
    <div className={`overflow-hidden rounded-xl border transition shadow-sm hover:shadow-md ${isSelected ? 'border-blue-400 bg-blue-50/30' : 'border-slate-200 bg-white'}`}>
      {/* Main row */}
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <input type="checkbox" checked={isSelected} onChange={() => onToggleSelect(lead.id)}
            className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
          <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-900">{lead.name}</span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${badge.color}`}>
              {badge.icon} {badge.label}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
              isSite2 ? 'bg-cyan-50 text-cyan-700 border border-cyan-200' : 'bg-purple-50 text-purple-700 border border-purple-200'
            }`}>
              {isSite2 ? 'Site 2 (No SS / 1999)' : 'Site 1 (SS / 1999)'}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs text-slate-500">
            <span className="truncate max-w-[120px] sm:max-w-none">{lead.email}</span>
            <a href={`https://wa.me/${formatWhatsAppNumber(lead.whatsapp)}`} target="_blank" rel="noopener noreferrer"
              className="text-emerald-600 hover:underline">{lead.whatsapp}</a>
            {lead.source && (
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${sourceColor}`}>
                {lead.source}
              </span>
            )}
            <span>{new Date(lead.created_at).toLocaleDateString('en-PK')}</span>
          </div>
          {payment && (
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
              {payment.amount && <span className="text-slate-900 font-bold">Paid: Rs. {payment.amount.toLocaleString()}</span>}
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
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 mt-2 sm:mt-0">
          {payment?.screenshot_url && (
            <a href={payment.screenshot_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100">
              <Eye className="h-3.5 w-3.5" /> Screenshot
            </a>
          )}
          {showApproveButtons && (
            <>
              <button onClick={() => act('approve')} disabled={!!loading}
                className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60">
                {loading === 'approve' ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                Approve
              </button>
              {lead.status !== 'rejected' && (
                <button onClick={() => act('reject')} disabled={!!loading}
                  className="inline-flex items-center gap-1 rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-60">
                  {loading === 'reject' ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                  Reject
                </button>
              )}
            </>
          )}
          {lead.status === 'approved' && (
            <button onClick={handleSendAccess}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold ${lead.access_sent ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}>
              <ExternalLink className="h-3.5 w-3.5" /> {lead.access_sent ? 'Access Sent ✓' : 'Send Access'}
            </button>
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
          <div className="grid gap-3 text-xs sm:grid-cols-3">
            <div>
              <div className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] mb-1">Lead Info</div>
              <div className="space-y-0.5 text-slate-700">
                <div><span className="text-slate-400">ID:</span> <span className="font-mono">{lead.id}</span></div>
                <div><span className="text-slate-400">Email:</span> {lead.email}</div>
                <div className="flex items-center gap-1 text-slate-500 mt-1">
                  {uaInfo.icon} {uaInfo.os} • {uaInfo.browser}
                </div>
              </div>
            </div>
            
            {/* Tracking Info */}
            <div>
              <div className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] mb-1">Tracking</div>
              <div className="space-y-0.5 text-slate-700">
                <div><span className="text-slate-400">Source:</span> {lead.source ?? 'direct'}</div>
                <div><span className="text-slate-400">Medium:</span> {(lead as any).utm_medium ?? '—'}</div>
                <div><span className="text-slate-400">Campaign:</span> {(lead as any).utm_campaign ?? '—'}</div>
                <div><span className="text-slate-400">Content:</span> {(lead as any).utm_content ?? '—'}</div>
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
          
          {/* Timeline */}
          <div className="mt-4 border-t border-slate-100 pt-3">
             <div className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] mb-2">Timeline</div>
             <div className="flex items-center gap-2 text-xs text-slate-600 overflow-x-auto pb-2">
               <div className="flex flex-col min-w-max">
                 <span className="font-medium text-slate-900">Registered</span>
                 <span className="text-[10px] text-slate-400">{new Date(lead.created_at).toLocaleString('en-PK', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
               </div>
               {payment?.submitted_at && (
                 <>
                   <ArrowRight className="h-3 w-3 text-slate-300 shrink-0 mx-1" />
                   <div className="flex flex-col min-w-max">
                     <span className="font-medium text-slate-900">Paid</span>
                     <span className="text-[10px] text-slate-400">{new Date(payment.submitted_at).toLocaleString('en-PK', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                   </div>
                 </>
               )}
               {payment?.approved_at && (
                 <>
                   <ArrowRight className="h-3 w-3 text-slate-300 shrink-0 mx-1" />
                   <div className="flex flex-col min-w-max">
                     <span className={`font-medium ${payment.admin_approved ? 'text-emerald-600' : 'text-red-600'}`}>{payment.admin_approved ? 'Approved' : 'Rejected'}</span>
                     <span className="text-[10px] text-slate-400">{new Date(payment.approved_at).toLocaleString('en-PK', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                   </div>
                 </>
               )}
               {lead.access_sent_at && (
                 <>
                   <ArrowRight className="h-3 w-3 text-slate-300 shrink-0 mx-1" />
                   <div className="flex flex-col min-w-max">
                     <span className="font-medium text-blue-600">Access Sent</span>
                     <span className="text-[10px] text-slate-400">{new Date(lead.access_sent_at).toLocaleString('en-PK', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                   </div>
                 </>
               )}
             </div>
          </div>

          {/* Note field for rejection/approval */}
          {showApproveButtons && (
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
  const [funnel, setFunnel] = useState({ registered: 0, paymentSubmitted: 0, approved: 0, rejected: 0, submitted: 0, totalRevenue: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [selectedSource, setSelectedSource] = useState('all')
  const [selectedSite, setSelectedSite] = useState('all')
  const [search, setSearch] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage]     = useState(1)
  
  // Bulk Actions State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkLoading, setBulkLoading] = useState<'approve'|'reject'|'delete'|null>(null)

  const load = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (filter) params.set('status', filter)
    if (selectedSource && selectedSource !== 'all') params.set('source', selectedSource)
    if (selectedSite && selectedSite !== 'all') params.set('site', selectedSite)
    if (search) params.set('search', search)
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)

    try {
      // Load Leads
      const res = await fetch(`/api/admin/leads?${params}`, { headers: { 'x-admin-token': token } })
      if (res.status === 401) { onLogout(); return }
      const data = await res.json()
      setLeads(data.leads ?? [])
      setTotal(data.total ?? 0)

      // Load Funnel Stats
      const funnelParams = new URLSearchParams()
      if (selectedSource && selectedSource !== 'all') funnelParams.set('source', selectedSource)
      if (selectedSite && selectedSite !== 'all') funnelParams.set('site', selectedSite)
      if (startDate) funnelParams.set('startDate', startDate)
      if (endDate) funnelParams.set('endDate', endDate)
      const funnelRes = await fetch(`/api/admin/funnel?${funnelParams}`, { headers: { 'x-admin-token': token } })
      if (funnelRes.ok) {
        setFunnel(await funnelRes.json())
      }
    } finally {
      setLoading(false)
    }
  }, [token, filter, selectedSource, selectedSite, search, startDate, endDate, page, onLogout])

  useEffect(() => { load() }, [load])

  // Real-time polling
  useEffect(() => {
    const interval = setInterval(() => load(true), 30000)
    return () => clearInterval(interval)
  }, [load])

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedIds(newSet)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === leads.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(leads.map(l => l.id)))
  }

  const handleBulkAction = async (action: 'approve' | 'reject' | 'delete') => {
    if (!confirm(`Are you sure you want to ${action} ${selectedIds.size} leads?`)) return
    
    setBulkLoading(action)
    try {
      await fetch('/api/admin/leads/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ leadIds: Array.from(selectedIds), action }),
      })
      setSelectedIds(new Set())
      load()
    } catch (e) {
      console.error(e)
    } finally {
      setBulkLoading(null)
    }
  }

  // Handle Search Submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    load()
  }

  // Stats — sourced from the funnel API (global DB counts, not the current page slice)
  const submitted = funnel.submitted
  const approved  = funnel.approved
  const rejected  = funnel.rejected

  // Source breakdown
  const sources = leads.reduce((acc, lead) => {
    const s = lead.source || 'direct'
    acc[s] = (acc[s] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const exportCSV = () => {
    const rows = [
      ['Name', 'Email', 'WhatsApp', 'Site', 'Source', 'Medium', 'Campaign', 'Content', 'Status', 'Amount', 'TX ID', 'Enrolled'],
      ...leads.map(l => [
        l.name, l.email, l.whatsapp, l.site ?? 'techpulse-replica', l.source ?? 'direct',
        (l as any).utm_medium ?? '', (l as any).utm_campaign ?? '', (l as any).utm_content ?? '',
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
              <div className="text-[11px] text-slate-400">AI Bootcamp Pakistan</div>
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
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {[
            { label: 'Total Leads', val: total, icon: <Users className="h-5 w-5 text-blue-600" />, bg: 'bg-blue-50' },
            { label: 'Pending Review', val: submitted, icon: <Clock className="h-5 w-5 text-amber-600" />, bg: 'bg-amber-50' },
            { label: 'Approved', val: approved, icon: <CheckCircle className="h-5 w-5 text-emerald-600" />, bg: 'bg-emerald-50' },
            { label: 'Rejected', val: rejected, icon: <XCircle className="h-5 w-5 text-red-600" />, bg: 'bg-red-50' },
            { label: 'Revenue (Actual)', val: `Rs. ${(funnel.totalRevenue ?? 0).toLocaleString()}`, icon: <TrendingUp className="h-5 w-5 text-purple-600" />, bg: 'bg-purple-50' },
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

        {/* Funnel */}
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Conversion Funnel {selectedSite !== 'all' ? `[${selectedSite === 'techpulse-noss' ? 'Site 2: No SS' : 'Site 1: SS'}]` : '[All Sites]'} {selectedSource !== 'all' ? `(Source: ${selectedSource})` : ''}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 rounded-lg bg-slate-50 p-3 text-center border border-slate-100">
              <div className="text-xl font-bold text-slate-800">{funnel.registered}</div>
              <div className="text-[10px] uppercase text-slate-400 font-semibold mt-1">1. Registered</div>
            </div>
            <div className="hidden sm:flex items-center justify-center text-slate-300"><ArrowRight className="h-4 w-4" /></div>
            <div className="flex-1 rounded-lg bg-blue-50 p-3 text-center border border-blue-100">
              <div className="text-xl font-bold text-blue-700">{funnel.paymentSubmitted}</div>
              <div className="text-[10px] uppercase text-blue-500 font-semibold mt-1">2. Paid ({funnel.registered ? Math.round(funnel.paymentSubmitted/funnel.registered*100) : 0}%)</div>
            </div>
            <div className="hidden sm:flex items-center justify-center text-slate-300"><ArrowRight className="h-4 w-4" /></div>
            <div className="flex-1 rounded-lg bg-emerald-50 p-3 text-center border border-emerald-100">
              <div className="text-xl font-bold text-emerald-700">{funnel.approved}</div>
              <div className="text-[10px] uppercase text-emerald-600 font-semibold mt-1">3. Approved ({funnel.paymentSubmitted ? Math.round(funnel.approved/funnel.paymentSubmitted*100) : 0}%)</div>
            </div>
          </div>
        </div>

        {/* Source Breakdown */}
        {Object.keys(sources).length > 0 && (
           <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm text-xs">
             <span className="font-semibold text-slate-500 mr-2">Top Sources (page):</span>
             {Object.entries(sources).sort((a,b) => b[1] - a[1]).map(([src, count]) => (
               <button
                 key={src}
                 onClick={() => { setSelectedSource(src); setPage(1) }}
                 className={`capitalize px-2.5 py-1 rounded-full font-medium transition cursor-pointer border ${selectedSource === src ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'}`}
               >
                 {src}: {count}
               </button>
             ))}
           </div>
        )}

        {/* Filters and Search */}
        <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          {/* Top row: Website & Status filters */}
          <div className="flex flex-col gap-3">
            {/* Website Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">Website:</span>
              {[
                { id: 'all', label: 'All Websites' },
                { id: 'techpulse-replica', label: 'Site 1 (SS / Rs. 1,999)' },
                { id: 'techpulse-noss', label: 'Site 2 (No SS / Rs. 1,999)' }
              ].map(s => (
                <button key={s.id} onClick={() => { setSelectedSite(s.id); setPage(1) }}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition ${selectedSite === s.id ? 'bg-blue-600 text-white shadow-sm' : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                  {s.label}
                </button>
              ))}
            </div>

            {/* Status & Source Filter Pills */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between border-t border-slate-100 pt-2.5">
              {/* Status Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">Status:</span>
                {['', 'pending', 'payment_submitted', 'approved', 'rejected'].map(f => (
                  <button key={f} onClick={() => { setFilter(f); setPage(1) }}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${filter === f ? 'text-white shadow-sm' : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                    style={filter === f ? { background: 'linear-gradient(135deg,#2563eb,#06b6d4)' } : {}}>
                    {f === '' ? 'All' : STATUS_LABEL[f]?.label ?? f}
                  </button>
                ))}
              </div>

              {/* Source Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">Source:</span>
                {[
                  { id: 'all', label: 'All' },
                  { id: 'google', label: 'Google' },
                  { id: 'facebook', label: 'Meta' },
                  { id: 'tiktok', label: 'TikTok' },
                  { id: 'youtube', label: 'YouTube' },
                  { id: 'direct', label: 'Direct' }
                ].map(s => (
                  <button key={s.id} onClick={() => { setSelectedSource(s.id); setPage(1) }}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${selectedSource === s.id ? 'bg-slate-900 text-white shadow-sm' : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom row: Dates & Search */}
          <form onSubmit={handleSearch} className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
             <div className="flex flex-wrap items-center gap-2">
               <span className="text-xs font-medium text-slate-500">Date:</span>
               <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs outline-none focus:border-blue-500" />
               <span className="text-xs text-slate-400">to</span>
               <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs outline-none focus:border-blue-500" />
               {(startDate || endDate || filter || (selectedSource !== 'all') || (selectedSite !== 'all') || search) && (
                 <button type="button" onClick={() => { setStartDate(''); setEndDate(''); setFilter(''); setSelectedSource('all'); setSelectedSite('all'); setSearch(''); setPage(1); }} className="text-xs text-rose-600 font-semibold hover:underline ml-1">
                   Clear All Filters
                 </button>
               )}
             </div>

             <div className="flex items-center gap-2">
               <input type="text" placeholder="Search name, email, phone..." value={search} onChange={e => setSearch(e.target.value)} className="w-52 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs outline-none focus:border-blue-500" />
               <button type="submit" className="rounded-lg bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-700">Search</button>
             </div>
          </form>
        </div>
        
        <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
          <label className="flex items-center gap-2 font-medium text-slate-600 cursor-pointer">
            <input type="checkbox" onChange={toggleSelectAll} checked={leads.length > 0 && selectedIds.size === leads.length} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            Select All
          </label>
          <span>{total} total records found</span>
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
            <LeadRow key={lead.id} lead={lead} token={token} onUpdate={load} isSelected={selectedIds.has(lead.id)} onToggleSelect={toggleSelect} />
          ))}
        </div>
        
        {/* Bulk Action Bar */}
        {selectedIds.size > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-3 rounded-full shadow-2xl flex items-center gap-4 z-50">
            <span className="text-sm font-semibold pl-2">{selectedIds.size} selected</span>
            <div className="flex items-center gap-2">
              <button onClick={() => handleBulkAction('approve')} disabled={!!bulkLoading} className="bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 disabled:opacity-50">
                {bulkLoading === 'approve' ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />} Approve
              </button>
              <button onClick={() => handleBulkAction('reject')} disabled={!!bulkLoading} className="bg-amber-600 hover:bg-amber-500 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 disabled:opacity-50">
                {bulkLoading === 'reject' ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />} Reject
              </button>
              <button onClick={() => handleBulkAction('delete')} disabled={!!bulkLoading} className="bg-red-600 hover:bg-red-500 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 disabled:opacity-50">
                {bulkLoading === 'delete' ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <AlertCircle className="h-3.5 w-3.5" />} Delete
              </button>
            </div>
          </div>
        )}

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
