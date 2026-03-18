import { useEffect, useState } from 'react'
import { api } from '../services/api'

export default function Workflows() {
  const [workflows, setWorkflows] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', category: '', status: 'active' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    try {
      setWorkflows(await api.getWorkflows())
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleCreate() {
    if (!form.name.trim()) { setError('Name is required'); return }
    setSaving(true); setError('')
    try {
      await api.createWorkflow(form)
      setShowModal(false)
      setForm({ name: '', description: '', category: '', status: 'active' })
      await load()
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this workflow?')) return
    try { await api.deleteWorkflow(id); await load() }
    catch (err) { alert(err.message) }
  }

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  if (loading) return <div className="page loading-page"><div className="spinner" /></div>

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="page-title">Workflows</div>
          <div className="page-subtitle">{workflows.length} total workflows</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Workflow</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: 14 }}>
        {workflows.map(w => (
          <div key={w.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{w.name}</div>
              <span className={`badge badge-${w.status}`}>{w.status}</span>
            </div>
            {w.description && <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 10, lineHeight: 1.5 }}>{w.description}</div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                {w.category && <span style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 8px' }}>{w.category}</span>}
              </div>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(w.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {workflows.length === 0 && (
        <div className="empty-state"><div className="icon">⟳</div><p>No workflows yet. Create one!</p></div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">New Workflow</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input className="form-input" placeholder="e.g. Expense Approval" value={form.name} onChange={e => f('name', e.target.value)} autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" placeholder="What does this workflow do?" value={form.description} onChange={e => f('description', e.target.value)} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={form.category} onChange={e => f('category', e.target.value)}>
                    <option value="">Select</option>
                    <option value="leave">Leave</option>
                    <option value="expense">Expense</option>
                    <option value="fund">Fund</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={form.status} onChange={e => f('status', e.target.value)}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            {error && <div style={{ background: 'var(--red-dim)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, padding: '10px', fontSize: 13, color: 'var(--red)', marginTop: 14 }}>{error}</div>}
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={saving}>{saving ? 'Creating…' : 'Create Workflow'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}