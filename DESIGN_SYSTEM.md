# Seedance 2.0 Prompt Agent 设计系统

> 高端暗色调设计系统 - 温暖金 + 冷灰结合的现代化视觉风格

---

## 📐 设计理念

### 核心原则
- **高端暗色调**：深色背景营造专业、沉浸的氛围
- **温暖金色点缀**：使用金色作为主色调，传递品质感和温暖
- **玻璃拟态设计**：半透明卡片配合模糊效果，增强层次感
- **微妙渐变**：背景使用极淡的径向渐变，避免单调
- **精致细节**：细腻的边框、阴影和过渡动画

---

## 🎨 色彩系统

### 主色调（Primary）
```css
--color-primary: #d4a574;           /* 主金色 */
--color-primary-light: #e8c9a0;     /* 浅金色（高亮、链接） */
--color-primary-dark: #b8895a;      /* 深金色（按钮渐变） */
--color-primary-hover: #e0b585;     /* 悬停态金色 */
```

**使用场景**：
- 主要按钮背景
- 链接文字
- 重要标签
- 高亮文本（如 @引用）
- 品牌元素

### 背景色（Background）
```css
--color-bg: #09090b;                /* 主背景（极深灰黑） */
--color-bg-subtle: #0f0f13;         /* 次级背景（稍浅） */
--color-surface: rgba(24, 24, 30, 0.85);        /* 卡片表面（半透明） */
--color-surface-solid: #18181e;     /* 卡片表面（不透明） */
--color-surface-hover: rgba(38, 38, 46, 0.9);   /* 卡片悬停态 */
```

**使用场景**：
- `--color-bg`：页面主背景
- `--color-surface`：玻璃卡片、弹窗、输入框
- `--color-surface-hover`：可交互元素的悬停态

### 边框色（Border）
```css
--color-border: rgba(255, 255, 255, 0.06);      /* 默认边框（极淡） */
--color-border-hover: rgba(255, 255, 255, 0.12); /* 悬停边框（稍亮） */
```

**使用场景**：
- 卡片边框
- 输入框边框
- 分隔线
- 表格边框

### 文字色（Text）
```css
--color-text: #fafaf9;              /* 主文字（几乎白色） */
--color-text-secondary: #a1a1aa;    /* 次要文字（中灰） */
--color-text-tertiary: #71717a;     /* 三级文字（深灰） */
```

**使用场景**：
- `--color-text`：标题、正文、重要信息
- `--color-text-secondary`：描述文字、标签、辅助信息
- `--color-text-tertiary`：占位符、禁用状态、不重要信息

### 强调色（Accent）
```css
--color-accent-green: #4ade80;      /* 成功、完成 */
--color-accent-amber: #fbbf24;      /* 警告、提示 */
--color-accent-red: #f87171;        /* 错误、删除 */
--color-accent-blue: #60a5fa;       /* 信息、链接 */
--color-accent-violet: #a78bfa;     /* 特殊、高级功能 */
```

### 光效色（Glow）
```css
--color-glow: rgba(212, 165, 116, 0.08);  /* 金色光晕 */
```

---

## 🔤 字体系统

### 字体族
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 
             'PingFang SC', 'Hiragino Sans GB', 
             'Microsoft YaHei', sans-serif;
```

**代码字体**：
```css
font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
```

### 字号规范
| 用途 | 字号 | 行高 | CSS 类 |
|------|------|------|--------|
| 大标题 | 22px | 1.3 | `text-[22px]` |
| 中标题 | 20px | 1.4 | `text-[20px]` |
| 小标题 | 18px | 1.4 | `text-[18px]` |
| 正文 | 15px | 1.5 | `text-[15px]` |
| 正文（大） | 14px | 1.6 | `text-[14px]` |
| 辅助文字 | 13px | 1.5 | `text-[13px]` |
| 小字 | 12px | 1.4 | `text-[12px]` |
| 代码 | 13px | 1.7 | `text-[13px]` |

### 字重规范
- **Regular (400)**：正文
- **Medium (500)**：次级标题、标签
- **Semibold (600)**：主标题、按钮、强调文字

---

## 📦 组件样式

### 玻璃卡片（Glass Card）
```css
.glass-card {
  background: var(--color-surface);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--color-border);
  box-shadow: 0 0 0 1px rgba(255,255,255,0.02), 
              0 4px 24px rgba(0,0,0,0.3);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.glass-card:hover {
  border-color: var(--color-border-hover);
  box-shadow: 0 0 0 1px rgba(255,255,255,0.04), 
              0 8px 32px rgba(0,0,0,0.4);
}
```

**使用场景**：
- 案例卡片
- 表单容器
- 弹窗/对话框
- 侧边栏面板

### 主要按钮（Primary Button）
```css
.btn-primary {
  background: linear-gradient(135deg, 
              var(--color-primary-dark), 
              var(--color-primary));
  color: #1a1a1e;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 12px rgba(212, 165, 116, 0.15);
}

