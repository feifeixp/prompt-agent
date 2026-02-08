# 🚀 快速开始

## 从静态资产迁移到 Worker 模式

本项目已从 Cloudflare 静态资产模式迁移到 Worker 模式，以支持环境变量配置。

## ⚡ 快速部署（3 步）

### 1️⃣ 构建项目
```bash
npm run build
```

### 2️⃣ 配置环境变量（Secrets）
```bash
wrangler secret put VITE_DEEPSEEK_API_KEY
# 输入你的 DeepSeek API Key 后按回车

wrangler secret put VITE_OPENROUTER1_API_KEY
# 输入你的 OpenRouter API Key 后按回车
```

### 3️⃣ 部署
```bash
wrangler deploy
```

完成！🎉

## 🔧 本地开发

### 1. 配置本地环境变量
```bash
cp .dev.vars.example .dev.vars
```

编辑 `.dev.vars` 填入你的 API Keys。

### 2. 本地测试
```bash
npm run cf:dev
```

访问 `http://localhost:8787`

## 📝 主要变更

### 新增文件
- `_worker.js` - Worker 入口文件
- `.dev.vars.example` - 环境变量示例
- `CLOUDFLARE_DEPLOYMENT.md` - 详细部署文档

### 修改文件
- `wrangler.jsonc` - 从静态资产模式改为 Worker 模式
- `package.json` - 添加部署脚本
- `.gitignore` - 忽略 `.dev.vars`

## 🔑 环境变量说明

项目需要以下环境变量：

- `VITE_DEEPSEEK_API_KEY` - DeepSeek API 密钥
- `VITE_OPENROUTER1_API_KEY` - OpenRouter API 密钥

## 📚 更多信息

详细部署说明请查看 [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md)

