import { useState, useEffect, useCallback } from 'react'
import { Mail, Phone, Send, LogIn, Loader2, KeyRound } from 'lucide-react'
import { sendVerificationCode, login, isValidContact, isPhone, isEmail, saveAuth } from '../utils/auth'

export default function LoginPage({ onLoginSuccess }) {
  const [contact, setContact] = useState('')
  const [code, setCode] = useState('')
  const [invitationCode, setInvitationCode] = useState('Yue1413')
  const [error, setError] = useState('')
  const [sendingCode, setSendingCode] = useState(false)
  const [loggingIn, setLoggingIn] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [codeSent, setCodeSent] = useState(false)

  // 倒计时
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  // 检测联系方式类型
  const contactType = isPhone(contact) ? 'phone' : isEmail(contact) ? 'email' : null

  // 发送验证码
  const handleSendCode = useCallback(async () => {
    if (!isValidContact(contact)) {
      setError('请输入有效的手机号或邮箱地址')
      return
    }
    setError('')
    setSendingCode(true)
    try {
      const result = await sendVerificationCode(contact)
      if (result.success) {
        setCodeSent(true)
        setCountdown(60)
      } else {
        setError(result.errMessage || '验证码发送失败，请稍后重试')
      }
    } catch (e) {
      setError(`网络错误: ${e.message}`)
    }
    setSendingCode(false)
  }, [contact])

  // 登录/注册
  const handleLogin = useCallback(async () => {
    if (!isValidContact(contact)) {
      setError('请输入有效的手机号或邮箱地址')
      return
    }
    if (code.length !== 6) {
      setError('请输入6位验证码')
      return
    }
    setError('')
    setLoggingIn(true)
    try {
      // 确保邀请码不为空字符串
      const inviteCode = invitationCode?.trim() || undefined
      const result = await login(contact, code, inviteCode)

      console.log('登录响应:', result) // 调试日志
      console.log('登录响应数据:', result.data) // 调试日志 - 查看 data 结构

      if (result.success && result.data) {
        // 检查 authorization 字段是否存在
        if (!result.data.authorization) {
          console.error('⚠️ API 返回的数据中缺少 authorization 字段:', result.data)
          setError('登录失败：服务器返回的数据格式不正确（缺少 token）')
          setLoggingIn(false)
          return
        }
        saveAuth(result.data)
        onLoginSuccess(result.data)
      } else {
        // 用户不存在 - 跳转到官网注册
        // 根据实际返回的错误码判断：3001 表示用户不存在
        if (result.errCode === 'USER_NOT_FOUND' || result.errCode === '3001' || result.errMessage === '用户不存在') {
          // 弹出新窗口跳转到官网注册（使用专属邀请码链接）
          window.open('https://story.neodomain.cn/home?inviteCode=Yue1413', '_blank')
          setError('⚠️ 账号不存在，请先在官网注册账号（已为您打开注册页面）')
        } else if (result.errCode === 'VERIFY_CODE_ERROR') {
          setError('验证码错误或已过期，请重新获取')
        } else if (result.errCode === 'PARAM_ERROR') {
          setError(result.errMessage || '参数错误，请检查输入信息')
        } else {
          setError(result.errMessage || '登录失败，请检查验证码是否正确')
        }
      }
    } catch (e) {
      setError(`网络错误: ${e.message}`)
    }
    setLoggingIn(false)
  }, [contact, code, invitationCode, onLoginSuccess])

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* 背景装饰光晕 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] rounded-full bg-[var(--color-primary)]/[0.03] blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] rounded-full bg-[var(--color-accent-violet)]/[0.03] blur-[100px]" />
      </div>

      {/* 统一版心容器 — 居中、上下留白，与全站布局系统对齐 */}
      <div className="layout-narrow relative z-10 flex flex-col items-center py-8">
        {/* Logo & 标题 — 充裕的呼吸空间 */}
        <div className="text-center mb-6">
          <img src="/ZLLogo.png" alt="Logo" className="w-[80px] h-[80px] rounded-none object-contain mx-auto mb-3" />
          <h1 className="text-[22px] font-semibold text-[var(--color-text)] tracking-tight mb-2">Seedance 2.0</h1>
          <p className="text-sm text-[var(--color-text-tertiary)] tracking-wide">即梦视频提示词助手</p>
        </div>

        {/* 登录卡片 — 玻璃拟态，宽裕内边距 */}
        <div className="glass-card rounded-2xl px-7 py-7 w-full max-w-[400px]">
          <h2 className="text-[15px] font-medium text-[var(--color-text)] mb-4 tracking-wide">登录账号</h2>

          {/* 错误提示 */}
          {error && (
            <div className="mb-4 px-4 py-2.5 rounded-xl bg-[var(--color-accent-red)]/[0.08] border border-[var(--color-accent-red)]/20 text-sm text-[var(--color-accent-red)]">
              {error}
            </div>
          )}

          {/* 手机号/邮箱输入 */}
          <div className="mb-4">
            <label className="block text-[13px] font-medium text-[var(--color-text-tertiary)] mb-1.5 tracking-wide">手机号 / 邮箱</label>
            <div className="relative group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] group-focus-within:text-[var(--color-primary)] transition-colors">
                {contactType === 'phone' ? <Phone size={17} /> : <Mail size={17} />}
              </div>
              <input
                type="text"
                value={contact}
                onChange={e => { setContact(e.target.value); setError('') }}
                placeholder="请输入手机号或邮箱"
                className="w-full pl-16 pr-5 py-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[15px] text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)]/60 focus:outline-none focus:border-[var(--color-primary)]/50 focus:ring-1 focus:ring-[var(--color-primary)]/20 transition-all duration-300"
              />
            </div>
          </div>

          {/* 验证码输入 + 发送按钮 */}
          <div className="mb-4">
            <label className="block text-[13px] font-medium text-[var(--color-text-tertiary)] mb-1.5 tracking-wide">验证码</label>
            <div className="flex gap-3">
              <div className="relative flex-1 group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] group-focus-within:text-[var(--color-primary)] transition-colors">
                  <KeyRound size={17} />
                </div>
                <input
                  type="text"
                  value={code}
                  onChange={e => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError('') }}
                  placeholder="6位验证码"
                  maxLength={6}
                  className="w-full pl-16 pr-5 py-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[15px] text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)]/60 focus:outline-none focus:border-[var(--color-primary)]/50 focus:ring-1 focus:ring-[var(--color-primary)]/20 transition-all duration-300 tracking-[0.3em]"
                />
              </div>
              <button
                onClick={handleSendCode}
                disabled={sendingCode || countdown > 0 || !isValidContact(contact)}
                className="shrink-0 px-4 py-3 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[13px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:border-[var(--color-border-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 cursor-pointer whitespace-nowrap"
              >
                {sendingCode ? <Loader2 size={17} className="animate-spin" /> : countdown > 0 ? `${countdown}s` : <><Send size={14} className="inline mr-1.5" />发送</>}
              </button>
            </div>
          </div>

          {/* 登录按钮 */}
          <button
            onClick={handleLogin}
            disabled={loggingIn || !isValidContact(contact) || code.length !== 6}
            className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl btn-primary text-[15px] disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
          >
            {loggingIn ? <><Loader2 size={18} className="animate-spin" /> 处理中...</> : <><LogIn size={18} /> 登录</>}
          </button>

          {codeSent && (
            <p className="mt-3 text-center text-sm text-[var(--color-accent-green)]">
              验证码已发送至 {contactType === 'phone' ? '手机' : '邮箱'}，请查收
            </p>
          )}
        </div>

        {/* 注册引导 */}
        <div className="mt-6 text-center">
          <p className="text-[13px] text-[var(--color-text-secondary)]">
            请使用 NeoDomain 账号登录
          </p>
          <p className="mt-2 text-[13px] text-[var(--color-text-secondary)]">
            还没有账号？
            <a
              href="https://story.neodomain.cn/home?inviteCode=Yue1413"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors font-medium"
            >
              在 NeoDomain 注册
            </a>
          </p>
        </div>

        <p className="mt-4 text-center text-[12px] text-[var(--color-text-tertiary)]/40 tracking-wide">
          登录即表示您同意服务条款和隐私政策
        </p>
      </div>
    </div>
  )
}