.btn-primary:hover {
  box-shadow: 0 4px 20px rgba(212, 165, 116, 0.25);
  transform: translateY(-1px);
}
```

**Tailwind 实现**：
```html
<button class="px-4 py-2 rounded-lg btn-primary">
  按钮文字
</button>
```

### 次要按钮（Secondary Button）
```html
<button class="px-4 py-2 rounded-lg bg-[var(--color-surface)]
               text-[var(--color-text-secondary)]
               hover:text-[var(--color-text)]
               hover:bg-[var(--color-surface-hover)]
               border border-[var(--color-border)]
               transition-colors">
  次要按钮
</button>
```

### 输入框（Input）
```html
<input
  type="text"
  class="w-full px-4 py-2.5 rounded-lg
         bg-[var(--color-surface)]
         border border-[var(--color-border)]
         text-[14px] text-[var(--color-text)]
         focus:outline-none
         focus:border-[var(--color-primary)]/50
         placeholder:text-[var(--color-text-tertiary)]"
  placeholder="请输入..."
/>
```

### 文本域（Textarea）
```html
<textarea
  class="w-full px-4 py-3 rounded-lg
         bg-[var(--color-surface)]
         border border-[var(--color-border)]
         text-[14px] text-[var(--color-text)]
         focus:outline-none
         focus:border-[var(--color-primary)]/50
         resize-none"
  rows="4"
  placeholder="请输入..."
></textarea>
```

### 标签（Tag）
```html
<!-- 普通标签 -->
<span class="px-2.5 py-1 rounded-md
             bg-[var(--color-surface)]
             text-[12px] text-[var(--color-text-secondary)]
             border border-[var(--color-border)]">
  标签
</span>

<!-- 金色高亮标签 -->
<span class="px-2.5 py-1 rounded-md
             bg-[var(--color-primary)]/10
             text-[var(--color-primary-light)]
             text-[12px] font-medium">
  重要标签
</span>
```

### 难度指示器
```html
<!-- 难度 1 -->
<div class="flex gap-1">
  <div class="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-green)]"></div>
  <div class="w-1.5 h-1.5 rounded-full bg-[var(--color-border)]"></div>
  <div class="w-1.5 h-1.5 rounded-full bg-[var(--color-border)]"></div>
  <div class="w-1.5 h-1.5 rounded-full bg-[var(--color-border)]"></div>
</div>

<!-- 难度 2 -->
<div class="flex gap-1">
  <div class="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-amber)]"></div>
  <div class="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-amber)]"></div>
  <div class="w-1.5 h-1.5 rounded-full bg-[var(--color-border)]"></div>
  <div class="w-1.5 h-1.5 rounded-full bg-[var(--color-border)]"></div>
</div>

<!-- 难度 3-4 使用 accent-red -->
```

---

## 🎭 动画效果

### 淡入动画
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.4s ease forwards;
}
```

### 呼吸光效
```css
@keyframes glow-pulse {
  0%, 100% { box-shadow: 0 0 20px rgba(212, 165, 116, 0.05); }
  50% { box-shadow: 0 0 40px rgba(212, 165, 116, 0.1); }
}

.glow-hover:hover {
  animation: glow-pulse 2s ease-in-out infinite;
}
```

