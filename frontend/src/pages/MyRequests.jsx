import { useEffect, useState } from 'react'
import { useAuth } from '../context/useAuth'
import { api } from '../services/api'

const TYPES = [
  { key: 'leave', label: '📅 Leave', color: 'var(--green)' },
  { key: 'expense', label: '💸 Expense', color: 'var(--yellow)' },
  { key: 'fund', label: '💰 Fund Request', color: 'var(--purple)' },
]

export default function MyRequests() {
  const { user } = useAuth()
  const [workflows, setWorkflows] = useState([])
  const [executions, setExecutions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [reqType, setReqType] = useState('leave')
  const [form, setForm] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const userId = user?.id

  useEffect(() => {
    async function load() {
      try {
        const wf = await api.getWorkflows()
        setWorkflows(wf)
        const all = await Promise.all(wf.map(w => api.getExecutions(w.id).catch(() => [])))
        const mine = all.flat().filter(e => e.triggered_by === userId)
        setExecutions(mine.sort((a, b) => new Date(b.started_at) - new Date(a.started_at)))
      } finally { setLoading(false) }
    }
    load()
  }, [userId])

  async function refreshExecutions(wf) {
    const all = await Promise.all(wf.map(w => api.getExecutions(w.id).catch(() => [])))
    const mine = all.flat().filter(e => e.triggered_by === userId)
    setExecutions(mine.sort((a, b) => new Date(b.started_at) - new Date(a.started_at)))
  }

  function getWorkflowByCategory(cat) {
    return workflows.find(w => w.category?.toLowerCase().includes(cat)) || workflows[0]
  }

  async function handleSubmit() {
    setSubmitting(true); setError('')
    try {
      const wf = getWorkflowByCategory(reqType)
      if (!wf) throw new Error('No workflow found. Ask admin to create one.')
      await api.createExecution({ workflow_id: wf.id, triggered_by: userId, input_data: { type: reqType, ...form } })
      setShowModal(false); setForm({})
      await refreshExecutions(workflows)
    } catch (err) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const filtered = filter === 'all' ? executions : executions.filter(e => e.input_data?.type === filter)

  if (loading) return <div className="page loading-page"><div className="spinner" /></div>

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><div className="page-title">My Requests</div><div className="page-subtitle">Submit and track your requests</div></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Request</button>
      </div>

      <div className="tabs">
        {[{ key: 'all', label: 'All' }, ...TYPES].map(t => (
          <button key={t.key} className={`tab ${filter === t.key ? 'active' : ''}`} onClick={() => setFilter(t.key)}>{t.label}</button>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div className="empty-state"><div className="icon">◫</div><p>No requests found</p></div>
        ) : (
          <table className="table">
            <thead><tr><th>Type</th><th>Details</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map(e => {
                const d = e.input_data || {}
                return (
                  <tr key={e.id}>
                    <td><span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{d.type || 'Request'}</span></td>
                    <td>
                      {d.type === 'leave' && <span>{d.leave_type} · {d.from_date} → {d.to_date}</span>}
                      {d.type === 'expense' && <span>{d.title} · ₹{d.amount}</span>}
                      {d.type === 'fund' && <span>{d.title} · ₹{d.amount}</span>}
                      {!d.type && <span className="text-muted">#{e.id}</span>}
                    </td>
                    <td className="text-muted">{new Date(e.started_at).toLocaleDateString()}</td>
                    <td><span className={`badge badge-${e.status}`}>{e.status}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">New Request</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {TYPES.map(t => (
                <button key={t.key} onClick={() => { setReqType(t.key); setForm({}) }}
                  style={{
                    flex: 1, padding: '8px 4px', borderRadius: 8,
                    border: `1.5px solid ${reqType === t.key ? t.color + '60' : 'var(--border)'}`,
                    background: reqType === t.key ? t.color + '12' : 'var(--surface2)',
                    cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 12, fontWeight: 600,
                    color: reqType === t.key ? t.color : 'var(--text2)', transition: 'all 0.12s'
                  }}>{t.label}</button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {reqType === 'leave' && <>
                <div className="form-group">
                  <label className="form-label">Leave Type</label>
                  <select className="form-select" value={form.leave_type || ''} onChange={e => f('leave_type', e.target.value)}>
                    <option value="">Select type</option>
                    <option>Annual Leave</option><option>Sick Leave</option><option>Personal Leave</option><option>Emergency Leave</option>
                  </select>
                </div>
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">From Date</label><input className="form-input" type="date" value={form.from_date || ''} onChange={e => f('from_date', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">To Date</label><input className="form-input" type="date" value={form.to_date || ''} onChange={e => f('to_date', e.target.value)} /></div>
                </div>
                <div className="form-group"><label className="form-label">Reason</label><textarea className="form-textarea" placeholder="Reason for leave…" value={form.reason || ''} onChange={e => f('reason', e.target.value)} /></div>
              </>}
              {reqType === 'expense' && <>
                <div className="form-group"><label className="form-label">Title</label><input className="form-input" placeholder="Expense title" value={form.title || ''} onChange={e => f('title', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Amount (₹)</label><input className="form-input" type="number" placeholder="0" value={form.amount || ''} onChange={e => f('amount', e.target.value)} /></div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={form.category || ''} onChange={e => f('category', e.target.value)}>
                    <option value="">Select</option><option>Travel</option><option>Food</option><option>Equipment</option><option>Training</option><option>Other</option>
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" placeholder="Details…" value={form.description || ''} onChange={e => f('description', e.target.value)} /></div>
              </>}
              {reqType === 'fund' && <>
                <div className="form-group"><label className="form-label">Title</label><input className="form-input" placeholder="Fund request title" value={form.title || ''} onChange={e => f('title', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Amount (₹)</label><input className="form-input" type="number" placeholder="0" value={form.amount || ''} onChange={e => f('amount', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Department</label><input className="form-input" placeholder="Department" value={form.department || ''} onChange={e => f('department', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Purpose</label><textarea className="form-textarea" placeholder="Purpose…" value={form.purpose || ''} onChange={e => f('purpose', e.target.value)} /></div>
              </>}
            </div>

            {error && <div style={{ background: 'var(--red-dim)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, padding: '10px', fontSize: 13, color: 'var(--red)', marginTop: 14 }}>{error}</div>}
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>{submitting ? 'Submitting…' : 'Submit Request'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}