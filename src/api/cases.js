/**
 * 案例库 API 接口
 * 用于前端与后端数据交互
 */

const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:8787/api'

/**
 * 获取所有案例
 */
export async function getCases(category = 'all') {
  const url = category === 'all' 
    ? `${API_BASE}/cases` 
    : `${API_BASE}/cases?category=${category}`
  
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch cases')
  }
  return response.json()
}

/**
 * 获取单个案例详情
 */
export async function getCase(id) {
  const response = await fetch(`${API_BASE}/cases/${id}`)
  if (!response.ok) {
    throw new Error('Failed to fetch case')
  }
  return response.json()
}

/**
 * 创建新案例（需要管理员权限）
 */
export async function createCase(caseData, token) {
  const response = await fetch(`${API_BASE}/admin/cases`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(caseData)
  })
  
  if (!response.ok) {
    throw new Error('Failed to create case')
  }
  return response.json()
}

/**
 * 更新案例（需要管理员权限）
 */
export async function updateCase(id, caseData, token) {
  const response = await fetch(`${API_BASE}/admin/cases/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(caseData)
  })
  
  if (!response.ok) {
    throw new Error('Failed to update case')
  }
  return response.json()
}

/**
 * 删除案例（需要管理员权限）
 */
export async function deleteCase(id, token) {
  const response = await fetch(`${API_BASE}/admin/cases/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  
  if (!response.ok) {
    throw new Error('Failed to delete case')
  }
  return response.json()
}

/**
 * 上传媒体文件（需要管理员权限）
 */
export async function uploadMedia(file, token) {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await fetch(`${API_BASE}/admin/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  })
  
  if (!response.ok) {
    throw new Error('Failed to upload media')
  }
  return response.json()
}

/**
 * 管理员登录
 */
export async function adminLogin(username, password) {
  console.log('[API] Login attempt:', { username, apiBase: API_BASE })

  const response = await fetch(`${API_BASE}/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  })

  console.log('[API] Login response status:', response.status)

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error('[API] Login failed:', errorData)
    throw new Error(errorData.error || 'Login failed')
  }

  const data = await response.json()
  console.log('[API] Login success, token received')
  return data
}

/**
 * 验证管理员 token
 */
export async function verifyAdminToken(token) {
  const response = await fetch(`${API_BASE}/admin/verify`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  
  return response.ok
}

