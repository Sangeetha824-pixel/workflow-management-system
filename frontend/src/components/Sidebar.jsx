import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

const NAV = {
  admin: [
    { to: '/dashboard', icon: '⊞', label: 'Dashboard' },
    { to: '/workflows', icon: '⟳', label: 'Workflows' },
    { to: '/employees', icon: '◈', label: 'Employees' },
    { to: '/approvals', icon: '✓', label: 'Approvals' },
    { to: '/leave', icon: '◷', label: 'Leave Mgmt' },
    { to: '/payroll', icon: '◎', label: 'Payroll' },
    { to: '/profile', icon: '○', label: 'My Profile' },
  ],
  hr: [
    { to: '/dashboard', icon: '⊞', label: 'Dashboard' },
    { to: '/employees', icon: '◈', label: 'Employees' },
    { to: '/approvals', icon: '✓', label: 'Approvals' },
    { to: '/leave', icon: '◷', label: 'Leave Mgmt' },
    { to: '/payroll', icon: '◎', label: 'Payroll' },
    { to: '/profile', icon: '○', label: 'My Profile' },
  ],
  manager: [
    { to: '/dashboard', icon: '⊞', label: 'Dashboard' },
    { to: '/team', icon: '◈', label: 'My Team' },
    { to: '/approvals', icon: '✓', label: 'Approvals' },
    { to: '/profile', icon: '○', label: 'My Profile' },
  ],
  employee: [
    { to: '/dashboard', icon: '⊞', label: 'Dashboard' },
    { to: '/requests', icon: '◫', label: 'My Requests' },
    { to: '/profile', icon: '○', label: 'My Profile' },
  ],
}

const ROLE_COLOR = {
  admin: '#dc2626', hr: '#7c3aed', manager: '#d97706', employee: '#4361ee'
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const links = NAV[user?.role] || NAV.employee

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const roleColor = ROLE_COLOR[user?.role] || '#4361ee'

  return (
    <aside style={{
      width: 'var(--sidebar-w)', position: 'fixed', top: 0, left: 0, height: '100vh',
      background: 'var(--surface)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', zIndex: 100,
      boxShadow: '2px 0 8px rgba(0,0,0,0.04)'
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>
          Flow<span style={{ color: 'var(--accent)' }}>Mate</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2, fontWeight: 500 }}>Workflow Automation</div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
        {links.map(link => (
          <NavLink key={link.to} to={link.to} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
            borderRadius: 8, marginBottom: 2, textDecoration: 'none', fontSize: 13,
            fontWeight: isActive ? 600 : 400,
            color: isActive ? 'var(--accent)' : 'var(--text2)',
            background: isActive ? 'var(--accent-dim)' : 'transparent',
            transition: 'all 0.12s'
          })}>
            <span style={{ fontSize: 15 }}>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: roleColor + '18',
            border: `2px solid ${roleColor}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: roleColor, flexShrink: 0
          }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: roleColor, textTransform: 'capitalize', fontWeight: 600 }}>{user?.role}</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{
          width: '100%', padding: '7px', borderRadius: 7,
          border: '1px solid var(--border)', background: 'transparent',
          color: 'var(--text3)', fontSize: 12, cursor: 'pointer',
          fontFamily: 'var(--font)', transition: 'all 0.12s'
        }}
          onMouseOver={e => { e.target.style.color = 'var(--red)'; e.target.style.borderColor = 'rgba(220,38,38,0.3)'; e.target.style.background = 'var(--red-dim)' }}
          onMouseOut={e => { e.target.style.color = 'var(--text3)'; e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'transparent' }}>
          Sign out
        </button>
      </div>
    </aside>
  )
}