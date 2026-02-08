import { useState } from 'react'
import { Copy, CheckCircle, Star, Tag } from 'lucide-react'
import { cases, caseCategories } from '../data/cases'

export default function CasesTab() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [copiedId, setCopiedId] = useState(null)

  const filteredCases = activeCategory === 'all'
    ? cases
    : cases.filter(c => c.category === activeCategory)

  const copyPrompt = (id, prompt) => {
    navigator.clipboard.writeText(prompt)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const renderStars = (difficulty) => {
    return Array.from({ length: 4 }, (_, i) => (
      <Star key={i} size={11} className={i < difficulty ? 'fill-[var(--color-primary)] text-[var(--color-primary)]' : 'text-[var(--color-text-tertiary)]/20'} />
    ))
  }

  return (
    <div className="h-[calc(100vh-120px)] overflow-y-auto">
      <div className="layout-narrow page-section">
        {/* 页面标题 — 视觉层次 */}
        <div className="mb-6">
          <h2 className="text-[17px] font-semibold text-[var(--color-text)] tracking-tight mb-2">精选案例库</h2>
          <p className="text-[14px] text-[var(--color-text-tertiary)] leading-normal">来自官方手册的真实案例，一键复制提示词</p>
        </div>

        {/* 分类筛选 — 胶囊标签 */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {caseCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] whitespace-nowrap transition-all duration-300 cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[var(--color-surface)] text-[var(--color-primary-light)] border border-[var(--color-border)] shadow-sm'
                  : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
              }`}
            >
              <span className="text-[14px]">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

	        {/* 案例卡片 — 充裕的卡片间距和内部分段，提升阅读节奏 */}
	        <div className="space-y-6">
          {filteredCases.map((c, idx) => (
            <div
              key={c.id}
              className="glass-card rounded-2xl p-8 lg:p-10 animate-fade-in"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {/* 标题区 — 案例名称 + 难度 + 复制按钮 */}
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h3 className="text-[17px] font-medium text-[var(--color-text)] mb-3">{c.title}</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">{renderStars(c.difficulty)}</div>
                    <span className="text-[12px] text-[var(--color-text-tertiary)]">{c.assets}</span>
                  </div>
                </div>
                <button
                  onClick={() => copyPrompt(c.id, c.prompt)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[var(--color-glow)] text-[var(--color-primary-light)] text-[12px] hover:bg-[var(--color-primary)]/15 transition-all duration-300 cursor-pointer border border-[var(--color-primary)]/10"
                >
                  {copiedId === c.id ? <><CheckCircle size={13} /> 已复制</> : <><Copy size={13} /> 复制</>}
                </button>
              </div>

              {/* 提示词区块 — 充裕的内边距和行高，按原文换行分段 */}
              <div
                className="bg-[var(--color-bg)] rounded-xl px-7 py-6 mb-10 text-[13.5px] text-[var(--color-text-secondary)] leading-[2] border border-[var(--color-border)] whitespace-pre-line select-none"
                onCopy={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
              >
                {c.prompt}
              </div>

              {/* 分隔线 — 在提示词和标签之间提供视觉缓冲 */}
              <div className="border-t border-[var(--color-border)] my-7" />

              {/* 标签区 — 更大间距 */}
              <div className="flex items-center flex-wrap gap-3 mb-2">
                {c.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg bg-[rgba(255,255,255,0.03)] text-[12px] text-[var(--color-text-tertiary)] border border-[var(--color-border)]">
                    {tag}
                  </span>
                ))}
              </div>

              {/* 技巧提示 — 更大间距与内边距 */}
              {c.tips && (
                <div className="mt-7 flex items-start gap-3 text-[13px] text-[var(--color-primary-light)] bg-[var(--color-glow)] rounded-xl px-6 py-5 leading-[1.8]">
                  <span className="shrink-0 text-[14px] mt-0.5">💡</span>
                  <span>{c.tips}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

