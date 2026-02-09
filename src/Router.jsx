import { useState, useEffect } from 'react'
import App from './App'
import AdminPanel from './components/AdminPanel'

/**
 * 简单的客户端路由
 * 支持 / 和 /admin 路径
 */
export default function Router() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname)

  useEffect(() => {
    // 监听浏览器前进/后退
    const handlePopState = () => {
      setCurrentPath(window.location.pathname)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // 根据路径渲染不同组件
  if (currentPath === '/admin' || currentPath === '/admin/') {
    return <AdminPanel />
  }

  return <App />
}

