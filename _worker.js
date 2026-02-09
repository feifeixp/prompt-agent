/**
 * Cloudflare Worker for serving static assets with environment variable support
 * This replaces the static assets mode to enable environment variable configuration
 */

// JWT 简单实现（生产环境建议使用专业库）
const JWT_SECRET = 'your-secret-key-change-this-in-production'

function createJWT(payload) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const encodedHeader = btoa(JSON.stringify(header))
  const encodedPayload = btoa(JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }))
  const signature = btoa(encodedHeader + '.' + encodedPayload + JWT_SECRET)
  return `${encodedHeader}.${encodedPayload}.${signature}`
}

function verifyJWT(token) {
  try {
    const [header, payload, signature] = token.split('.')
    const expectedSignature = btoa(header + '.' + payload + JWT_SECRET)
    if (signature !== expectedSignature) return null
    const decoded = JSON.parse(atob(payload))
    if (decoded.exp < Date.now()) return null
    return decoded
  } catch {
    return null
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Handle API proxy for environment variables
    if (url.pathname === '/api/config') {
      const config = {
        OPENROUTER_API_KEY: env.VITE_OPENROUTER1_API_KEY || '',
        DEEPSEEK_API_KEY: env.VITE_DEEPSEEK_API_KEY || '',
      };

      console.log('[Worker] Config request received');
      console.log('[Worker] Has OPENROUTER key:', !!config.OPENROUTER_API_KEY);
      console.log('[Worker] Has DEEPSEEK key:', !!config.DEEPSEEK_API_KEY);

      return new Response(JSON.stringify(config), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    }

    // 案例库 API 路由
    if (url.pathname.startsWith('/api/')) {
      return handleCasesAPI(request, env, corsHeaders);
    }

    // Serve static assets from the dist directory
    try {
      // 尝试获取静态资源
      const response = await env.ASSETS.fetch(request);

      // 如果是 404 且不是静态资源请求（没有文件扩展名），返回 index.html 用于客户端路由
      if (response.status === 404) {
        const path = url.pathname;
        const hasExtension = /\.[a-zA-Z0-9]+$/.test(path);

        // 如果是 SPA 路由（如 /admin），返回 index.html
        if (!hasExtension) {
          const indexRequest = new Request(new URL('/', request.url), request);
          return await env.ASSETS.fetch(indexRequest);
        }
      }

      return response;
    } catch (e) {
      // 如果出错，尝试返回 index.html
      try {
        const indexRequest = new Request(new URL('/', request.url), request);
        return await env.ASSETS.fetch(indexRequest);
      } catch (indexError) {
        return new Response('Not Found', { status: 404 });
      }
    }
  },
};

// 案例库 API 处理函数
async function handleCasesAPI(request, env, corsHeaders) {
  const url = new URL(request.url)
  const path = url.pathname
  const method = request.method

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

      return new Response(JSON.stringify(results), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 公开 API：获取单个案例
    if (path.match(/^\/api\/cases\/\d+$/) && method === 'GET') {
      const id = path.split('/').pop()
      const caseItem = await env.DB.prepare('SELECT * FROM cases WHERE id = ?')
        .bind(id).first()

      if (!caseItem) {
        return new Response(JSON.stringify({ error: 'Case not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const tags = await env.DB.prepare('SELECT tag FROM case_tags WHERE case_id = ?')
        .bind(id).all()
      caseItem.tags = tags.results.map(t => t.tag)

      const media = await env.DB.prepare('SELECT * FROM case_media WHERE case_id = ? ORDER BY order_index')
        .bind(id).all()
      caseItem.media = media.results

      return new Response(JSON.stringify(caseItem), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 管理员登录
    if (path === '/api/admin/login' && method === 'POST') {
      const { username, password } = await request.json()

      // 临时硬编码验证（生产环境应该查询数据库）
      if (username === 'admin' && password === 'admin123') {
        const token = createJWT({ username })
        return new Response(JSON.stringify({ token }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 验证 token
    if (path === '/api/admin/verify' && method === 'GET') {
      const authHeader = request.headers.get('Authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const token = authHeader.substring(7)
      const user = verifyJWT(token)

      if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ valid: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 需要认证的 API
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const token = authHeader.substring(7)
    const user = verifyJWT(token)

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
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

      return new Response(JSON.stringify({ id: caseId, success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
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

      // 更新标签
      await env.DB.prepare('DELETE FROM case_tags WHERE case_id = ?').bind(id).run()
      if (data.tags && data.tags.length > 0) {
        for (const tag of data.tags) {
          await env.DB.prepare('INSERT INTO case_tags (case_id, tag) VALUES (?, ?)')
            .bind(id, tag).run()
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 删除案例
    if (path.match(/^\/api\/admin\/cases\/\d+$/) && method === 'DELETE') {
      const id = path.split('/').pop()
      await env.DB.prepare('DELETE FROM cases WHERE id = ?').bind(id).run()
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('API Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

