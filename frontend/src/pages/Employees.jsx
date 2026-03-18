import { useEffect, useState } from 'react'
import { api } from '../services/api'

const ROLE_COLOR = { admin: 'var(--red)', hr: 'var(--purple)', manager: 'var(--yellow)', employee: 'var(--accent)' }

export default function Employees() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  useEffect(() => {
    api.getUsers().then(setUsers).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const filtered = users.filter(u => {
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })

  if (loading) return <div className="page loading-page"><div className="spinner" /></div>

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">Employees</div>
        <div className="page-subtitle">{users.length} total members</div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <div className="search-bar" style={{ flex: 1 }}>
          <span style={{ color: 'var(--text3)' }}>🔍</span>
          <input placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ width: 150 }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="hr">HR</option>
          <option value="manager">Manager</option>
          <option value="employee">Employee</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div className="empty-state"><div className="icon">◈</div><p>No employees found</p></div>
        ) : (
          <table className="table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Leave Balance</th></tr></thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: (ROLE_COLOR[u.role] || 'var(--accent)') + '18',
                        border: `1.5px solid ${(ROLE_COLOR[u.role] || 'var(--accent)') + '40'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700, color: ROLE_COLOR[u.role] || 'var(--accent)', flexShrink: 0
                      }}>{u.name?.[0]?.toUpperCase()}</div>
                      <span style={{ fontWeight: 500, color: 'var(--text)' }}>{u.name}</span>
                    </div>
                  </td>
                  <td className="text-muted">{u.email}</td>
                  <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                  <td className="text-muted">{u.department || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 60, height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.max(0, (u.leave_balance / 20) * 100)}%`, background: u.leave_balance > 10 ? 'var(--green)' : u.leave_balance > 5 ? 'var(--yellow)' : 'var(--red)', borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text2)', fontFamily: 'var(--mono)' }}>{u.leave_balance ?? 20}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}