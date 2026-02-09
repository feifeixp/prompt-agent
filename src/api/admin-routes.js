/**
 * 后端 API 路由处理
 * 用于 Cloudflare Worker
 */

import { hash, compare } from 'bcryptjs'
import { sign, verify } from 'jsonwebtoken'

const JWT_SECRET = 'CHANGE_THIS_SECRET_KEY' // 在生产环境中应该使用环境变量

/**
 * 验证 JWT Token
 */
async function verifyToken(request) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  const token = authHeader.substring(7)
  try {
    return verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

/**
 * 处理案例库 API 路由
 */
export async function handleCasesAPI(request, env) {
  const url = new URL(request.url)
  const path = url.pathname
  const method = request.method

  // CORS 头
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  }

  // OPTIONS 请求
  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // 公开 API：获取所有案例
    if (path === '/api/cases' && method === 'GET') {
      const category = url.searchParams.get('category')
      let query = 'SELECT * FROM cases ORDER BY created_at DESC'
      let params = []
      
      if (category && category !== 'all') {
        query = 'SELECT * FROM cases WHERE category = ? ORDER BY created_at DESC'
        params = [category]
      }
      
      const { results } = await env.DB.prepare(query).bind(...params).all()
      
      // 获取每个案例的标签和媒体
      for (const caseItem of results) {
        const tags = await env.DB.prepare('SELECT tag FROM case_tags WHERE case_id = ?')
          .bind(caseItem.id).all()
        caseItem.tags = tags.results.map(t => t.tag)
        
        const media = await env.DB.prepare('SELECT * FROM case_media WHERE case_id = ? ORDER BY order_index')
          .bind(caseItem.id).all()
        caseItem.media = media.results
      }
      
      return new Response(JSON.stringify(results), { headers: corsHeaders })
    }

    // 公开 API：获取单个案例
    if (path.match(/^\/api\/cases\/\d+$/) && method === 'GET') {
      const id = path.split('/').pop()
      const caseItem = await env.DB.prepare('SELECT * FROM cases WHERE id = ?')
        .bind(id).first()
      
      if (!caseItem) {
        return new Response(JSON.stringify({ error: 'Case not found' }), { 
          status: 404, 
          headers: corsHeaders 
        })
      }
      
      const tags = await env.DB.prepare('SELECT tag FROM case_tags WHERE case_id = ?')
        .bind(id).all()
      caseItem.tags = tags.results.map(t => t.tag)
      
      const media = await env.DB.prepare('SELECT * FROM case_media WHERE case_id = ? ORDER BY order_index')
        .bind(id).all()
      caseItem.media = media.results
      
      return new Response(JSON.stringify(caseItem), { headers: corsHeaders })
    }

    // 管理员 API：登录
    if (path === '/api/admin/login' && method === 'POST') {
      const { username, password } = await request.json()
      
      const admin = await env.DB.prepare('SELECT * FROM admins WHERE username = ?')
        .bind(username).first()
      
      if (!admin) {
        return new Response(JSON.stringify({ error: 'Invalid credentials' }), { 
          status: 401, 
          headers: corsHeaders 
        })
      }
      
      // 简化版密码验证（生产环境应使用 bcrypt）
      if (password !== 'admin123') { // 临时密码，生产环境需要改
        return new Response(JSON.stringify({ error: 'Invalid credentials' }), { 
          status: 401, 
          headers: corsHeaders 
        })
      }
      
      const token = sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '7d' })
      
      return new Response(JSON.stringify({ token }), { headers: corsHeaders })
    }

    // 管理员 API：验证 token
    if (path === '/api/admin/verify' && method === 'GET') {
      const user = await verifyToken(request)
      if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
          status: 401, 
          headers: corsHeaders 
        })
      }
      return new Response(JSON.stringify({ valid: true }), { headers: corsHeaders })
    }

    // 以下是需要认证的管理员 API
    const user = await verifyToken(request)
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: corsHeaders 
      })
    }

    // 创建案例
    if (path === '/api/admin/cases' && method === 'POST') {
      const data = await request.json()
      
      const result = await env.DB.prepare(
        'INSERT INTO cases (category, title, difficulty, prompt, assets, tips) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(
        data.category,
        data.title,
        data.difficulty,
        data.prompt,
        data.assets || '',
        data.tips || ''
      ).run()
      
      const caseId = result.meta.last_row_id
      
      // 插入标签
      if (data.tags && data.tags.length > 0) {
        for (const tag of data.tags) {
          await env.DB.prepare('INSERT INTO case_tags (case_id, tag) VALUES (?, ?)')
            .bind(caseId, tag).run()
        }
      }
      
      return new Response(JSON.stringify({ id: caseId, success: true }), { headers: corsHeaders })
    }

    // 更新案例
    if (path.match(/^\/api\/admin\/cases\/\d+$/) && method === 'PUT') {
      const id = path.split('/').pop()
      const data = await request.json()
      
      await env.DB.prepare(
        'UPDATE cases SET category = ?, title = ?, difficulty = ?, prompt = ?, assets = ?, tips = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      ).bind(
        data.category,
        data.title,
        data.difficulty,
        data.prompt,
        data.assets || '',
        data.tips || '',
        id
      ).run()
      
      // 更新标签（先删除再插入）
      await env.DB.prepare('DELETE FROM case_tags WHERE case_id = ?').bind(id).run()
      if (data.tags && data.tags.length > 0) {
        for (const tag of data.tags) {
          await env.DB.prepare('INSERT INTO case_tags (case_id, tag) VALUES (?, ?)')
            .bind(id, tag).run()
        }
      }
      
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders })
    }

    // 删除案例
    if (path.match(/^\/api\/admin\/cases\/\d+$/) && method === 'DELETE') {
      const id = path.split('/').pop()
      await env.DB.prepare('DELETE FROM cases WHERE id = ?').bind(id).run()
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders })
    }

    // 上传媒体文件（使用 R2 存储）
    if (path === '/api/admin/upload' && method === 'POST') {
      // 这里需要处理文件上传到 Cloudflare R2
      // 暂时返回示例 URL
      return new Response(JSON.stringify({ 
        url: 'https://example.com/uploaded-file.jpg',
        success: true 
      }), { headers: corsHeaders })
    }

    return new Response(JSON.stringify({ error: 'Not found' }), { 
      status: 404, 
      headers: corsHeaders 
    })

  } catch (error) {
    console.error('API Error:', error)
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: corsHeaders 
    })
  }
}

