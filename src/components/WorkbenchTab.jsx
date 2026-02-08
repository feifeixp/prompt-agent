import { useState, useMemo, useEffect } from 'react'
import { Copy, CheckCircle, AlertTriangle, CheckCircle2, Sparkles, Image, Video, Music, RotateCcw } from 'lucide-react'
import { marked } from 'marked'
import { getMembershipInfo } from '../utils/auth'
import { getConfig } from '../utils/config'

const sceneTemplates = [
  { id: 'commercial', label: '💼 商业广告', template: '对@图片1的[产品]进行商业化的摄像展示，[角度]参考@图片2，要求将产品的细节均有所展示，背景音恢宏大气' },
  { id: 'shortfilm', label: '🎬 短片/Vlog', template: '@图片1作为首帧画面，镜头[运动方式]跟拍[角色]，[动作描述]，[场景描述]，[情绪/氛围]' },
  { id: 'creative', label: '✨ 创意特效', template: '@图片1的人物参考@视频1的特效和动作，[特效描述]，[风格]风格' },
  { id: 'oneshot', label: '📹 一镜到底', template: '@图片1@图片2@图片3，一镜到底的[镜头类型]，[路径描述，从A到B到C]' },
  { id: 'editing', label: '✂️ 视频编辑', template: '将@视频1中的[原内容]替换成[新内容]，参考@视频1的运镜和转场效果，[新的动作/剧情描述]' },
  { id: 'extend', label: '⏱ 视频延长', template: '将@视频1延长[X]秒。[按时间轴描述新增内容]' },
  { id: 'music', label: '🎵 音乐卡点', template: '[内容描述]，视频节奏参考@视频的画面节奏进行卡点' },
]

