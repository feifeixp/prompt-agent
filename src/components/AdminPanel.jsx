import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Upload, LogOut, Save, X, Image as ImageIcon, Video } from 'lucide-react'
import { getCases, createCase, updateCase, deleteCase, uploadMedia, adminLogin, verifyAdminToken } from '../api/cases'
import { caseCategories } from '../data/cases'

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [token, setToken] = useState(localStorage.getItem('admin_token') || '')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  
  const [cases, setCases] = useState([])
  const [editingCase, setEditingCase] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // 表单数据
  const [formData, setFormData] = useState({
    category: 'commercial',
    title: '',
    difficulty: 2,
    prompt: '',
    assets: '',
    tips: '',
    tags: [],
    media: []
  })

  // 验证登录状态
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        const valid = await verifyAdminToken(token)
        setIsLoggedIn(valid)
        if (!valid) {
          localStorage.removeItem('admin_token')
          setToken('')
        }
      }
    }
    checkAuth()
  }, [token])

  // 加载案例列表
  useEffect(() => {
    if (isLoggedIn) {
      loadCases()
    }
  }, [isLoggedIn])

  const loadCases = async () => {
    try {
      const data = await getCases()
      setCases(data)
    } catch (error) {
      console.error('Failed to load cases:', error)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    setLoading(true)
    
    try {
      const result = await adminLogin(username, password)
      setToken(result.token)
      localStorage.setItem('admin_token', result.token)
      setIsLoggedIn(true)
      setPassword('')
    } catch (error) {
      setLoginError('登录失败，请检查用户名和密码')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setToken('')
    localStorage.removeItem('admin_token')
    setIsLoggedIn(false)
  }

  const handleCreateNew = () => {
    setIsCreating(true)
    setEditingCase(null)
    setFormData({
      category: 'commercial',
      title: '',
      difficulty: 2,
      prompt: '',
      assets: '',
      tips: '',
      tags: [],
      media: []
    })
  }

  const handleEdit = (caseItem) => {
    setIsCreating(false)
    setEditingCase(caseItem)
    setFormData({
      category: caseItem.category,
      title: caseItem.title,
      difficulty: caseItem.difficulty,
      prompt: caseItem.prompt,
      assets: caseItem.assets || '',
      tips: caseItem.tips || '',
      tags: caseItem.tags || [],
      media: caseItem.media || []
    })
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      if (isCreating) {
        await createCase(formData, token)
      } else {
        await updateCase(editingCase.id, formData, token)
      }
      await loadCases()
      setIsCreating(false)
      setEditingCase(null)
    } catch (error) {
      alert('保存失败：' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('确定要删除这个案例吗？')) return
    
    setLoading(true)
    try {
      await deleteCase(id, token)
      await loadCases()
    } catch (error) {
      alert('删除失败：' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    setLoading(true)
    try {
      const result = await uploadMedia(file, token)
      setFormData({
        ...formData,
        media: [...formData.media, { type: file.type.startsWith('video') ? 'video' : 'image', url: result.url }]
      })
    } catch (error) {
      alert('上传失败：' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // 未登录显示登录表单
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <div className="glass-card rounded-2xl p-8 w-full max-w-md">
          <h2 className="text-[20px] font-semibold text-[var(--color-text)] mb-2 text-center">管理员登录</h2>
          <p className="text-[13px] text-[var(--color-text-secondary)] text-center mb-6">
            请使用 NeoDomain 账号登录
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[13px] text-[var(--color-text-secondary)] mb-2">用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[14px] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]/50"
                required
              />
            </div>
            <div>
              <label className="block text-[13px] text-[var(--color-text-secondary)] mb-2">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[14px] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]/50"
                required
              />
            </div>
            {loginError && (
              <div className="text-[13px] text-[var(--color-accent-red)] text-center">{loginError}</div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg btn-primary text-[14px] disabled:opacity-50"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>
          <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
            <p className="text-[13px] text-[var(--color-text-secondary)] text-center">
              还没有账号？
              <a
                href="https://story.neodomain.cn/home?inviteCode=Yue1413"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
              >
                在 NeoDomain 注册
              </a>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // 已登录显示管理面板
  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-6">
      <div className="max-w-7xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[22px] font-semibold text-[var(--color-text)]">案例库管理</h1>
          <div className="flex gap-3">
            <button onClick={handleCreateNew} className="flex items-center gap-2 px-4 py-2 rounded-lg btn-primary text-[13px]">
              <Plus size={16} />
              新建案例
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-surface)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors text-[13px]">
              <LogOut size={16} />
              退出登录
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：案例列表 */}
          <div className="lg:col-span-2 space-y-4">
            {cases.map(caseItem => (
              <div key={caseItem.id} className="glass-card rounded-xl p-5 hover:border-[var(--color-border-hover)] transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-[15px] font-medium text-[var(--color-text)] mb-1">{caseItem.title}</h3>
                    <div className="flex gap-2 text-[12px] text-[var(--color-text-tertiary)]">
                      <span>{caseCategories.find(c => c.id === caseItem.category)?.label}</span>
                      <span>•</span>
                      <span>难度 {caseItem.difficulty}/4</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(caseItem)} className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-tertiary)] transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(caseItem.id)} className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-accent-red)] transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-[13px] text-[var(--color-text-secondary)] line-clamp-2">{caseItem.prompt}</p>
              </div>
            ))}
          </div>

          {/* 右侧：编辑表单 */}
          {(isCreating || editingCase) && (
            <div className="lg:col-span-1">
              <div className="glass-card rounded-xl p-5 sticky top-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[15px] font-medium text-[var(--color-text)]">
                    {isCreating ? '新建案例' : '编辑案例'}
                  </h3>
                  <button onClick={() => { setIsCreating(false); setEditingCase(null); }} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-tertiary)]">
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                  {/* 分类 */}
                  <div>
                    <label className="block text-[12px] text-[var(--color-text-secondary)] mb-2">分类</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[13px] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]/50"
                    >
                      {caseCategories.filter(c => c.id !== 'all').map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* 标题 */}
                  <div>
                    <label className="block text-[12px] text-[var(--color-text-secondary)] mb-2">标题</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[13px] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]/50"
                      placeholder="案例标题"
                    />
                  </div>

                  {/* 难度 */}
                  <div>
                    <label className="block text-[12px] text-[var(--color-text-secondary)] mb-2">难度 (1-4)</label>
                    <input
                      type="number"
                      min="1"
                      max="4"
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[13px] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]/50"
                    />
                  </div>

                  {/* 提示词 */}
                  <div>
                    <label className="block text-[12px] text-[var(--color-text-secondary)] mb-2">提示词</label>
                    <textarea
                      value={formData.prompt}
                      onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[13px] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]/50 resize-none"
                      rows="6"
                      placeholder="输入提示词..."
                    />
                  </div>

                  {/* 素材说明 */}
                  <div>
                    <label className="block text-[12px] text-[var(--color-text-secondary)] mb-2">素材说明</label>
                    <input
                      type="text"
                      value={formData.assets}
                      onChange={(e) => setFormData({ ...formData, assets: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[13px] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]/50"
                      placeholder="如：3张图片 + 1个视频"
                    />
                  </div>

                  {/* 提示 */}
                  <div>
                    <label className="block text-[12px] text-[var(--color-text-secondary)] mb-2">使用提示</label>
                    <textarea
                      value={formData.tips}
                      onChange={(e) => setFormData({ ...formData, tips: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[13px] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]/50 resize-none"
                      rows="3"
                      placeholder="使用技巧和注意事项..."
                    />
                  </div>

                  {/* 媒体文件上传 */}
                  <div>
                    <label className="block text-[12px] text-[var(--color-text-secondary)] mb-2">媒体文件</label>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="media-upload"
                    />
                    <label
                      htmlFor="media-upload"
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border-2 border-dashed border-[var(--color-border)] text-[13px] text-[var(--color-text-tertiary)] hover:border-[var(--color-primary)]/50 hover:text-[var(--color-primary-light)] transition-colors cursor-pointer"
                    >
                      <Upload size={14} />
                      上传图片或视频
                    </label>

                    {/* 已上传的媒体 */}
                    {formData.media.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {formData.media.map((item, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                            {item.type === 'image' ? <ImageIcon size={14} /> : <Video size={14} />}
                            <span className="flex-1 text-[12px] text-[var(--color-text-secondary)] truncate">{item.url}</span>
                            <button
                              onClick={() => setFormData({ ...formData, media: formData.media.filter((_, i) => i !== index) })}
                              className="p-1 rounded hover:bg-[var(--color-surface-hover)] text-[var(--color-text-tertiary)]"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 保存按钮 */}
                  <button
                    onClick={handleSave}
                    disabled={loading || !formData.title || !formData.prompt}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg btn-primary text-[13px] disabled:opacity-50"
                  >
                    <Save size={14} />
                    {loading ? '保存中...' : '保存案例'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

