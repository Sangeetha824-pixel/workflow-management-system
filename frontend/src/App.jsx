import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider'
import { useAuth } from './context/useAuth'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import MyRequests from './pages/MyRequests'
import Approvals from './pages/Approvals'
import Employees from './pages/Employees'
import LeaveManagement from './pages/LeaveManagement'
import Payroll from './pages/Payroll'
import MyTeam from './pages/Myteam'
import Workflows from './pages/Workflows'

function PrivateRoute({ children, roles }) {
  const { user, token } = useAuth()
  if (!token || !user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />
  return children
}

function AppLayout({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">{children}</div>
    </div>
  )
}

function AppRoutes() {
  const { token } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/dashboard" element={<PrivateRoute><AppLayout><Dashboard /></AppLayout></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><AppLayout><Profile /></AppLayout></PrivateRoute>} />
      <Route path="/requests" element={<PrivateRoute roles={['employee']}><AppLayout><MyRequests /></AppLayout></PrivateRoute>} />
      <Route path="/approvals" element={<PrivateRoute roles={['admin','hr','manager']}><AppLayout><Approvals /></AppLayout></PrivateRoute>} />
      <Route path="/employees" element={<PrivateRoute roles={['admin','hr']}><AppLayout><Employees /></AppLayout></PrivateRoute>} />
      <Route path="/leave" element={<PrivateRoute roles={['admin','hr']}><AppLayout><LeaveManagement /></AppLayout></PrivateRoute>} />
      <Route path="/payroll" element={<PrivateRoute roles={['admin','hr']}><AppLayout><Payroll /></AppLayout></PrivateRoute>} />
      <Route path="/team" element={<PrivateRoute roles={['admin','manager']}><AppLayout><MyTeam /></AppLayout></PrivateRoute>} />
      <Route path="/workflows" element={<PrivateRoute roles={['admin']}><AppLayout><Workflows /></AppLayout></PrivateRoute>} />
      <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}