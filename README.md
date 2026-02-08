# Seedance 2.0 提示词助手

一个基于 React + Vite 构建的 Seedance 2.0 视频生成提示词助手应用。

## 功能特性

### 📚 使用手册
- 完整的 Seedance 2.0 提示词语法指南
- 景别术语、拍摄角度等专业术语速查
- 会员专属内容（景别术语、拍摄角度）
- 内容防复制保护

### 🤖 AI 助手
- 基于 OpenRouter API 的智能问答
- 使用 Google Gemini 2.5 Flash 模型
- 流式响应，实时显示
- 会员专属功能

### 🛠️ 工作台
- 提示词编辑器
- 实时语法检查
- AI 智能优化建议
- 一键复制功能

### 📖 案例库
- 精选提示词案例
- 分类标签筛选
- 一键复制提示词
- 内容防复制保护

## 技术栈

- **前端框架**: React 18
- **构建工具**: Vite
- **样式**: Tailwind CSS + 自定义 CSS
- **图标**: Lucide React
- **Markdown**: Marked
- **AI 服务**: OpenRouter API (Google Gemini 2.5 Flash)

## 安装和运行

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 生产构建
```bash
npm run build
```

### 预览构建结果
```bash
npm run preview
```

## 项目结构

```
seedance-guide/
├── src/
│   ├── components/          # React 组件
│   │   ├── GuideTab.jsx    # 使用手册
│   │   ├── AIAssistantTab.jsx  # AI 助手
│   │   ├── WorkbenchTab.jsx    # 工作台
│   │   ├── CasesTab.jsx    # 案例库
│   │   └── LoginPage.jsx   # 登录页面
│   ├── data/               # 数据文件
│   │   ├── guideContent.js # 手册内容
│   │   └── casesData.js    # 案例数据
│   ├── utils/              # 工具函数
│   │   └── auth.js         # 认证相关
│   ├── App.jsx             # 主应用组件
│   ├── main.jsx            # 入口文件
│   └── index.css           # 全局样式
├── public/                 # 静态资源
├── dist/                   # 构建输出
├── .gitignore
├── package.json
├── vite.config.js
└── README.md
```

## 环境变量

创建 `.env` 文件并配置以下变量：

```env
VITE_OPENROUTER_API_KEY=your_openrouter_api_key
```

## 会员功能

### 会员权益
- 完整的景别术语和拍摄角度内容
- AI 助手无限使用
- AI 提示词优化功能

### 会员判断逻辑
- 通过 `/agent/user/points/info` API 获取会员信息
- `levelCode !== 'BASIC'` 且 `membershipType > 0` 为会员
- 免费用户显示会员限制提示

## 开发日志

详细的开发记录请查看 [DEVLOG.md](./DEVLOG.md)

## 许可证

MIT License

## 联系方式

如有问题或建议，请联系开发团队。

