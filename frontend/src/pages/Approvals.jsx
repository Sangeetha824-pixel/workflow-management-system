import { useEffect, useState } from 'react'
import { api } from '../services/api'

const TABS = [
  { key: 'all', label: 'All Pending' },
  { key: 'leave', label: '📅 Leave' },
  { key: 'expense', label: '💸 Expense' },
  { key: 'fund', label: '💰 Fund' },
]

export default function Approvals() {
  const [executions, setExecutions] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const [acting, setActing] = useState(null)

  async function load() {
    try {
      const all = await api.getAllExecutions()
      const pending = all.filter(e => e.status === 'pending' || e.status === 'running')
      setExecutions(pending.sort((a, b) => new Date(b.started_at) - new Date(a.started_at)))
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function act(id, status) {
    setActing(id)
    try {
      await api.updateExecutionStatus(id, { status, result: `${status} by manager` })
      await load()
    } catch (err) { alert(err.message) }
    finally { setActing(null) }
  }

  const filtered = tab === 'all' ? executions : executions.filter(e => e.input_data?.type === tab)

  if (loading) return <div className="page loading-page"><div className="spinner" /></div>

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">Approvals</div>
        <div className="page-subtitle">{executions.length} pending request{executions.length !== 1 ? 's' : ''}</div>
      </div>

      <div className="tabs">
        {TABS.map(t => (
          <button key={t.key} className={`tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label} {t.key !== 'all' && <span style={{ marginLeft: 4, fontSize: 10, background: 'var(--surface2)', borderRadius: 4, padding: '1px 5px' }}>{executions.filter(e => e.input_data?.type === t.key).length}</span>}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div className="empty-state"><div className="icon">✓</div><p>No pending approvals</p></div>
        ) : (
          <table className="table">
            <thead><tr><th>Request</th><th>Details</th><th>Submitted</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(e => {
                const d = e.input_data || {}
                return (
                  <tr key={e.id}>
                    <td>
                      <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{d.type || 'Request'} #{e.id}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>User #{e.triggered_by || '—'}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13 }}>
                        {d.type === 'leave' && `${d.leave_type || 'Leave'} · ${d.from_date || ''} → ${d.to_date || ''}`}
                        {d.type === 'expense' && `${d.title || 'Expense'} · ₹${d.amount || 0}`}
                        {d.type === 'fund' && `${d.title || 'Fund'} · ₹${d.amount || 0}`}
                        {!d.type && `Execution #${e.id}`}
                      </div>
                      {d.reason && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{d.reason}</div>}
                    </td>
                    <td className="text-muted text-sm">{new Date(e.started_at).toLocaleDateString()}</td>
                    <td><span className={`badge badge-${e.status}`}>{e.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-success btn-sm" disabled={acting === e.id}
                          onClick={() => act(e.id, 'approved')}>
                          {acting === e.id ? '…' : '✓ Approve'}
                        </button>
                        <button className="btn btn-danger btn-sm" disabled={acting === e.id}
                          onClick={() => act(e.id, 'rejected')}>
                          ✕ Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}