### 过渡效果规范
```css
/* 快速交互 */
transition: all 0.15s ease;

/* 标准交互 */
transition: all 0.3s ease;

/* 缓慢展开 */
transition: all 0.5s ease;
```

---

## 📏 间距系统

### 内边距（Padding）
| 用途 | 数值 | Tailwind 类 |
|------|------|-------------|
| 极小 | 4px | `p-1` |
| 小 | 8px | `p-2` |
| 中小 | 12px | `p-3` |
| 中 | 16px | `p-4` |
| 中大 | 20px | `p-5` |
| 大 | 24px | `p-6` |
| 极大 | 32px | `p-8` |

### 外边距（Margin）
同上，使用 `m-*` 类

### 间隙（Gap）
```html
<!-- 卡片间距 -->
<div class="space-y-4">  <!-- 16px 垂直间距 -->

<!-- 按钮组间距 -->
<div class="flex gap-3">  <!-- 12px 水平间距 -->

<!-- 标签组间距 -->
<div class="flex gap-2">  <!-- 8px 水平间距 -->
```

---

## 🖼️ 布局系统

### 容器宽度
```css
/* 标准内容区（1200px + 响应式内边距） */
.layout-container {
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding-left: clamp(40px, 6vw, 96px);
  padding-right: clamp(40px, 6vw, 96px);
}

/* 窄内容区（960px + 响应式内边距） */
.layout-narrow {
  max-width: 960px;
  margin-left: auto;
  margin-right: auto;
  padding-left: clamp(40px, 6vw, 96px);
  padding-right: clamp(40px, 6vw, 96px);
}
```

### 页面区块
```css
.page-section {
  padding-top: clamp(24px, 2vh, 48px);
  padding-bottom: clamp(24px, 2vh, 48px);
}
```

---

## 🎨 背景效果

### 全局背景渐变
```css
#root {
  min-height: 100vh;
  background:
    radial-gradient(ellipse 80% 50% at 50% -20%,
                    rgba(212, 165, 116, 0.04), transparent),
    radial-gradient(ellipse 60% 40% at 80% 100%,
                    rgba(167, 139, 250, 0.03), transparent),
    var(--color-bg);
}
```

**说明**：
- 顶部：淡金色径向渐变（营造温暖感）
- 右下：淡紫色径向渐变（增加层次）
- 底色：深色背景

---

## 📱 响应式设计

### 断点
```css
/* Tailwind 默认断点 */
sm: 640px   /* 小屏幕 */
md: 768px   /* 平板 */
lg: 1024px  /* 笔记本 */
xl: 1280px  /* 桌面 */
2xl: 1536px /* 大屏 */
```

### 响应式字号
```css
/* 使用 clamp 实现流式字号 */
font-size: clamp(14px, 1.5vw, 18px);
```

### 响应式间距
```css
/* 使用 clamp 实现流式间距 */
padding: clamp(20px, 4vw, 48px);
```

---

## 🔧 滚动条样式

```css
::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.15);
}
```

---

## 💬 特殊内容样式

### 代码块
```css
/* 代码块容器 */
pre {
  background: rgba(0, 0, 0, 0.4) !important;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 20px;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.7;
}

/* 代码字体 */
code {
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  font-size: 0.88em;
}

/* 内联代码 */
:not(pre) > code {
  background: rgba(212, 165, 116, 0.1);
  color: var(--color-primary-light);
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.85em;
}
```

### @引用高亮
```css
.prompt-highlight {
  color: var(--color-primary-light);
  font-weight: 600;
}
```

**使用示例**：
```html
<span class="prompt-highlight">@图片1</span>
```

