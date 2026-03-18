import { useEffect, useState } from 'react'
import { api } from '../services/api'

const BASE_SALARY = { admin: 120000, hr: 75000, manager: 95000, employee: 55000 }

export default function Payroll() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getUsers().then(setUsers).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page loading-page"><div className="spinner" /></div>

  const totalPayroll = users.reduce((s, u) => s + (BASE_SALARY[u.role] || 55000), 0)

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">Payroll</div>
        <div className="page-subtitle">Salary overview for all employees</div>
      </div>

      <div className="stat-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-label">Total Payroll</div>
          <div className="stat-value" style={{ fontSize: 22, color: 'var(--accent)' }}>₹{totalPayroll.toLocaleString()}</div>
          <div className="stat-sub">per month</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Employees</div>
          <div className="stat-value">{users.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Salary</div>
          <div className="stat-value" style={{ fontSize: 22 }}>₹{users.length ? Math.round(totalPayroll / users.length).toLocaleString() : 0}</div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead><tr><th>Employee</th><th>Role</th><th>Department</th><th>Base Salary</th><th>Leave Deduction</th><th>Net Salary</th></tr></thead>
          <tbody>
            {users.map(u => {
              const base = BASE_SALARY[u.role] || 55000
              const daysUsed = 20 - (u.leave_balance ?? 20)
              const deduction = daysUsed > 0 ? Math.round((base / 22) * daysUsed) : 0
              const net = base - deduction
              return (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontWeight: 500, color: 'var(--text)' }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{u.email}</div>
                  </td>
                  <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                  <td className="text-muted">{u.department || '—'}</td>
                  <td style={{ fontFamily: 'var(--mono)', color: 'var(--text)' }}>₹{base.toLocaleString()}</td>
                  <td style={{ fontFamily: 'var(--mono)', color: deduction > 0 ? 'var(--red)' : 'var(--text3)' }}>
                    {deduction > 0 ? `-₹${deduction.toLocaleString()}` : '—'}
                  </td>
                  <td style={{ fontFamily: 'var(--mono)', fontWeight: 600, color: 'var(--green)' }}>₹{net.toLocaleString()}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}