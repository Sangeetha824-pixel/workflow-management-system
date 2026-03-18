const BASE = 'http://127.0.0.1:8000'

function getToken() {
  return localStorage.getItem('wf_token')
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(err.detail || 'Request failed')
  }
  return res.json()
}

export const api = {
  // Auth
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  // Stats
  stats: () => request('/stats/dashboard'),

  // Users
  getUsers: () => request('/users/'),
  updateUser: (id, data) => request(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Workflows
  getWorkflows: () => request('/workflows/'),
  createWorkflow: (data) => request('/workflows/', { method: 'POST', body: JSON.stringify(data) }),
  deleteWorkflow: (id) => request(`/workflows/${id}`, { method: 'DELETE' }),

  // Steps
  getSteps: (workflowId) => request(`/steps/workflow/${workflowId}`),

  // Rules
  getRules: (stepId) => request(`/rules/step/${stepId}`),
  createRule: (data) => request('/rules/', { method: 'POST', body: JSON.stringify(data) }),
  deleteRule: (id) => request(`/rules/${id}`, { method: 'DELETE' }),

  // Executions
  getExecutions: (workflowId) => request(`/executions/workflow/${workflowId}`),
  getAllExecutions: async () => {
    const workflows = await request('/workflows/')
    const all = await Promise.all(
      workflows.map(w => request(`/executions/workflow/${w.id}`).catch(() => []))
    )
    return all.flat()
  },
  createExecution: (data) => request('/executions/run', { method: 'POST', body: JSON.stringify(data) }),
  updateExecutionStatus: (id, data) => request(`/executions/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),
}