### Markdown 渲染样式
```css
.ai-markdown h1, .ai-markdown h2, .ai-markdown h3, .ai-markdown h4 {
  color: var(--color-text);
  font-weight: 600;
  margin-top: 1.2em;
  margin-bottom: 0.6em;
  line-height: 1.4;
}

.ai-markdown h1 { font-size: 1.3em; }
.ai-markdown h2 { font-size: 1.15em; }
.ai-markdown h3 {
  font-size: 1.05em;
  color: var(--color-primary-light);
}

.ai-markdown p {
  margin-bottom: 0.8em;
  line-height: 1.8;
}

.ai-markdown ul, .ai-markdown ol {
  padding-left: 1.5em;
  margin-bottom: 0.8em;
}

.ai-markdown li {
  margin-bottom: 0.3em;
  line-height: 1.7;
}

.ai-markdown strong {
  color: var(--color-text);
  font-weight: 600;
}

.ai-markdown blockquote {
  border-left: 3px solid var(--color-primary);
  padding-left: 1em;
  margin: 0.8em 0;
  color: var(--color-text-secondary);
  font-style: italic;
}

.ai-markdown table {
  width: 100%;
  border-collapse: collapse;
  margin: 0.8em 0;
  font-size: 0.92em;
}

.ai-markdown th, .ai-markdown td {
  border: 1px solid var(--color-border);
  padding: 8px 12px;
  text-align: left;
}

.ai-markdown th {
  background: rgba(255,255,255,0.03);
  font-weight: 600;
  color: var(--color-text);
}
```

---

## 🎯 图标使用规范

### 图标库
使用 **Lucide React** 图标库

### 图标尺寸
| 用途 | 尺寸 | 代码 |
|------|------|------|
| 小图标 | 14px | `<Icon size={14} />` |
| 标准图标 | 16px | `<Icon size={16} />` |
| 中图标 | 18px | `<Icon size={18} />` |
| 大图标 | 20px | `<Icon size={20} />` |
| 特大图标 | 24px | `<Icon size={24} />` |

### 图标颜色
```html
<!-- 主色图标 -->
<Icon className="text-[var(--color-primary)]" />

<!-- 次要图标 -->
<Icon className="text-[var(--color-text-secondary)]" />

<!-- 三级图标 -->
<Icon className="text-[var(--color-text-tertiary)]" />

<!-- 强调色图标 -->
<Icon className="text-[var(--color-accent-green)]" />
```

---

## 📋 完整组件示例

### 案例卡片
```html
<div class="glass-card rounded-xl p-5 hover:border-[var(--color-border-hover)] transition-colors">
  <!-- 头部 -->
  <div class="flex items-start justify-between mb-3">
    <div>
      <h3 class="text-[15px] font-medium text-[var(--color-text)] mb-1">
        案例标题
      </h3>
      <div class="flex gap-2 text-[12px] text-[var(--color-text-tertiary)]">
        <span>商业广告</span>
        <span>•</span>
        <span>难度 2/4</span>
      </div>
    </div>
    <div class="flex gap-2">
      <button class="p-2 rounded-lg hover:bg-[var(--color-surface-hover)]
                     text-[var(--color-text-tertiary)] transition-colors">
        <Edit2 size={14} />
      </button>
    </div>
  </div>

  <!-- 内容 -->
  <p class="text-[13px] text-[var(--color-text-secondary)] line-clamp-2 mb-3">
    案例描述文字...
  </p>

  <!-- 标签 -->
  <div class="flex flex-wrap gap-2">
    <span class="px-2.5 py-1 rounded-md bg-[var(--color-surface)]
                 text-[12px] text-[var(--color-text-secondary)]
                 border border-[var(--color-border)]">
      标签1
    </span>
    <span class="px-2.5 py-1 rounded-md bg-[var(--color-surface)]
                 text-[12px] text-[var(--color-text-secondary)]
                 border border-[var(--color-border)]">
      标签2
    </span>
  </div>
</div>
```

### 表单容器
```html
<div class="glass-card rounded-xl p-6 max-w-md mx-auto">
  <h2 class="text-[20px] font-semibold text-[var(--color-text)] mb-2 text-center">
    表单标题
  </h2>
  <p class="text-[13px] text-[var(--color-text-secondary)] text-center mb-6">
    表单说明文字
  </p>

  <form class="space-y-4">
    <div>
      <label class="block text-[13px] text-[var(--color-text-secondary)] mb-2">
        字段名称
      </label>
      <input
        type="text"
        class="w-full px-4 py-2.5 rounded-lg bg-[var(--color-surface)]
               border border-[var(--color-border)] text-[14px]
               text-[var(--color-text)] focus:outline-none
               focus:border-[var(--color-primary)]/50"
        placeholder="请输入..."
      />
    </div>

    <button type="submit" class="w-full py-2.5 rounded-lg btn-primary text-[14px]">
      提交
    </button>
  </form>
</div>
```

