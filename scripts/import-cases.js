/**
 * 将现有案例数据导入到 D1 数据库
 * 使用方法：node scripts/import-cases.js > import.sql
 * 然后执行：wrangler d1 execute prompt-agent-db --file=import.sql
 */

const cases = [
  {
    id: 1,
    category: 'commercial',
    title: '包包商业展示',
    difficulty: 2,
    tags: ['产品展示', '多图参考', '背景音'],
    prompt: '对@图片2的包包进行商业化的摄像展示，包包的侧面参考@图片1，包包的表面材质参考@图片3，要求将包包的细节均有所展示，背景音恢宏大气',
    assets: '3张图片（产品正面、侧面、材质细节）',
    tips: '多张图片分别指定产品的不同角度和细节，让模型全面了解产品特征',
  },
  {
    id: 2,
    category: 'commercial',
    title: '韩语蝴蝶结广告',
    difficulty: 3,
    tags: ['广告成片', '多场景', '旁白', '快速切换'],
    prompt: '0-2秒画面：快速四格闪切，红、粉、紫、豹纹四款蝴蝶结依次定格，特写缎面光泽与"chéri"品牌字样。3-6秒画面：特写银色磁吸扣"咔嗒"吸合，再轻轻一拉分开，展示丝滑质感与便捷性。7-12秒画面：快速切换佩戴场景。13-15秒画面：四款蝴蝶结并排陈列，品牌名。',
    assets: '4张产品图',
    tips: '按时间轴分段描述，每段画面明确场景、镜头和产品展示方式',
  },
  // 添加更多案例...
]

// 转义 SQL 字符串
function escapeSql(str) {
  if (!str) return ''
  return str.replace(/'/g, "''")
}

// 生成 SQL 插入语句
console.log('-- 导入案例数据到 D1 数据库\n')

cases.forEach(caseItem => {
  console.log(`INSERT INTO cases (id, category, title, difficulty, prompt, assets, tips) VALUES (
  ${caseItem.id},
  '${escapeSql(caseItem.category)}',
  '${escapeSql(caseItem.title)}',
  ${caseItem.difficulty},
  '${escapeSql(caseItem.prompt)}',
  '${escapeSql(caseItem.assets)}',
  '${escapeSql(caseItem.tips)}'
);`)

  if (caseItem.tags && caseItem.tags.length > 0) {
    caseItem.tags.forEach(tag => {
      console.log(`INSERT INTO case_tags (case_id, tag) VALUES (${caseItem.id}, '${escapeSql(tag)}');`)
    })
  }
  
  console.log('')
})

console.log('-- 导入完成')

