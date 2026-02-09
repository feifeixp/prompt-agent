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
  {
    id: 3,
    category: 'cinematic',
    title: '电梯惊恐追逐',
    difficulty: 4,
    tags: ['运镜复刻', '希区柯克变焦', '多素材'],
    prompt: '参考@图1的男人形象，他在@图2的电梯中，完全参考@视频1的所有运镜效果还有主角的面部表情，主角在惊恐时希区柯克变焦，然后几个环绕镜头展示电梯内视角，电梯门打开，跟随镜头走出电梯，电梯外场景参考@图片3，男人环顾四周',
    assets: '3张图片 + 1个参考视频',
    tips: '用专业镜头术语（希区柯克变焦、环绕镜头）让模型理解你想要的效果',
  },
  {
    id: 4,
    category: 'creative',
    title: '水墨太极功夫',
    difficulty: 2,
    tags: ['风格化', '特效参考', '水墨'],
    prompt: '黑白水墨风格，@图片1的人物参考@视频1的特效和动作，上演一段水墨太极功夫',
    assets: '1张人物图 + 1个参考视频',
    tips: '简洁但精准：风格+人物+动作参考，三要素缺一不可',
  },
  {
    id: 5,
    category: 'creative',
    title: '天使变身一镜到底',
    difficulty: 4,
    tags: ['转场', '一镜到底', '角色变换'],
    prompt: '将@视频1的素人换成女生，长相参考@图片1；月神的CG形象换成天使，形象参考@图片2，女生蹲下时背后长出翅膀，翅膀挥动时掠过镜头，实现转场，并参考@视频1的运镜和转场效果，从天使的瞳孔进入下一场景，从空中俯拍天使，镜头下移并跟随天使正脸，全程一镜到底',
    assets: '2张图片 + 1个参考视频',
    tips: '复杂场景需要详细描述每个转场节点，用"一镜到底"强调连贯性',
  },
  {
    id: 6,
    category: 'oneshot',
    title: '街头跑酷一镜到底',
    difficulty: 3,
    tags: ['一镜到底', '追踪镜头', '多场景'],
    prompt: '@图片1@图片2@图片3@图片4@图片5，一镜到底的追踪镜头，从街头跟随跑步者上楼梯、穿过走廊、进入屋顶，最终俯瞰城市。',
    assets: '5张场景图',
    tips: '多张图片定义路径节点，用"一镜到底+追踪镜头"确保连贯',
  },
  {
    id: 7,
    category: 'editing',
    title: '泰坦尼克剧情颠覆',
    difficulty: 3,
    tags: ['剧情颠覆', '视频编辑', '对话'],
    prompt: '颠覆@视频1里的剧情，男人眼神从温柔瞬间转为冰冷狠厉，在女主毫无防备的瞬间，猛地将女主从桥上往外推，动作干脆利落，带着蓄谋已久的决绝。女主坠入水中的瞬间，抬头冲男主嘶吼："你从一开始就在骗我！"',
    assets: '1个原始视频',
    tips: '"颠覆"关键词让模型理解要反转剧情，详细描述新的情节走向',
  },
  {
    id: 8,
    category: 'music',
    title: '换装卡点视频',
    difficulty: 3,
    tags: ['音乐卡点', '换装', '节奏'],
    prompt: '海报中的女生在不停的换装，服装参考@图片1@图片2的样式，手中提着@图片3的包，视频节奏参考@视频',
    assets: '3张图片 + 1个音乐参考视频',
    tips: '"视频节奏参考@视频"让模型跟着音乐节拍切换画面',
  },
  {
    id: 9,
    category: 'extend',
    title: '咖啡广告延长',
    difficulty: 3,
    tags: ['视频延长', '品牌展示', '文字出现'],
    prompt: '将@视频1延长15秒。1-5秒：光影透过百叶窗在木桌、杯身上缓缓滑过。6-10秒：一粒咖啡豆从画面上方轻轻飘落，镜头向咖啡豆推进至画面黑屏。11-15秒：英文渐显"Lucky Coffee"，"Breakfast"，"AM 7:00-10:00"。',
    assets: '1个原始视频',
    tips: '延长视频时，生成时长应选新增部分的时长，按时间轴描述新内容',
  },
  {
    id: 10,
    category: 'audio',
    title: '猫狗脱口秀',
    difficulty: 4,
    tags: ['对话演绎', '情感', '脱口秀'],
    prompt: '在"猫狗吐槽间"里的一段吐槽对话，要求情感丰沛，符合脱口秀表演：喵酱（猫主持，舔毛翻眼）："家人们谁懂啊，我身边这位，每天除了摇尾巴、拆沙发，就只会用那种眼神骗人类零食..." 旺仔（狗主持，歪头晃尾巴）："你还好意思说我？你每天睡18个小时..."',
    assets: '2张角色图',
    tips: '写清角色动作、语气、台词，让声音演绎更有感染力',
  },
  {
    id: 11,
    category: 'oneshot',
    title: '谍战红衣女特工',
    difficulty: 4,
    tags: ['一镜到底', '多角色', '悬疑'],
    prompt: '谍战片风格，@图片1作为首帧画面，镜头正面跟拍穿着红风衣的女特工向前走，不断有路人遮挡，走到拐角处消失，一个戴面具的女孩在拐角处躲着恶狠狠的盯着她，形象参考@图片3。镜头往前摇向红衣女特工，她走进一座豪宅消失不见了。全程不要切镜头，一镜到底。',
    assets: '4张场景/角色图',
    tips: '一镜到底场景中，用明确的空间转换词描述镜头路径',
  },
  {
    id: 12,
    category: 'audio',
    title: '地产纪录片旁白',
    difficulty: 3,
    tags: ['旁白', '纪录片', '写实'],
    prompt: '根据提供的写字楼宣传照，生成一段15秒电影级写实风格的地产纪录片，采用2.35:1宽银幕，24fps，细腻的画面风格，其中旁白的音色参考@视频1，拍摄"写字楼的生态"，呈现楼内不同企业的运作，结合旁白阐述写字楼如何成为充满活力的商业生态系统。',
    assets: '3张写字楼照片 + 1个旁白参考视频',
    tips: '专业参数（2.35:1宽银幕、24fps）可以提升画面质感',
  },
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