### 标签页导航
```html
<div class="flex gap-2 mb-6 overflow-x-auto">
  <!-- 激活状态 -->
  <button class="px-4 py-2 rounded-lg bg-[var(--color-primary)]/10
                 text-[var(--color-primary-light)] font-medium
                 text-[13px] whitespace-nowrap">
    当前标签
  </button>

  <!-- 未激活状态 -->
  <button class="px-4 py-2 rounded-lg text-[var(--color-text-tertiary)]
                 hover:text-[var(--color-text-secondary)]
                 hover:bg-[var(--color-surface)] transition-colors
                 text-[13px] whitespace-nowrap">
    其他标签
  </button>
</div>
```

---

## 🎨 CSS 变量完整列表

### 复制即用的 CSS 变量定义
```css
:root {
  /* 主色调 */
  --color-primary: #d4a574;
  --color-primary-light: #e8c9a0;
  --color-primary-dark: #b8895a;
  --color-primary-hover: #e0b585;

  /* 背景色 */
  --color-bg: #09090b;
  --color-bg-subtle: #0f0f13;
  --color-surface: rgba(24, 24, 30, 0.85);
  --color-surface-solid: #18181e;
  --color-surface-hover: rgba(38, 38, 46, 0.9);

  /* 边框色 */
  --color-border: rgba(255, 255, 255, 0.06);
  --color-border-hover: rgba(255, 255, 255, 0.12);

  /* 文字色 */
  --color-text: #fafaf9;
  --color-text-secondary: #a1a1aa;
  --color-text-tertiary: #71717a;

  /* 强调色 */
  --color-accent-green: #4ade80;
  --color-accent-amber: #fbbf24;
  --color-accent-red: #f87171;
  --color-accent-blue: #60a5fa;
  --color-accent-violet: #a78bfa;

  /* 光效 */
  --color-glow: rgba(212, 165, 116, 0.08);
}
```

---

## 📦 快速开始

### 1. 引入 CSS 变量
将上面的 CSS 变量复制到你的全局样式文件中。

### 2. 设置基础样式
```css
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
               'PingFang SC', 'Hiragino Sans GB',
               'Microsoft YaHei', sans-serif;
  background-color: var(--color-bg);
  color: var(--color-text);
  line-height: 1.5;
  font-size: 15px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### 3. 添加背景渐变
```css
#root {
  min-height: 100vh;
  background:
    radial-gradient(ellipse 80% 50% at 50% -20%,
                    rgba(212, 165, 116, 0.04), transparent),
    radial-gradient(ellipse 60% 40% at 80% 100%,
                    rgba(167, 139, 250, 0.03), transparent),
    var(--color-bg);
}
```

### 4. 使用 Tailwind CSS（推荐）
```bash
npm install -D tailwindcss
npx tailwindcss init
```

配置 `tailwind.config.js`：
```js
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

---

## 🎓 设计建议

### ✅ 推荐做法
1. **保持一致性**：在整个应用中使用相同的间距、圆角、阴影
2. **层次分明**：使用不同的文字颜色和字重区分信息层级
3. **适度留白**：给内容足够的呼吸空间
4. **微妙动画**：使用 0.3s 的过渡效果提升交互体验
5. **响应式优先**：使用 clamp() 和 Tailwind 断点确保各设备体验

### ❌ 避免做法
1. 不要使用纯黑 (#000) 或纯白 (#fff) 作为背景
2. 不要过度使用动画和光效
3. 不要使用过于鲜艳的颜色
4. 不要忽略边框和阴影的细节
5. 不要在深色背景上使用低对比度文字

---

## 📞 联系与反馈

如有任何设计相关问题，欢迎反馈！

---

**版本**：v1.0
**更新日期**：2026-02-09
**适用项目**：Seedance 2.0 Prompt Agent 及相关产品

