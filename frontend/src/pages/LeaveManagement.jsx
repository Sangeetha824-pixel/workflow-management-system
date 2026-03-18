import { useEffect, useState } from 'react'
import { api } from '../services/api'

export default function LeaveManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [newBalance, setNewBalance] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.getUsers().then(setUsers).catch(() => {}).finally(() => setLoading(false))
  }, [])

  async function saveBalance(id) {
    setSaving(true)
    try {
      await api.updateUser(id, { leave_balance: parseInt(newBalance) })
      setUsers(prev => prev.map(u => u.id === id ? { ...u, leave_balance: parseInt(newBalance) } : u))
      setEditing(null)
    } catch (err) { alert(err.message) }
    finally { setSaving(false) }
  }

  if (loading) return <div className="page loading-page"><div className="spinner" /></div>

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">Leave Management</div>
        <div className="page-subtitle">Manage employee leave balances</div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead><tr><th>Employee</th><th>Department</th><th>Leave Balance</th><th>Usage</th><th>Action</th></tr></thead>
          <tbody>
            {users.map(u => {
              const pct = Math.max(0, Math.min(100, ((u.leave_balance ?? 20) / 20) * 100))
              const color = pct > 60 ? 'var(--green)' : pct > 30 ? 'var(--yellow)' : 'var(--red)'
              return (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontWeight: 500, color: 'var(--text)' }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{u.email}</div>
                  </td>
                  <td className="text-muted">{u.department || '—'}</td>
                  <td>
                    {editing === u.id ? (
                      <input className="form-input" type="number" min="0" max="30"
                        value={newBalance} onChange={e => setNewBalance(e.target.value)}
                        style={{ width: 80 }} autoFocus />
                    ) : (
                      <span style={{ fontFamily: 'var(--mono)', fontWeight: 600, color }}>{u.leave_balance ?? 20} days</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 80, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text3)' }}>{Math.round(pct)}%</span>
                    </div>
                  </td>
                  <td>
                    {editing === u.id ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-success btn-sm" onClick={() => saveBalance(u.id)} disabled={saving}>{saving ? '…' : 'Save'}</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>Cancel</button>
                      </div>
                    ) : (
                      <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(u.id); setNewBalance(u.leave_balance ?? 20) }}>Edit</button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}