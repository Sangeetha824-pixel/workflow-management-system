import { useState } from 'react'
import { AuthContext } from './AuthContext'

function getInitialUser() {
  try { return JSON.parse(localStorage.getItem('wf_user')) } catch { return null }
}
function getInitialToken() {
  return localStorage.getItem('wf_token') || null
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getInitialUser)
  const [token, setToken] = useState(getInitialToken)

  function login(userData, tokenData) {
    setUser(userData)
    setToken(tokenData)
    localStorage.setItem('wf_user', JSON.stringify(userData))
    localStorage.setItem('wf_token', tokenData)
  }

  function logout() {
    setUser(null)
    setToken(null)
    localStorage.removeItem('wf_user')
    localStorage.removeItem('wf_token')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}