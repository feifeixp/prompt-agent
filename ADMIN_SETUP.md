# 案例库后台管理系统部署指南

## 📋 功能概述

案例库后台管理系统允许管理员：
- ✅ 添加、编辑、删除案例
- ✅ 上传图片和视频素材
- ✅ 管理案例分类和标签
- ✅ 数据持久化存储在 Cloudflare D1 数据库

## 🚀 部署步骤

### 1. 创建 D1 数据库

```bash
# 创建数据库
wrangler d1 create prompt-agent-db
```

执行后会返回数据库 ID，类似：
```
✅ Successfully created DB 'prompt-agent-db'
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 2. 更新配置文件

将返回的 `database_id` 复制到 `wrangler.jsonc` 文件中：

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "prompt-agent-db",
    "database_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  // 替换为你的数据库 ID
  }
]
```

### 3. 初始化数据库表结构

```bash
# 执行 SQL 脚本创建表
wrangler d1 execute prompt-agent-db --file=./schema.sql
```

### 4. 导入现有案例数据（可选）

如果你想将 `src/data/cases.js` 中的现有案例导入数据库：

```bash
# 创建导入脚本
node scripts/import-cases.js
```

### 5. 本地测试

```bash
# 启动本地开发服务器
npm run dev

# 在另一个终端启动 Worker 本地测试
wrangler dev
```

访问 `http://localhost:5173/admin` 进入管理后台。

**默认登录信息：**
- 用户名：`admin`
- 密码：`admin123`

⚠️ **重要：部署到生产环境前务必修改密码！**

### 6. 部署到生产环境

```bash
# 构建项目
npm run build

# 部署到 Cloudflare
wrangler deploy
```

## 🔐 安全配置

### 修改管理员密码

1. 在 `_worker.js` 中找到登录验证部分：

```javascript
if (username === 'admin' && password === 'admin123') {
```

2. 修改为你的密码，或者使用数据库存储加密后的密码。

### 修改 JWT Secret

在 `_worker.js` 中修改：

```javascript
const JWT_SECRET = 'your-secret-key-change-this-in-production'
```

建议使用环境变量：

```bash
wrangler secret put JWT_SECRET
```

然后在代码中使用 `env.JWT_SECRET`。

## 📁 文件上传配置

目前文件上传功能返回示例 URL。要启用真实的文件上传，需要配置 Cloudflare R2：

### 1. 创建 R2 存储桶

```bash
wrangler r2 bucket create prompt-agent-media
```

### 2. 更新 wrangler.jsonc

```jsonc
"r2_buckets": [
  {
    "binding": "MEDIA_BUCKET",
    "bucket_name": "prompt-agent-media"
  }
]
```

### 3. 实现文件上传逻辑

在 `_worker.js` 的上传 API 中添加：

```javascript
if (path === '/api/admin/upload' && method === 'POST') {
  const formData = await request.formData()
  const file = formData.get('file')
  
  const fileName = `${Date.now()}-${file.name}`
  await env.MEDIA_BUCKET.put(fileName, file.stream())
  
  const url = `https://your-r2-domain.com/${fileName}`
  
  return new Response(JSON.stringify({ url, success: true }), { 
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}
```

## 🎯 使用管理后台

### 访问管理后台

部署后访问：`https://your-domain.com/admin`

### 添加新案例

1. 点击"新建案例"按钮
2. 填写案例信息：
   - 选择分类
   - 输入标题
   - 设置难度（1-4）
   - 编写提示词
   - 添加素材说明
   - 填写使用提示
3. 上传图片或视频（可选）
4. 点击"保存案例"

### 编辑案例

1. 在案例列表中点击"编辑"图标
2. 修改案例信息
3. 点击"保存案例"

### 删除案例

1. 在案例列表中点击"删除"图标
2. 确认删除操作

## 🔄 数据迁移

### 从静态数据迁移到数据库

创建 `scripts/import-cases.js`：

```javascript
import { cases } from '../src/data/cases.js'

// 将案例数据转换为 SQL INSERT 语句
cases.forEach(caseItem => {
  console.log(`
    INSERT INTO cases (id, category, title, difficulty, prompt, assets, tips)
    VALUES (${caseItem.id}, '${caseItem.category}', '${caseItem.title}', 
            ${caseItem.difficulty}, '${caseItem.prompt}', '${caseItem.assets}', 
            '${caseItem.tips}');
  `)
  
  if (caseItem.tags) {
    caseItem.tags.forEach(tag => {
      console.log(`
        INSERT INTO case_tags (case_id, tag) VALUES (${caseItem.id}, '${tag}');
      `)
    })
  }
})
```

## 📊 数据库管理

### 查看数据库内容

```bash
# 查询所有案例
wrangler d1 execute prompt-agent-db --command="SELECT * FROM cases"

# 查询特定分类的案例
wrangler d1 execute prompt-agent-db --command="SELECT * FROM cases WHERE category='commercial'"
```

### 备份数据库

```bash
# 导出数据
wrangler d1 export prompt-agent-db --output=backup.sql
```

### 恢复数据库

```bash
# 从备份恢复
wrangler d1 execute prompt-agent-db --file=backup.sql
```

## 🐛 故障排查

### 问题：无法登录管理后台

- 检查浏览器控制台是否有错误
- 确认 API 路由是否正确配置
- 验证 JWT Secret 是否一致

### 问题：数据库连接失败

- 确认 D1 数据库已创建
- 检查 `wrangler.jsonc` 中的 database_id 是否正确
- 确认数据库表已创建（执行 schema.sql）

### 问题：文件上传失败

- 确认 R2 存储桶已创建
- 检查 R2 绑定配置
- 验证文件大小是否超过限制

## 📝 注意事项

1. **安全性**：生产环境务必修改默认密码和 JWT Secret
2. **备份**：定期备份数据库数据
3. **权限**：只有管理员可以访问后台，普通用户只能查看案例
4. **性能**：D1 数据库有查询限制，大量数据时注意优化查询
5. **成本**：Cloudflare D1 和 R2 有免费额度，超出后会产生费用

## 🔗 相关链接

- [Cloudflare D1 文档](https://developers.cloudflare.com/d1/)
- [Cloudflare R2 文档](https://developers.cloudflare.com/r2/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)

