import { useEffect, useState } from 'react'
import { useAuth } from '../context/useAuth'
import { api } from '../services/api'

const ROLE_COLOR = { admin: 'var(--red)', hr: 'var(--purple)', manager: 'var(--yellow)', employee: 'var(--accent)' }

function StatCard({ label, value, color, sub }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ color: color || 'var(--text)' }}>{value ?? '—'}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [executions, setExecutions] = useState([])
  const [workflows, setWorkflows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [s, wf, ex] = await Promise.all([
          api.stats().catch(() => null),
          api.getWorkflows().catch(() => []),
          api.getAllExecutions().catch(() => [])
        ])
        setStats(s)
        setWorkflows(wf)
        setExecutions(ex.slice(0, 8))
      } finally { setLoading(false) }
    }
    load()
  }, [])

  const statusBadge = (s) => <span className={`badge badge-${s}`}>{s}</span>
  const roleColor = ROLE_COLOR[user?.role] || 'var(--accent)'

  if (loading) return <div className="page loading-page"><div className="spinner" /></div>

  return (
    <div className="page">
      {/* Welcome */}
      <div className="card" style={{ marginBottom: 20, background: `linear-gradient(135deg, var(--surface) 0%, ${roleColor}08 100%)`, borderColor: roleColor + '30' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
              Hello, {user?.name?.split(' ')[0]} 👋
            </div>
            <div style={{ fontSize: 13, color: 'var(--text2)' }}>
              {user?.department || 'No department'} · <span style={{ color: roleColor, textTransform: 'capitalize', fontWeight: 600 }}>{user?.role}</span>
            </div>
          </div>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: roleColor + '18', border: `2px solid ${roleColor}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 800, color: roleColor
          }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <StatCard label="Workflows" value={stats?.total_workflows ?? workflows.length} color="var(--accent)" />
        <StatCard label="Active" value={stats?.active_workflows ?? workflows.filter(w => w.status === 'active').length} color="var(--green)" />
        <StatCard label="Executions" value={stats?.total_executions ?? executions.length} />
        <StatCard label="Pending" value={stats?.pending_executions ?? executions.filter(e => e.status === 'pending').length} color="var(--yellow)" />
        <StatCard label="Approved" value={stats?.approved_executions ?? executions.filter(e => e.status === 'approved' || e.status === 'completed').length} color="var(--green)" />
        <StatCard label="Leave Balance" value={user?.leave_balance ?? '—'} color="var(--purple)" sub="days remaining" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Workflows */}
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--text2)' }}>Workflows</div>
          {workflows.length === 0 ? (
            <div className="empty-state"><div className="icon">⟳</div><p>No workflows yet</p></div>
          ) : workflows.slice(0, 6).map(w => (
            <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{w.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{w.category || 'General'}</div>
              </div>
              {statusBadge(w.status)}
            </div>
          ))}
        </div>

        {/* Recent executions */}
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--text2)' }}>Recent Requests</div>
          {executions.length === 0 ? (
            <div className="empty-state"><div className="icon">◫</div><p>No requests yet</p></div>
          ) : executions.map(e => (
            <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>Execution #{e.id}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                  {new Date(e.started_at).toLocaleDateString()}
                </div>
              </div>
              {statusBadge(e.status)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}