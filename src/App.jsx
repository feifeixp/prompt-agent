import { useState, useEffect } from 'react'
import { BookOpen, Wand2, Film, Bot, LogOut, User } from 'lucide-react'
import GuideTab from './components/GuideTab'
import WorkbenchTab from './components/WorkbenchTab'
import CasesTab from './components/CasesTab'
import AIAssistantTab from './components/AIAssistantTab'
import LoginPage from './components/LoginPage'
import { getStoredAuth, clearAuth } from './utils/auth'

const tabs = [
  { id: 'guide', label: '使用手册', icon: BookOpen },
  { id: 'workbench', label: '提示词工作台', icon: Wand2 },
  { id: 'cases', label: '案例库', icon: Film },
  { id: 'ai', label: 'AI 助手', icon: Bot },
]

// 内置 API 配置，从环境变量读取
const apiConfig = {
  provider: 'deepseek',
  apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY || '',
  baseUrl: 'https://api.deepseek.com/v1',
  model: 'deepseek-chat',
}

export default function App() {
  const [activeTab, setActiveTab] = useState('guide')
  const [user, setUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)

  // 检查本地存储的登录状态
  useEffect(() => {
    const storedAuth = getStoredAuth()
    if (storedAuth && storedAuth.authorization) {
      setUser(storedAuth)
    }
    setAuthChecked(true)
  }, [])

  const handleLoginSuccess = (authData) => {
    setUser(authData)
  }

  const handleLogout = () => {
    clearAuth()
    setUser(null)
  }

  // 加载中
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <div className="text-center animate-fade-in">
          <img src="/ZLLogo.png" alt="Logo" className="w-14 h-14 rounded-none object-contain mx-auto mb-5 animate-pulse" />
          <p className="text-sm text-[var(--color-text-tertiary)] tracking-wide">加载中...</p>
        </div>
      </div>
    )
  }

  // 未登录 → 显示登录页
  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />
  }

  // 已登录 → 显示主应用
  return (
    <div className="min-h-screen flex flex-col">
      {/* 顶部标题栏 — 磨砂玻璃质感，充裕的负空间 */}
      <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)] backdrop-blur-xl">
        <div className="layout-container py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/ZLLogo.png" alt="Logo" className="w-10 h-10 rounded-none object-contain" />
            <div>
              <h1 className="text-lg font-semibold text-[var(--color-text)] tracking-tight">Seedance 2.0</h1>
              <p className="text-[11px] text-[var(--color-text-tertiary)] tracking-wide uppercase">Prompt Assistant & Guide</p>
            </div>
          </div>
          {/* 用户信息 & 退出 */}
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-3">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover ring-1 ring-[var(--color-border)]" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[var(--color-surface-hover)] flex items-center justify-center ring-1 ring-[var(--color-border)]">
                  <User size={15} className="text-[var(--color-text-tertiary)]" />
                </div>
              )}
              <span className="text-sm text-[var(--color-text-secondary)] hidden sm:inline">
                {user.nickname || user.mobile || user.email || '用户'}
              </span>
            </div>
            <div className="w-px h-5 bg-[var(--color-border)]" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-all duration-300 cursor-pointer"
              title="退出登录"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">退出</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tab 导航 — 胶囊风格，与 header 对齐 */}
      <nav className="border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
        <div className="layout-container flex items-center gap-1.5 py-3 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2.5 px-5 py-2.5 text-[13px] font-medium rounded-lg transition-all duration-300 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[var(--color-surface)] text-[var(--color-primary-light)] shadow-sm border border-[var(--color-border)]'
                    : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
                }`}
              >
                <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </nav>

      {/* 内容区域 */}
      <main className="flex-1 overflow-hidden">
        {activeTab === 'guide' && <GuideTab />}
        {activeTab === 'workbench' && <WorkbenchTab apiConfig={apiConfig} />}
        {activeTab === 'cases' && <CasesTab />}
        {activeTab === 'ai' && <AIAssistantTab apiConfig={apiConfig} />}
      </main>
    </div>
  )
}

