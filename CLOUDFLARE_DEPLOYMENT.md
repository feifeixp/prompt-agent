# Cloudflare Workers 部署指南

本项目已配置为 Cloudflare Workers 模式（非静态资产模式），支持环境变量配置。

## 📋 前置要求

1. 安装 Wrangler CLI：
```bash
npm install -g wrangler
```

2. 登录 Cloudflare 账号：
```bash
wrangler login
```

## 🔧 本地开发

### 1. 配置本地环境变量

复制示例文件并填入真实的 API Key：
```bash
cp .dev.vars.example .dev.vars
```

编辑 `.dev.vars` 文件：
```
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key_here
VITE_OPENROUTER1_API_KEY=your_openrouter_api_key_here
```

### 2. 构建项目

```bash
npm run build
```

### 3. 本地测试 Worker

```bash
wrangler dev
```

这将启动本地开发服务器，可以在 `http://localhost:8787` 访问。

## 🚀 部署到 Cloudflare

### 方法一：使用 Secrets（推荐，用于敏感信息）

1. 构建项目：
```bash
npm run build
```

2. 设置环境变量（Secrets）：
```bash
wrangler secret put VITE_DEEPSEEK_API_KEY
# 输入你的 DeepSeek API Key

wrangler secret put VITE_OPENROUTER1_API_KEY
# 输入你的 OpenRouter API Key
```

3. 部署：
```bash
wrangler deploy
```

### 方法二：使用 wrangler.toml 配置（不推荐用于敏感信息）

如果你想在 `wrangler.jsonc` 中直接配置非敏感的环境变量，可以编辑 `vars` 部分：

```jsonc
{
  "vars": {
    "VITE_DEEPSEEK_API_KEY": "your_key_here",
    "VITE_OPENROUTER1_API_KEY": "your_key_here"
  }
}
```

然后部署：
```bash
npm run build
wrangler deploy
```

⚠️ **注意**：不要将敏感的 API Key 直接写入 `wrangler.jsonc` 并提交到 Git！

### 方法三：通过 Cloudflare Dashboard 配置

1. 部署项目：
```bash
npm run build
wrangler deploy
```

2. 在 Cloudflare Dashboard 中配置环境变量：
   - 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - 进入 Workers & Pages
   - 选择你的项目 `prompt-agent`
   - 进入 Settings → Variables
   - 添加环境变量：
     - `VITE_DEEPSEEK_API_KEY`
     - `VITE_OPENROUTER1_API_KEY`

## 🔍 验证部署

部署成功后，访问你的 Worker URL（例如 `https://prompt-agent.your-subdomain.workers.dev`），应该能正常访问应用。

## 📝 项目结构说明

- `_worker.js` - Cloudflare Worker 入口文件，处理请求和环境变量
- `wrangler.jsonc` - Cloudflare Workers 配置文件
- `.dev.vars` - 本地开发环境变量（不提交到 Git）
- `.dev.vars.example` - 环境变量示例文件
- `dist/` - Vite 构建输出目录（静态资产）

## 🔄 更新部署

每次修改代码后：

1. 重新构建：
```bash
npm run build
```

2. 重新部署：
```bash
wrangler deploy
```

## 🐛 故障排查

### 问题：部署后显示 404

**解决方案**：确保已经运行 `npm run build` 生成 `dist` 目录。

### 问题：环境变量未生效

**解决方案**：
1. 检查是否正确设置了 Secrets：`wrangler secret list`
2. 重新部署：`wrangler deploy`

### 问题：本地开发时环境变量未生效

**解决方案**：
1. 确保 `.dev.vars` 文件存在且格式正确
2. 重启 `wrangler dev`

## 📚 参考文档

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Cloudflare Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)

