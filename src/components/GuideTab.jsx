import { useState, useMemo, useEffect } from 'react'
import { guideSections } from '../data/guideContent'
import { marked } from 'marked'
import { getMembershipInfo } from '../utils/auth'
import { Lock } from 'lucide-react'

export default function GuideTab() {
  const [activeSection, setActiveSection] = useState(guideSections[0]?.id)
  const [isMember, setIsMember] = useState(false)
  const [membershipLoading, setMembershipLoading] = useState(true)

  const currentSection = guideSections.find(s => s.id === activeSection)
  const currentIndex = guideSections.findIndex(s => s.id === activeSection)

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

  // 会员专属章节
  const memberOnlySections = ['shot-scale', 'camera-angle']
  const isCurrentSectionMemberOnly = memberOnlySections.includes(activeSection)

  // 处理内容显示（非会员只显示部分预览）
  const displayContent = useMemo(() => {
    if (!currentSection) return ''

    // 如果是会员专属章节且用户不是会员，只显示部分预览
    if (isCurrentSectionMemberOnly && !isMember) {
      const lines = currentSection.content.split('\n')
      // 显示到表格的前3个数据行（包括标题、表头、前3行数据）
      // 通常是：标题(1) + 空行(1) + 描述(1) + 空行(1) + 小标题(1) + 空行(1) + 表头(2) + 数据(3) = 11行
      const previewLines = lines.slice(0, 11)
      return previewLines.join('\n') + '\n...\n\n*以上仅显示部分内容*'
    }

    return currentSection.content
  }, [currentSection, isCurrentSectionMemberOnly, isMember])

  return (
    // 外层：固定内容高度 + 独立滚动，避免整页“顶满”
    <div className="h-[calc(100vh-120px)] overflow-y-auto">
      {/* 版心画布：居中 + 上下留白，对齐全站布局系统 */}
      <div className="layout-container page-section">
        {/* 三列布局：左侧目录 / 右侧正文（控制行宽） / 自然留白 */}
        <div className="flex items-start gap-8 xl:gap-10">
          {/* 侧边导航 — 按钮之间留出更充裕的节奏间距 */}
          <nav className="w-[240px] shrink-0 border border-[var(--color-border)] bg-[var(--color-bg-subtle)] rounded-2xl overflow-hidden">
            <div className="px-4 pt-4 pb-5">
              <p className="text-[11px] font-medium text-[var(--color-text-tertiary)] uppercase tracking-[0.15em] mb-3 px-1">
                目录导航
              </p>
              <div className="space-y-1.5">
                {guideSections.map(section => {
                  const isSectionMemberOnly = memberOnlySections.includes(section.id)
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-[13px] transition-all duration-300 cursor-pointer flex items-center gap-2 ${
                        activeSection === section.id
                          ? 'bg-[var(--color-surface)] text-[var(--color-primary-light)] font-medium border border-[var(--color-border)] shadow-sm'
                          : 'text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-secondary)]'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          activeSection === section.id
                            ? 'bg-[var(--color-primary)]'
                            : 'bg-[var(--color-text-tertiary)]/30'
                        }`}
                      />
                      <span className="flex-1">{section.title}</span>
                      {isSectionMemberOnly && !isMember && (
                        <Lock size={12} className="text-[var(--color-primary)]/60 shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </nav>

          {/* 内容区域 — 控制最大行宽，营造黄金阅读区 */}
          <div className="flex-1 flex justify-start">
            <div className="max-w-[600px] w-full pr-2 lg:pr-8">
              {/* 面包屑 */}
              <div className="flex items-center gap-2.5 text-[12px] text-[var(--color-text-tertiary)] mb-6 tracking-wide">
                <span>使用手册</span>
                <span className="opacity-40">/</span>
                <span className="text-[var(--color-primary-light)]">{currentSection?.title}</span>
              </div>

              {currentSection && (
                <>
                  <article
                    className="prose prose-invert max-w-none animate-fade-in select-none
                      [&_h2]:text-[18px] [&_h2]:font-semibold [&_h2]:text-[var(--color-text)] [&_h2]:mb-3 [&_h2]:mt-5 [&_h2]:tracking-tight [&_h2]:leading-snug
                      [&_h3]:text-[15px] [&_h3]:font-medium [&_h3]:text-[var(--color-primary-light)] [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:leading-snug
                      [&_p]:text-[var(--color-text-secondary)] [&_p]:leading-[1.6] [&_p]:mb-3 [&_p]:text-[14px]
                      [&_table]:w-full [&_table]:border-collapse [&_table]:mb-4 [&_table]:text-[13px] [&_table]:table-fixed
                      [&_th]:bg-[rgba(255,255,255,0.02)] [&_th]:border [&_th]:border-[var(--color-border)] [&_th]:px-2.5 [&_th]:py-1.5 [&_th]:text-left [&_th]:text-[12px] [&_th]:font-medium [&_th]:text-[var(--color-text-secondary)]
                      [&_td]:border [&_td]:border-[var(--color-border)] [&_td]:px-2.5 [&_td]:py-1.5 [&_td]:text-[13px] [&_td]:text-[var(--color-text-secondary)] [&_td]:leading-[1.5]
                      [&_th:first-child]:w-[20%] [&_td:first-child]:w-[20%] [&_td:first-child]:font-medium [&_td:first-child]:text-[var(--color-text)]
                      [&_blockquote]:border-l-2 [&_blockquote]:border-[var(--color-primary)]/50 [&_blockquote]:bg-[var(--color-glow)] [&_blockquote]:px-3 [&_blockquote]:py-2 [&_blockquote]:rounded-r-xl [&_blockquote]:my-3 [&_blockquote]:text-[13px]
                      [&_code]:bg-[rgba(212,165,116,0.08)] [&_code]:px-2 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:text-[var(--color-primary-light)] [&_code]:text-[12.5px]
                      [&_pre]:bg-[rgba(0,0,0,0.35)] [&_pre]:rounded-xl [&_pre]:p-3 [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:border [&_pre]:border-[var(--color-border)]
                      [&_pre_code]:bg-transparent [&_pre_code]:p-0
                      [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ul]:text-[var(--color-text-secondary)] [&_ul]:space-y-1
                      [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_ol]:text-[var(--color-text-secondary)] [&_ol]:space-y-1
                      [&_li]:text-[14px] [&_li]:leading-[1.5]
                      [&_strong]:text-[var(--color-text)] [&_strong]:font-semibold
                      [&_hr]:border-[var(--color-border)] [&_hr]:my-5"
                    dangerouslySetInnerHTML={{ __html: marked(displayContent) }}
                    onCopy={(e) => e.preventDefault()}
                    onCut={(e) => e.preventDefault()}
                  />

                  {/* 会员专属提示横幅 */}
                  {isCurrentSectionMemberOnly && !isMember && (
                    <div className="mt-6 glass-card rounded-2xl p-6 border-2 border-[var(--color-primary)]/30 bg-gradient-to-br from-[var(--color-glow)] to-transparent">
                      <div className="flex items-start gap-4">
                        <div className="shrink-0 w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center">
                          <Lock size={24} className="text-[var(--color-primary-light)]" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-[16px] font-semibold text-[var(--color-text)] mb-2">🔒 仅会员可用</h3>
                          <p className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed mb-4">
                            以上仅显示部分预览内容。查看完整的{currentSection.title}需要会员权益。
                          </p>
                          <button
                            onClick={() => window.open('https://story.neodomain.cn/home?inviteCode=Yue1413', '_blank')}
                            className="px-5 py-2.5 rounded-lg btn-primary text-[13px] cursor-pointer inline-flex items-center gap-2"
                          >
                            <Lock size={14} />
                            前往官网购买会员
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* 底部章节导航 — 作为整页的“收尾”节奏 */}
              <div className="flex items-center justify-between mt-6 pt-5 border-t border-[var(--color-border)]">
                {currentIndex > 0 ? (
                  <button
                    onClick={() => setActiveSection(guideSections[currentIndex - 1].id)}
                    className="text-[13px] text-[var(--color-text-tertiary)] hover:text-[var(--color-primary-light)] transition-colors cursor-pointer"
                  >
                    ← {guideSections[currentIndex - 1].title}
                  </button>
                ) : (
                  <span />
                )}
                {currentIndex < guideSections.length - 1 ? (
                  <button
                    onClick={() => setActiveSection(guideSections[currentIndex + 1].id)}
                    className="text-[13px] text-[var(--color-text-tertiary)] hover:text-[var(--color-primary-light)] transition-colors cursor-pointer"
                  >
                    {guideSections[currentIndex + 1].title} →
                  </button>
                ) : (
                  <span />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

