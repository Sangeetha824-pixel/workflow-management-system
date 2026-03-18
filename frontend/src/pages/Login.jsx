import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { api } from '../services/api'

const ROLES = [
  { role: 'admin', label: 'Admin', icon: '⬡', color: '#dc2626', desc: 'Full access' },
  { role: 'hr', label: 'HR', icon: '◈', color: '#7c3aed', desc: 'People ops' },
  { role: 'manager', label: 'Manager', icon: '◎', color: '#d97706', desc: 'Team lead' },
  { role: 'employee', label: 'Employee', icon: '○', color: '#4361ee', desc: 'Staff' },
]

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) { setError('Please enter email and password'); return }
    setLoading(true); setError('')
    try {
      const data = await api.login({ email, password })
      login(data.user, data.access_token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Invalid email or password')
    } finally { setLoading(false) }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #f0f4ff 0%, #fafafa 60%, #f5f0ff 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.03em', color: '#1a1d2e', marginBottom: 6 }}>
            Flow<span style={{ color: '#4361ee' }}>Mate</span>
          </div>
          <div style={{ fontSize: 14, color: '#5a6070' }}>Sign in to your workspace</div>
        </div>

        {/* Role cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
          {ROLES.map(r => (
            <button key={r.role} onClick={() => setSelectedRole(r.role === selectedRole ? null : r.role)}
              style={{
                padding: '12px 14px', borderRadius: 10,
                border: `1.5px solid ${selectedRole === r.role ? r.color + '50' : '#e2e6ef'}`,
                background: selectedRole === r.role ? r.color + '10' : '#fff',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                transition: 'all 0.15s', fontFamily: 'var(--font)', textAlign: 'left',
                boxShadow: selectedRole === r.role ? `0 2px 12px ${r.color}20` : '0 1px 3px rgba(0,0,0,0.05)'
              }}>
              <span style={{ fontSize: 18, color: r.color }}>{r.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1d2e' }}>{r.label}</div>
                <div style={{ fontSize: 11, color: '#9ba3b8' }}>{r.desc}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Form */}
        <div style={{ background: '#fff', border: '1px solid #e2e6ef', borderRadius: 14, padding: 28, boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="you@company.com"
                value={email} onChange={e => setEmail(e.target.value)} autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input className="form-input" type={showPw ? 'text' : 'password'}
                  placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                  style={{ paddingRight: 42 }} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ba3b8', fontSize: 15 }}>
                  {showPw ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626' }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '11px', fontSize: 14, marginTop: 4 }}>
              {loading ? <><span className="spinner" style={{ width: 16, height: 16, borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} /> Signing in…</> : 'Sign In'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#9ba3b8' }}>
          Need access? Contact your administrator
        </div>
      </div>
    </div>
  )
}