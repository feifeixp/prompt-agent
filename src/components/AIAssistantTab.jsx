import { useState, useRef, useEffect } from 'react'
import { Send, User, Trash2 } from 'lucide-react'
import { marked } from 'marked'
import { systemPrompt } from '../data/aiSystemPrompt'
import { getMembershipInfo } from '../utils/auth'
import { getConfig } from '../utils/config'

const quickQuestions = [
  '帮我优化这个提示词：一个女生在海边走路',
  '写一个商业产品广告的提示词模板',
  '如何让一镜到底效果更连贯？',
  '视频延长时需要注意什么？',
  '如何让角色在多个镜头中保持一致？',
  '@引用怎么写才最有效？',
]

export default function AIAssistantTab({ apiConfig }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isMember, setIsMember] = useState(false)
  const [membershipLoading, setMembershipLoading] = useState(true)
  const chatEndRef = useRef(null)

  // 检查会员状态
  useEffect(() => {
    const checkMembership = async () => {
      setMembershipLoading(true)
      const { isMember: memberStatus } = await getMembershipInfo()
      setIsMember(memberStatus)
      setMembershipLoading(false)
    }
    checkMembership()
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text) => {
    const userMsg = text || input.trim()
    if (!userMsg) return

    // 检查会员权限（非会员不允许发送）
    if (!isMember) {
      return
    }

    const newMessages = [...messages, { role: 'user', content: userMsg }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      // 获取运行时配置
      const config = await getConfig()

      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...newMessages.map(m => ({ role: m.role, content: m.content }))
      ]

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.OPENROUTER_API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Seedance 2.0'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: apiMessages,
          stream: true
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ''
      setMessages(prev => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(line => line.trim().startsWith('data: '))

        for (const line of lines) {
          const data = line.replace('data: ', '')
          if (data === '[DONE]') continue

          try {
            const parsed = JSON.parse(data)
            const content = parsed.choices?.[0]?.delta?.content
            if (content) {
              fullResponse += content
              setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = { role: 'assistant', content: fullResponse }
                return updated
              })
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: `请求失败: ${e.message}\n\n请检查API Key和网络连接。` }])
    }
    setLoading(false)
  }

  const clearHistory = () => setMessages([])

  /** 将 AI 回复的 markdown 渲染为 HTML */
  const renderMarkdown = (content) => {
    return { __html: marked(content) }
  }

  return (
    <div className="h-[calc(100vh-130px)] flex flex-col">
      {/* 聊天区域 — 宽裕的阅读空间 */}
      <div className="flex-1 overflow-y-auto">
        <div className="layout-narrow py-10 space-y-8">
          {messages.length === 0 && (
            <div className="text-center py-20 animate-fade-in">
              {/* AI 助手 Logo — 去掉背景容器，直接显示图片 */}
              <img src="/image 60.png" alt="提示词助手 Logo" className="w-16 h-16 object-contain mx-auto mb-8" />
              <h3 className="text-xl font-medium text-[var(--color-text)] mb-3 tracking-tight">提示词专家</h3>
              <p className="text-[14px] text-[var(--color-text-tertiary)] mb-12 leading-relaxed">基于 Seedance 2.0 官方手册，为你解答任何提示词问题</p>
              <div className="grid grid-cols-2 gap-3.5 max-w-xl mx-auto">
                {quickQuestions.map((q, i) => (
                  <button key={i} onClick={() => sendMessage(q)}
                    className="text-left px-5 py-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[13px] text-[var(--color-text-tertiary)] hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-secondary)] transition-all duration-300 cursor-pointer leading-relaxed">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 animate-fade-in ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && (
                <img src="/image 60.png" alt="提示词助手 Logo" className="w-9 h-9 object-contain shrink-0 mt-1" />
              )}
	              <div className={`max-w-[75%] rounded-2xl px-6 py-5 text-[14px] leading-[1.85] break-words ${
                msg.role === 'user'
                  ? 'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)]'
                  : 'bg-transparent'
              }`}>
                {msg.role === 'assistant' ? (
	                  <div className="ai-markdown text-[var(--color-text-secondary)] break-words" dangerouslySetInnerHTML={renderMarkdown(msg.content)} />
                ) : (
	                  <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-9 h-9 rounded-lg bg-[var(--color-surface-hover)] flex items-center justify-center shrink-0 mt-1 ring-1 ring-[var(--color-border)]">
                  <User size={16} className="text-[var(--color-text-tertiary)]" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-4 animate-fade-in">
              <img src="/image 60.png" alt="提示词助手 Logo" className="w-9 h-9 object-contain shrink-0 mt-1" />
              <div className="rounded-2xl px-6 py-5">
                <div className="flex gap-2">
                  <span className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                  <span className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                  <span className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* 输入区域 — 居中对齐，与聊天区域等宽 */}
      <div className="border-t border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
        <div className="layout-narrow py-5">
          {!isMember && !membershipLoading && (
            <div className="mb-4 px-5 py-4 rounded-xl bg-[var(--color-accent-red)]/[0.08] border border-[var(--color-accent-red)]/20 text-[14px] text-[var(--color-accent-red)] flex items-start gap-3">
              <span className="shrink-0 text-[16px]">⚠️</span>
              <div className="flex-1">
                <p className="font-medium mb-1">此功能需要会员权限</p>
                <p className="text-[13px] opacity-80">请升级会员后使用 AI 助手功能。
                  <a
                    href="https://story.neodomain.cn/home?inviteCode=Yue1413"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline ml-1 hover:opacity-80"
                  >
                    前往购买会员
                  </a>
                </p>
              </div>
            </div>
          )}
          <div className="flex gap-3.5 items-center">
            <button onClick={clearHistory} className="p-3 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-tertiary)] cursor-pointer transition-colors" title="清空对话">
              <Trash2 size={16} />
            </button>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={isMember ? "输入你的问题..." : "需要会员权限才能使用"}
              disabled={!isMember}
              className="flex-1 px-5 py-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[14px] text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)]/60 focus:outline-none focus:border-[var(--color-primary)]/50 focus:ring-1 focus:ring-[var(--color-primary)]/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button onClick={() => sendMessage()} disabled={loading || !input.trim() || !isMember}
              className="px-5 py-3.5 rounded-xl btn-primary text-[14px] disabled:opacity-30 cursor-pointer flex items-center gap-2 disabled:cursor-not-allowed">
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

