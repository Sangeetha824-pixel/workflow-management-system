import { useAuth } from '../context/useAuth'

const ROLE_COLOR = { admin: 'var(--red)', hr: 'var(--purple)', manager: 'var(--yellow)', employee: 'var(--accent)' }

const PERMISSIONS = {
  admin:    { 'Manage Users': true, 'Approve Requests': true, 'View Payroll': true, 'Manage Workflows': true, 'View All Data': true },
  hr:       { 'Manage Users': true, 'Approve Requests': true, 'View Payroll': true, 'Manage Workflows': false, 'View All Data': false },
  manager:  { 'Manage Users': false, 'Approve Requests': true, 'View Payroll': false, 'Manage Workflows': false, 'View All Data': false },
  employee: { 'Manage Users': false, 'Approve Requests': false, 'View Payroll': false, 'Manage Workflows': false, 'View All Data': false },
}

// Declared OUTSIDE component to fix ESLint error
function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ width: 140, fontSize: 12, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', paddingTop: 2 }}>{label}</div>
      <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>{value || '—'}</div>
    </div>
  )
}

export default function Profile() {
  const { user } = useAuth()
  const roleColor = ROLE_COLOR[user?.role] || 'var(--accent)'
  const perms = PERMISSIONS[user?.role] || PERMISSIONS.employee
  const leaveUsed = 20 - (user?.leave_balance ?? 20)
  const leavePct = Math.max(0, Math.min(100, (user?.leave_balance / 20) * 100))

  return (
    <div className="page" style={{ maxWidth: 700 }}>
      <div className="page-header"><div className="page-title">My Profile</div></div>

      <div className="card" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: roleColor + '18', border: `3px solid ${roleColor}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, fontWeight: 800, color: roleColor, flexShrink: 0
        }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{user?.name}</div>
          <div style={{ fontSize: 13, color: roleColor, textTransform: 'capitalize', fontWeight: 600, marginTop: 2 }}>{user?.role}</div>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>{user?.department || 'No department'}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 4 }}>Account Info</div>
          <Row label="Full Name" value={user?.name} />
          <Row label="Email" value={user?.email} />
          <Row label="Role" value={user?.role} />
          <Row label="Department" value={user?.department} />
          <Row label="Member Since" value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'} />
        </div>

        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 16 }}>Leave Balance</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>Available</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--green)' }}>{user?.leave_balance} days</span>
          </div>
          <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{ height: '100%', width: `${leavePct}%`, background: 'var(--green)', borderRadius: 4, transition: 'width 0.5s' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>Used: {leaveUsed} days</span>
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>Total: 20 days</span>
          </div>

          <div style={{ marginTop: 20, fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 12 }}>Permissions</div>
          {Object.entries(perms).map(([perm, allowed]) => (
            <div key={perm} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text2)' }}>{perm}</span>
              <span style={{ fontSize: 16 }}>{allowed ? '✅' : '🚫'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}