export default function WorkbenchTab({ apiConfig }) {
  const [prompt, setPrompt] = useState('')
  const [assets, setAssets] = useState({ images: 0, videos: 0, audios: 0 })
  const [copied, setCopied] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState('')
  const [isMember, setIsMember] = useState(false)
  const [membershipLoading, setMembershipLoading] = useState(true)

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

  // 实时检查
  const checks = useMemo(() => {
    const results = []
    const totalFiles = assets.images + assets.videos + assets.audios

    // 素材数量检查
    if (assets.images > 9) results.push({ type: 'error', msg: `图片数量${assets.images}超限（最多9张）` })
    if (assets.videos > 3) results.push({ type: 'error', msg: `视频数量${assets.videos}超限（最多3个）` })
    if (assets.audios > 3) results.push({ type: 'error', msg: `音频数量${assets.audios}超限（最多3个）` })
    if (totalFiles > 12) results.push({ type: 'error', msg: `文件总数${totalFiles}超限（最多12个）` })
    if (totalFiles > 0 && totalFiles <= 12) results.push({ type: 'pass', msg: `素材数量OK（${totalFiles}/12）` })

    if (!prompt.trim()) return results

    // @引用检查
    const atRefs = prompt.match(/@(图片|视频|音频)\d+/g) || []
    if (atRefs.length > 0) {
      results.push({ type: 'pass', msg: `检测到${atRefs.length}个@引用` })
      // 检查@引用是否有用途说明
      atRefs.forEach(ref => {
        const idx = prompt.indexOf(ref)
        const after = prompt.slice(idx + ref.length, idx + ref.length + 20).trim()
        if (!after || after.startsWith('@') || after.startsWith('\n')) {
          results.push({ type: 'warn', msg: `${ref} 缺少用途说明（如"作为首帧"）` })
        }
      })
    } else if (totalFiles > 0) {
      results.push({ type: 'warn', msg: '有素材但提示词中没有@引用' })
    }

    // 镜头描述检查
    const cameraTerms = ['推镜头', '拉镜头', '摇镜头', '跟镜头', '环绕', '俯拍', '仰拍', '一镜到底', '特写', '全景', '变焦', '鱼眼']
    const hasCam = cameraTerms.some(t => prompt.includes(t))
    if (hasCam) results.push({ type: 'pass', msg: '包含镜头术语 ✓' })
    else results.push({ type: 'warn', msg: '建议添加镜头术语（推/拉/摇/跟/环绕...）' })

    // 时间轴检查
    const hasTimeline = /\d+[-–]\d+秒/.test(prompt) || /画面\d/.test(prompt)
    if (hasTimeline) results.push({ type: 'pass', msg: '包含时间轴/分段描述 ✓' })
    else if (prompt.length > 50) results.push({ type: 'warn', msg: '建议按时间轴分段描述（如"0-3秒：..."）' })

    // 情绪/氛围检查
    const moodTerms = ['温馨', '紧张', '震撼', '欢快', '神秘', '悲壮', '恢宏', '梦幻', '复古', '科幻', '写实', '逆光', '暖色', '冷色']
    const hasMood = moodTerms.some(t => prompt.includes(t))
    if (hasMood) results.push({ type: 'pass', msg: '包含情绪/氛围描述 ✓' })
    else results.push({ type: 'info', msg: '可添加情绪/氛围词提升效果' })

    return results
  }, [prompt, assets])

	  // 按类型对检查结果分组，便于在右侧卡片中分段展示
	  const groupedChecks = {
	    error: checks.filter(c => c.type === 'error'),
	    warn: checks.filter(c => c.type === 'warn'),
	    pass: checks.filter(c => c.type === 'pass'),
	    info: checks.filter(c => c.type === 'info'),
	  }

  const copyPrompt = () => {
    navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const applyTemplate = (template) => {
    setPrompt(template)
  }

  // AI优化
  const optimizeWithAI = async () => {
    if (!prompt.trim() || !isMember) return

    setAiLoading(true)
    setAiResult('')
    try {
      // 获取运行时配置
      const config = await getConfig()

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
          messages: [
            { role: 'system', content: '你是即梦视频 Seedance 2.0 提示词优化专家。请直接输出优化后的提示词，不要加任何解释。优化方向：添加镜头术语、时间轴结构、情绪氛围词、明确@引用用途。' },
            { role: 'user', content: `请优化以下提示词：\n${prompt}\n\n素材情况：${assets.images}张图片，${assets.videos}个视频，${assets.audios}个音频` }
          ],
          stream: true
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ''

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
              setAiResult(fullResponse)
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    } catch (e) {
      setAiResult(`请求失败: ${e.message}`)
    }
    setAiLoading(false)
  }

  return (
    <div className="h-[calc(100vh-120px)] overflow-y-auto">
      <div className="layout-container page-section">
        {/* 页面标题 — 视觉层次：大标题 + 副标题 + 呼吸带 */}
        <div className="mb-4">
          <h2 className="text-[22px] font-semibold text-[var(--color-text)] tracking-tight mb-3">提示词工作台</h2>
          <p className="text-[14px] text-[var(--color-text-tertiary)] leading-relaxed">编写、检查、优化你的视频生成提示词</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-8">
          {/* 左栏：场景模板 + 素材 (3/12) */}
          <div className="lg:col-span-3 space-y-7">
            {/* 场景模板 */}
            <div className="glass-card rounded-2xl p-6 lg:p-7">
              <h3 className="text-[13px] font-medium text-[var(--color-text-secondary)] mb-5 tracking-wide">场景模板</h3>
              <div className="space-y-1">
                {sceneTemplates.map(t => (
                  <button key={t.id} onClick={() => applyTemplate(t.template)}
                    className="w-full text-left px-4 py-3 rounded-lg text-[13px] text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-secondary)] transition-all duration-200 cursor-pointer leading-relaxed">
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 素材标记 */}
            <div className="glass-card rounded-2xl p-6 lg:p-7">
              <h3 className="text-[13px] font-medium text-[var(--color-text-secondary)] mb-5 tracking-wide">素材数量</h3>
              <div className="space-y-5">
                {[
                  { key: 'images', label: '图片', icon: Image, max: 9, color: 'text-[var(--color-accent-blue)]' },
                  { key: 'videos', label: '视频', icon: Video, max: 3, color: 'text-[var(--color-accent-green)]' },
                  { key: 'audios', label: '音频', icon: Music, max: 3, color: 'text-[var(--color-accent-violet)]' },
                ].map(({ key, label, icon: Icon, max, color }) => (
                  <div key={key} className="flex items-center gap-3">
                    <Icon size={15} className={color} />
                    <span className="text-[13px] text-[var(--color-text-tertiary)] w-8">{label}</span>
                    <input type="number" min="0" max={max} value={assets[key]}
                      onChange={e => setAssets({ ...assets, [key]: parseInt(e.target.value) || 0 })}
                      className="w-16 px-2.5 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-center text-[13px] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]/50 transition-colors" />
                    <span className="text-[12px] text-[var(--color-text-tertiary)]">/ {max}</span>
                  </div>
                ))}
                <div className="text-[12px] text-[var(--color-text-tertiary)] pt-4 border-t border-[var(--color-border)]">
                  总计 {assets.images + assets.videos + assets.audios} / 12 个文件
                </div>
              </div>
            </div>
          </div>

          {/* 中栏：提示词编辑器 (5/12) */}
          <div className="lg:col-span-5 space-y-7">
            <div className="glass-card rounded-2xl p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[13px] font-medium text-[var(--color-text-secondary)] tracking-wide">提示词编辑</h3>
                <div className="flex gap-2">
                  <button onClick={() => setPrompt('')} className="p-2.5 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-tertiary)] cursor-pointer transition-colors"><RotateCcw size={14} /></button>
                  <button onClick={copyPrompt} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] bg-[var(--color-surface-hover)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] cursor-pointer transition-colors">
                    {copied ? <><CheckCircle size={13} /> 已复制</> : <><Copy size={13} /> 复制</>}
                  </button>
                </div>
              </div>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="在这里输入你的提示词...&#10;&#10;例如：@图片1作为首帧画面，镜头跟拍走在樱花树下的女生..."
                className="w-full h-72 lg:h-80 px-5 py-5 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[14px] text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)]/50 resize-none focus:outline-none focus:border-[var(--color-primary)]/50 focus:ring-1 focus:ring-[var(--color-primary)]/10 leading-[1.9] transition-all duration-300"
              />
              <div className="flex justify-between items-center mt-5">
                <span className="text-[12px] text-[var(--color-text-tertiary)]">{prompt.length} 字</span>
                <div className="flex items-center gap-3">
                  {!isMember && !membershipLoading && (
                    <span className="text-[12px] text-[var(--color-accent-red)] flex items-center gap-1.5">
                      ⚠️ 需要会员权限
                      <a
                        href="https://story.neodomain.cn/home?inviteCode=Yue1413"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:opacity-80"
                      >
                        购买会员
                      </a>
                    </span>
                  )}
                  <button onClick={optimizeWithAI} disabled={aiLoading || !prompt.trim() || !isMember}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg btn-primary text-[13px] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                    title={!isMember ? '需要会员权限' : ''}
                  >
                    <Sparkles size={14} />
                    {aiLoading ? '优化中...' : 'AI 优化'}
                  </button>
                </div>
              </div>
            </div>

            {/* AI优化结果 */}
            {aiResult && (
              <div className="glass-card rounded-2xl p-6 lg:p-8 border-[var(--color-primary)]/20 glow-hover">
                <div className="flex items-center justify-between mb-5">
	                  <h3 className="text-[13px] font-medium text-[var(--color-primary-light)] tracking-wide">AI 优化建议</h3>
	                  <button
	                    onClick={() => {
	                      navigator.clipboard.writeText(aiResult)
	                      // 可以添加复制成功提示
	                    }}
	                    className="text-[12px] px-3.5 py-2 rounded-lg btn-primary cursor-pointer flex items-center gap-1.5"
	                  >
	                    <Copy size={14} />
	                    复制
	                  </button>
                </div>
	                {/* 结果较长时在卡片内部滚动，避免溢出底部边界 */}
	                <div
	                  className="prose prose-invert max-w-none text-[14px] text-[var(--color-text-secondary)] max-h-64 overflow-y-auto pr-1
	                    [&_h1]:text-[16px] [&_h1]:font-semibold [&_h1]:text-[var(--color-text)] [&_h1]:mb-3 [&_h1]:mt-4
	                    [&_h2]:text-[15px] [&_h2]:font-semibold [&_h2]:text-[var(--color-text)] [&_h2]:mb-2 [&_h2]:mt-3
	                    [&_h3]:text-[14px] [&_h3]:font-medium [&_h3]:text-[var(--color-primary-light)] [&_h3]:mb-2 [&_h3]:mt-2
	                    [&_p]:leading-[1.7] [&_p]:mb-3
	                    [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ul]:space-y-1
	                    [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_ol]:space-y-1
	                    [&_li]:text-[14px] [&_li]:leading-[1.6]
	                    [&_strong]:text-[var(--color-text)] [&_strong]:font-semibold
	                    [&_code]:bg-[rgba(212,165,116,0.08)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[var(--color-primary-light)] [&_code]:text-[13px]"
	                  dangerouslySetInnerHTML={{ __html: marked(aiResult) }}
	                />
              </div>
            )}
          </div>

	          {/* 右栏：实时检查 (4/12) — 卡片内部可滚动，分组展示结果，避免文字“顶到底部” */}
	          <div className="lg:col-span-4 lg:pl-2">
	            <div className="glass-card rounded-2xl p-4 lg:p-6 lg:sticky lg:top-4 lg:max-w-[320px] lg:ml-auto flex flex-col overflow-hidden">
	              <h3 className="text-[13px] font-medium text-[var(--color-text-secondary)] mb-4 tracking-wide">实时检查</h3>
	              <div className="mt-1 space-y-4 max-h-[420px] overflow-y-auto pr-2 pb-2">
	                {checks.length === 0 ? (
	                  <p className="text-[13px] text-[var(--color-text-tertiary)] leading-[1.8]">
	                    输入提示词后，这里将显示实时检查结果
	                  </p>
	                ) : (
	                  <>
	                    {[
	                      { key: 'error', label: '严重问题', bulletClass: 'text-[var(--color-accent-red)]', textClass: 'text-[var(--color-accent-red)]' },
	                      { key: 'warn', label: '优化建议', bulletClass: 'text-[var(--color-accent-amber)]', textClass: 'text-[var(--color-accent-amber)]' },
	                      { key: 'pass', label: '检查通过', bulletClass: 'text-[var(--color-accent-green)]', textClass: 'text-[var(--color-accent-green)]' },
	                      { key: 'info', label: '提示信息', bulletClass: 'text-[var(--color-accent-blue)]', textClass: 'text-[var(--color-accent-blue)]' },
	                    ].map(group => {
	                      const items = groupedChecks[group.key]
	                      if (!items || items.length === 0) return null
	                      return (
	                        <div
	                          key={group.key}
	                          className="pt-1 pb-2 border-b border-[var(--color-border)] last:border-none last:pb-0"
	                        >
	                          <div className="flex items-center justify-between mb-1.5">
	                            <span className={`text-[12px] font-medium ${group.textClass}`}>{group.label}</span>
	                            <span className="text-[11px] text-[var(--color-text-tertiary)]">
	                              {items.length} 条
	                            </span>
	                          </div>
	                          <div className="space-y-1.5">
	                            {items.map((c, i) => (
	                              <div key={i} className="flex items-start gap-2.5 text-[13px] leading-[1.7]">
	                                <span className={`${group.bulletClass} shrink-0 mt-1 text-[11px]`}>●</span>
	                                <span className={`${group.textClass} break-words`}>
	                                  {c.msg}
	                                </span>
	                              </div>
	                            ))}
	                          </div>
	                        </div>
	                      )
	                    })}
	                  </>
	                )}
	              </div>
	            </div>
	          </div>
        </div>
      </div>
    </div>
  )
}

