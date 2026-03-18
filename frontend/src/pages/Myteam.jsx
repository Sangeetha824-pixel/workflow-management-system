import { useEffect, useState } from 'react'
import { api } from '../services/api'

const ROLE_COLOR = { admin: 'var(--red)', hr: 'var(--purple)', manager: 'var(--yellow)', employee: 'var(--accent)' }

export default function MyTeam() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getUsers()
      .then(data => setUsers(data.filter(u => u.role === 'employee' || u.role === 'manager')))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const byDept = users.reduce((acc, u) => {
    const dept = u.department || 'General'
    if (!acc[dept]) acc[dept] = []
    acc[dept].push(u)
    return acc
  }, {})

  if (loading) return <div className="page loading-page"><div className="spinner" /></div>

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">My Team</div>
        <div className="page-subtitle">{users.length} team members across {Object.keys(byDept).length} departments</div>
      </div>

      {Object.entries(byDept).map(([dept, members]) => (
        <div key={dept} style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
            {dept} · {members.length} member{members.length !== 1 ? 's' : ''}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {members.map(u => {
              const color = ROLE_COLOR[u.role] || 'var(--accent)'
              return (
                <div key={u.id} className="card" style={{ padding: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: color + '18', border: `2px solid ${color}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, fontWeight: 700, color, flexShrink: 0
                    }}>{u.name?.[0]?.toUpperCase()}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{u.name}</div>
                      <span className={`badge badge-${u.role}`} style={{ marginTop: 3 }}>{u.role}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 6 }}>{u.email}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--text2)' }}>Leave balance</span>
                    <span style={{ fontSize: 12, fontFamily: 'var(--mono)', fontWeight: 600, color: u.leave_balance > 10 ? 'var(--green)' : 'var(--yellow)' }}>
                      {u.leave_balance ?? 20} days
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {users.length === 0 && (
        <div className="empty-state"><div className="icon">◈</div><p>No team members found</p></div>
      )}
    </div>
  )
}