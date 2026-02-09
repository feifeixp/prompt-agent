-- Cloudflare D1 数据库表结构
-- 用于存储案例库数据

-- 案例表
CREATE TABLE IF NOT EXISTS cases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  difficulty INTEGER DEFAULT 2,
  prompt TEXT NOT NULL,
  assets TEXT,
  tips TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 案例标签表
CREATE TABLE IF NOT EXISTS case_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id INTEGER NOT NULL,
  tag TEXT NOT NULL,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

-- 案例媒体文件表（图片、视频）
CREATE TABLE IF NOT EXISTS case_media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id INTEGER NOT NULL,
  type TEXT NOT NULL, -- 'image' | 'video'
  url TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

-- 管理员表
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_cases_category ON cases(category);
CREATE INDEX IF NOT EXISTS idx_case_tags_case_id ON case_tags(case_id);
CREATE INDEX IF NOT EXISTS idx_case_media_case_id ON case_media(case_id);

-- 插入默认管理员账号（密码：admin123，需要在实际使用时修改）
-- 注意：这里的密码哈希需要在后端生成
INSERT OR IGNORE INTO admins (id, username, password_hash) 
VALUES (1, 'admin', 'CHANGE_THIS_PASSWORD_HASH');

