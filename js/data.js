// ============================================================
// 模拟数据 - 用于演示
// 真实场景应替换为后端 API 调用
// ============================================================

// 平台类型定义
const PLATFORMS = {
  douyin: { name: '抖音', color: '#fe2c55', icon: '🎵', shortName: '抖音' },
  xiaohongshu: { name: '小红书', color: '#ff2442', icon: '📕', shortName: '小红书' },
  wechat: { name: '公众号', color: '#07c160', icon: '💬', shortName: '公众号' },
  bilibili: { name: 'B 站', color: '#fb7299', icon: '📺', shortName: 'B 站' }
};

// 模拟用户（MOCK 已清空 · 方案 B1）
// 真实场景下：用户身份由后端账号系统管理；演示期用户首次进首页时自动建匿名 user
const MOCK_USERS = [];

// 当前登录用户（演示用：默认 u1）
const CURRENT_USER_KEY = 'contentlist_current_user';

// 用户档案库（localStorage）—— MOCK 清空后，用户的昵称/头像/bio 存在这里
const USERS_KEY = 'contentlist_users';

// 收藏的清单（localStorage）
const FAVORITE_LISTS_KEY = 'contentlist_favorite_lists';

// 用户创建的清单（localStorage）
const USER_LISTS_KEY = 'contentlist_user_lists';

// 用户发布的单条（localStorage）
const USER_ITEMS_KEY = 'contentlist_user_items';

// 举报记录（localStorage）
const REPORTS_KEY = 'contentlist_reports';

// 操作日志（localStorage）
const ADMIN_LOGS_KEY = 'contentlist_admin_logs';

// 用户封禁状态（localStorage）
const BANNED_USERS_KEY = 'contentlist_banned_users';

// 管理员账号（演示用，hard-coded）
const ADMIN_ACCOUNT = { username: 'admin', password: 'jmy-12345' };
const ADMIN_SESSION_KEY = 'contentlist_admin_session';

// 应用版本号 - 升级时递增
// 强制刷新机制：localStorage 记录上次访问版本，跨大版本时自动提示清理缓存
// 1.0.1：MOCK 清空（B1）+ 登录页自动建匿名 user + 5 页面加 footer + 软删除冗余文件
const APP_VERSION = '1.0.1';
const APP_VERSION_KEY = 'contentlist_app_version';
const APP_BUILD = '20260827';

// 敏感词字典 (200 个) - 命中后阻止发布
const SENSITIVE_WORDS = [
  // ========== 1. 政治/国家相关 ==========
  '反动', '颠覆', '法轮', '轮子功', '李洪志', '天安门事件', '六四', '8964', '坦克人',
  '反华', '台独', '港独', '疆独', '藏独', '国家领导人负面', '领导人绰号',
  '国家机密', '国家领导人', '政治谣言', '政治敏感', '政局动荡',

  // ========== 2. 色情低俗 ==========
  '色情', '黄片', '黄网', '黄色', '裸聊', '裸照', '裸体', '一丝不挂', '做爱', '性交',
  '口交', '肛交', '3p', '群交', '换妻', '约炮', '一夜情', '援交', '包养', '小三',
  '二奶', '情妇', '一夜情', '色情网站', '黄色网站', 'AV', 'A片', '小电影', '毛片', '艳照门',
  '激情视频', '成人片', '福利姬', '足交', '乳交', '颜射', '内射', '手淫', '自慰', '撸管',
  '叫床', '骚逼', '肉棒', '鸡巴', '阴茎', '阴道', '阴唇', '阴蒂', '性伴侣', '一夜情',
  '成人网站', '黄图', '约火包', '车震', '偷情', '卖淫', '嫖娼', '援交妹', '外围女', '一夜情',

  // ========== 3. 赌博 ==========
  '赌博', '赌球', '赌马', '麻将赌博', '百家乐', '德州扑克赌博', '赌场', '澳门赌场', '网上赌场',
  '网络赌博', '网赌', '博彩', '外围博彩', '地下赌场', '澳门博彩', '骰子赌', '押注', '下注赌博',
  '赌资', '赌债', '洗钱', '洗码', '洗码房', '跑路', '高赔率', '现金网', '葡京', '威尼斯人',
  '金沙', '娱乐城', '线上赌场', '赌大小', '赌球网站', '赌外围', '赌马网站', '六合', '时时彩赌博',

  // ========== 4. 暴力/恐怖 ==========
  '血腥', '暴力', '恐怖袭击', '恐怖分子', '砍人', '枪击', '爆炸袭击', '自杀式袭击', '人肉炸弹',
  '绑架', '撕票', '虐杀', '肢解', '斩首', '处决', '屠杀', '种族灭绝', '灭门', '活埋',
  '凌迟', '穿刺', '虐待', '酷刑', 'ISIS', '基地组织', '东突', '恐怖主义',

  // ========== 5. 毒品 ==========
  '毒品', '冰毒', '海洛因', '大麻', 'K粉', '摇头丸', '麻古', '冰壶', '冰妹', '溜冰',
  '嗑药', '白粉', '大烟', '鸦片', '吗啡', '可卡因', '杜冷丁', '吸毒', '注射毒品', '制毒',
  '贩毒', '毒贩子', '毒品交易', '叶子', 'weed', '大麻烟', 'K他命', '神仙水', '蓝精灵毒品',

  // ========== 6. 诈骗/违禁 ==========
  '诈骗', '刷单', '刷单诈骗', '兼职诈骗', '中奖诈骗', '退款诈骗', '冒充客服', '冒充公安', '冒充银行',
  '贷款诈骗', '信用卡诈骗', '投资诈骗', '股票诈骗', '期货诈骗', '外汇诈骗', '数字货币诈骗', '传销',
  '非法集资', '庞氏骗局', '杀猪盘', '重金求子', '高薪兼职', '网络兼职', '微信兼职', '代刷',
  '代刷信誉', '刷钻', '刷会员', '套现', '信用卡套现', '洗钱', '跑分', '跑分平台', '跑分软件',
  '跑分工具', '收款码', '洗钱码', '跑分码', '跑分工作室', '跑分佣金', '租码', '租收款码',
  '高佣金', '人兽', '邪教组织', '邪教',

  // ========== 7. 邪教/黑产 ==========
  '法轮功', '全能神', '观音法门', '三班仆人派', '灵灵教', '华藏宗门', '主神教', '被立王', '统一教',
  '呼喊派', '门徒会', '血水圣灵', '灵仙真佛宗', '圆顿法门', '中功', '香功', '菩提功', '清海无上师',

  // ========== 8. 歧视/仇恨言论 ==========
  '黑鬼', '黑奴', '黄种人', '东亚病夫', '支那', '猴子', '黑猩猩', '回回', '穆斯林猪', '绿教',
  '犹太猪', '黑墨', '黑命贵', '逆向歧视', '种族歧视', '民族歧视', '地域歧视', '河南人偷井盖',

  // ========== 9. 违法/违禁品 ==========
  '枪支', '弹药', '军火', '军火商', '枪械', '手枪', '步枪', '冲锋枪', '手雷', '炸弹',
  '管制刀具', '弹簧刀', '匕首', '弩', '违禁药品', '处方药', '迷药', '听话水', '乖乖水',
  '迷魂药', '迷奸药', '假币', '伪造货币', '假钞', '伪造证件', '假证', '办证', '代考',
  '替考', '考试作弊', '论文代写', '代写论文', '代做作业', '身份证生成', '身份证伪造',

  // ========== 10. 邪教/迷信/医托 ==========
  '算命', '占卜', '看相', '风水', '转运', '消灾', '菩萨保佑', '神医', '老中医', '祖传秘方',
  '包治百病', '一针见效', '神药', '偏方治大病', '保健品治病', '养生秘笈', '气功大师', '特医',

  // ========== 11. 违禁广告/导流 ==========
  '代孕', '代孕妈妈', '供卵', '供精', '捐卵', '捐精', '卖卵', '卖精', '代生孩子', '试管包成功',
  '代开发票', '代刷信用卡', '代购', '代购药', '印度药', '仿制药', '走私', '水货代购', '微商代理',

  // ========== 12. 其他违规 ==========
  '代练', '代刷游戏', '外挂', '游戏外挂', '破解版', '盗版', '破解', '盗号', '洗号',
  '开挂', '辅助', '代充', '低价充值', '代练', '代打', '陪玩', '陪聊', '美女上门',
  '上门服务', '特殊服务', '包夜', '全套', '莞式', '桑拿全套', '红灯区', '一夜情', '招嫖',
  '约妹', '包养平台', '外围', '空姐', '模特', '兼职', '模特兼职', '兼职模特', '商务伴游'
];

// 检查文本是否命中敏感词
// 返回 { ok: true } 或 { ok: false, error, words }
function validateBeforePublish(text) {
  if (!text) return { ok: true };
  const hits = [];
  const lower = String(text).toLowerCase();
  for (const word of SENSITIVE_WORDS) {
    if (word && lower.indexOf(word.toLowerCase()) !== -1) {
      hits.push(word);
      if (hits.length >= 3) break;
    }
  }
  if (hits.length === 0) return { ok: true };
  return {
    ok: false,
    error: '内容含敏感词（' + hits.join('、') + '），请修改后再发布',
    words: hits
  };
}

// 点赞的单条（localStorage）
const LIKED_ITEMS_KEY = 'contentlist_liked_items';

// 单条内容（item）- MOCK 已清空 · 方案 B1
const MOCK_ITEMS = [];
  {
    id: 'i1',
    url: 'https://v.douyin.com/iJh7q8x9/',
    platform: 'douyin',
    title: '3分钟学会万能酱汁，拌面拌饭都好吃',
    intro: '厨房小白救星，这个酱汁我回购了5次',
    creatorId: 'u2',
    likeCount: 286,
    collectCount: 89,
    createTime: '2026-08-20 14:30'
  },
  {
    id: 'i2',
    url: 'https://www.xiaohongshu.com/explore/66a8b2c1d4e5f00012345678',
    platform: 'xiaohongshu',
    title: '30平小客厅改造前后对比',
    intro: '租房党必看!低预算也能住出高级感',
    creatorId: 'u3',
    likeCount: 1240,
    collectCount: 432,
    createTime: '2026-08-19 21:15'
  },
  {
    id: 'i3',
    url: 'https://mp.weixin.qq.com/s/abc123def456ghi789jkl',
    platform: 'wechat',
    title: '我们如何在与AI共处的时代,保持思考的能力',
    intro: '一篇让我重新审视自己工作方式的文章',
    creatorId: 'u1',
    likeCount: 567,
    collectCount: 198,
    createTime: '2026-08-18 10:00'
  },
  {
    id: 'i4',
    url: 'https://www.douyin.com/video/7234567890123456789',
    platform: 'douyin',
    title: '居家5分钟颈椎放松训练',
    intro: '打工人每天做一次，脖子不酸了',
    creatorId: 'u4',
    likeCount: 1893,
    collectCount: 712,
    createTime: '2026-08-17 08:30'
  },
  {
    id: 'i5',
    url: 'https://www.xiaohongshu.com/discovery/item/65a1c3d4e5f6000098765432',
    platform: 'xiaohongshu',
    title: '8月好物分享｜均价50的生活好物',
    intro: '用了三个月才敢推荐，都是真香款',
    creatorId: 'u2',
    likeCount: 856,
    collectCount: 304,
    createTime: '2026-08-16 19:45'
  },
  {
    id: 'i6',
    url: 'https://mp.weixin.qq.com/s/xyz789abc012def345ghi',
    platform: 'wechat',
    title: '小镇做题家二十年：关于阶层、运气与自我',
    intro: '读到凌晨三点，转发给所有从县城出来的朋友',
    creatorId: 'u3',
    likeCount: 2103,
    collectCount: 654,
    createTime: '2026-08-15 23:00'
  },
  {
    id: 'i7',
    url: 'https://v.douyin.com/iKm9w3r2/',
    platform: 'douyin',
    title: '日落氛围感拍照姿势合集',
    intro: '和姐妹出门拍了一组，太出片了',
    creatorId: 'u1',
    likeCount: 1547,
    collectCount: 521,
    createTime: '2026-08-14 18:20'
  },
  {
    id: 'i8',
    url: 'https://www.xiaohongshu.com/explore/66b9c3d2e5f7000012345678',
    platform: 'xiaohongshu',
    title: '一人食晚餐｜番茄牛腩的懒人做法',
    intro: '炖一锅能吃三天，配米饭绝绝子',
    creatorId: 'u2',
    likeCount: 932,
    collectCount: 287,
    createTime: '2026-08-13 19:00'
  },
  {
    id: 'i9',
    url: 'https://mp.weixin.qq.com/s/def456abc789ghi012jkl',
    platform: 'wechat',
    title: '为什么我们越来越难交到新朋友',
    intro: '看完有一种被理解的感觉，推荐',
    creatorId: 'u1',
    likeCount: 743,
    collectCount: 245,
    createTime: '2026-08-12 22:30'
  },
  {
    id: 'i10',
    url: 'https://www.douyin.com/video/7298765432109876543',
    platform: 'douyin',
    title: '办公室5分钟瘦手臂',
    intro: '不跑不跳，工位上就能做',
    creatorId: 'u4',
    likeCount: 3214,
    collectCount: 1187,
    createTime: '2026-08-11 12:00'
  },
  {
    id: 'i11',
    url: 'https://www.xiaohongshu.com/explore/65c0d4e3f6a8000023456789',
    platform: 'xiaohongshu',
    title: 'ins风卧室布置｜低成本改造',
    intro: '500块改造的卧室，朋友来了都不想走',
    creatorId: 'u3',
    likeCount: 1782,
    collectCount: 643,
    createTime: '2026-08-10 16:45'
  },
  {
    id: 'i12',
    url: 'https://mp.weixin.qq.com/s/ghi012jkl345mno678pqr',
    platform: 'wechat',
    title: '一种慢生活方式：逃离多巴胺陷阱',
    intro: '给我关掉所有短视频app的勇气',
    creatorId: 'u1',
    likeCount: 489,
    collectCount: 167,
    createTime: '2026-08-09 11:20'
  }
];

// 清单（list）- 每个清单包含多个item - MOCK 已清空 · 方案 B1
const MOCK_LISTS = [];
  {
    id: 'l1',
    title: '周末做饭灵感库',
    description: '一个人也要好好吃饭｜收藏的50个菜谱',
    creatorId: 'u2',
    anonymous: false,
    coverColor: '#fe2c55',
    coverEmoji: '🍳',
    itemIds: ['i1', 'i8'],
    collectCount: 1284,
    createTime: '2026-08-20'
  },
  {
    id: 'l2',
    title: '30岁前必读的10篇公众号长文',
    description: '在信息洪流里，这几篇值得反复读',
    creatorId: 'u1',
    anonymous: false,
    coverColor: '#07c160',
    coverEmoji: '📚',
    itemIds: ['i3', 'i6', 'i9', 'i12'],
    collectCount: 3567,
    createTime: '2026-08-18'
  },
  {
    id: 'l3',
    title: '租房改造灵感合集',
    description: '没钱也能住成自己喜欢的样子',
    creatorId: 'u3',
    anonymous: false,
    coverColor: '#722ed1',
    coverEmoji: '🏠',
    itemIds: ['i2', 'i11'],
    collectCount: 892,
    createTime: '2026-08-15'
  },
  {
    id: 'l4',
    title: '办公室自救指南',
    description: '打工人的颈椎、腰椎、视力，一个都不能少',
    creatorId: 'u4',
    anonymous: false,
    coverColor: '#ffa940',
    coverEmoji: '💪',
    itemIds: ['i4', 'i10'],
    collectCount: 2156,
    createTime: '2026-08-12'
  },
  {
    id: 'l5',
    title: '出片宝藏姿势',
    description: '和姐妹出门再也不愁怎么拍',
    creatorId: 'u1',
    anonymous: false,
    coverColor: '#eb2f96',
    coverEmoji: '📸',
    itemIds: ['i7'],
    collectCount: 1453,
    createTime: '2026-08-14'
  },
  {
    id: 'l6',
    title: '深夜解忧电台',
    description: '一些适合夜深人静读的文章',
    creatorId: 'u1',
    anonymous: true,  // 演示匿名
    coverColor: '#2f54eb',
    coverEmoji: '🌙',
    itemIds: ['i3', 'i6', 'i9', 'i12'],
    collectCount: 678,
    createTime: '2026-08-10'
  },
  {
    id: 'l7',
    title: '我私藏的生活好物',
    description: '均价50，用了三个月才敢推荐',
    creatorId: 'u2',
    anonymous: false,
    coverColor: '#13c2c2',
    coverEmoji: '🛍️',
    itemIds: ['i5'],
    collectCount: 567,
    createTime: '2026-08-16'
  }
];

// ============================================================
// 辅助函数
// ============================================================

// 读：localStorage 中的所有用户档案
function getLocalUsers() {
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) { return []; }
}

// 写：保存 localStorage 用户列表
function saveLocalUsers(users) {
  try { localStorage.setItem(USERS_KEY, JSON.stringify(users)); } catch (e) {}
}

// 根据 ID 获取用户（MOCK + localStorage）
function getUserById(id) {
  const fromMock = MOCK_USERS.find(u => u.id === id);
  if (fromMock) return fromMock;
  return getLocalUsers().find(u => u.id === id);
}

// 写：创建匿名用户（MOCK 清空后的登录入口）
// 用途：用户首次进首页 / 登录页提交时自动建档
// 入参：name（昵称）、avatar（首字）、avatarColor（背景色）
// 返回：user 对象
function createAnonUser({ name, avatar, avatarColor, bio }) {
  const user = {
    id: 'u_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    name: (name || '匿名').slice(0, 20),
    avatar: (avatar || (name ? name[0] : '匿')).slice(0, 2),
    avatarColor: avatarColor || pickRandomColor(),
    bio: (bio || '').slice(0, 100),
    createdAt: new Date().toISOString().slice(0, 10)
  };
  const users = getLocalUsers();
  users.push(user);
  saveLocalUsers(users);
  return user;
}

// 根据 ID 获取 item
function getItemById(id) {
  return MOCK_ITEMS.find(i => i.id === id);
}

// 根据 ID 获取 list
function getListById(id) {
  return MOCK_LISTS.find(l => l.id === id);
}

// 根据平台获取样式信息
function getPlatformInfo(platformKey) {
  return PLATFORMS[platformKey] || { name: platformKey, color: '#999', icon: '🔗', shortName: '链接' };
}

// 格式化数字 (1234 -> 1.2k)
function formatCount(num) {
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
}

// 格式化时间
function formatTime(timeStr) {
  // 简化处理
  return timeStr;
}

// ============================================================
// 链接类型校验
// ============================================================

// 识别链接属于哪个平台
function detectPlatform(url) {
  if (!url || typeof url !== 'string') return null;
  url = url.trim();

  // 抖音: v.douyin.com / www.douyin.com / www.iesdouyin.com / m.douyin.com
  if (/^https?:\/\/(v\.|www\.|m\.)?douyin\.com\//i.test(url)) return 'douyin';
  if (/^https?:\/\/(www\.)?iesdouyin\.com\//i.test(url)) return 'douyin';

  // 小红书: xiaohongshu.com / xhslink.com
  if (/^https?:\/\/(www\.)?xiaohongshu\.com\//i.test(url)) return 'xiaohongshu';
  if (/^https?:\/\/xhslink\.com\//i.test(url)) return 'xiaohongshu';

  // 公众号: mp.weixin.qq.com
  if (/^https?:\/\/mp\.weixin\.qq\.com\//i.test(url)) return 'wechat';

  // B 站: bilibili.com / b23.tv 短链 / space.bilibili.com 用户主页
  if (/^https?:\/\/(www\.|m\.)?bilibili\.com\//i.test(url)) return 'bilibili';
  if (/^https?:\/\/b23\.tv\//i.test(url)) return 'bilibili';
  if (/^https?:\/\/space\.bilibili\.com\//i.test(url)) return 'bilibili';

  return null;  // 不在支持范围内
}

// 从混合文本中提取 URL
// 支持用户在 APP 里"分享 → 复制"得到的整段文字：
// 例: "3.05 IiP:/ 06/15 :1pm 推荐一部电影 https://v.douyin.com/j4HStcrqopI/ 复制此链接，打开Dou音搜索..."
function extractUrlFromText(text) {
  if (!text) return null;
  // 匹配所有 http(s) 开头的 URL（贪婪到空格或中文）
  const matches = text.match(/https?:\/\/[^\s]+/gi);
  if (!matches) return null;
  // 找第一个合法平台的 URL
  for (const raw of matches) {
    // 清理尾部可能粘连的中文 / 标点
    const clean = raw.replace(/[\s\u4e00-\u9fa5.,;:!?。，；：！？)\]）]+$/, '');
    if (detectPlatform(clean)) return clean;
  }
  return null;
}

// 校验链接是否合法（支持纯 URL 或混合分享文本）
function validateUrl(text) {
  if (!text || !text.trim()) {
    return { valid: false, error: '请粘贴链接或分享内容' };
  }

  const trimmed = text.trim();

  // 1) 整段就是纯 URL（开头是 http），直接校验
  if (/^https?:\/\//i.test(trimmed)) {
    const platform = detectPlatform(trimmed);
    if (platform) return { valid: true, platform, url: trimmed };
  }

  // 2) 否则按混合文本处理：先尝试从中提取 URL
  const extracted = extractUrlFromText(trimmed);
  if (!extracted) {
    return { valid: false, error: '未找到有效链接，请粘贴抖音/小红书/公众号/B 站的分享内容' };
  }

  const platform = detectPlatform(extracted);
  if (!platform) {
    return { valid: false, error: '仅支持抖音、小红书、公众号、B 站链接' };
  }

  return { valid: true, platform, url: extracted };
}

// ============================================================
// 收藏 / 点赞 状态管理（演示用 localStorage）
// ============================================================

// 当前登录用户
function getCurrentUser() {
  try {
    // URL 参数 ?loginas=u1 直接登录（演示用）
    const urlParams = new URLSearchParams(window.location.search);
    const loginAs = urlParams.get('loginas');
    if (loginAs) {
      localStorage.setItem(CURRENT_USER_KEY, loginAs);
      // 去掉 URL 参数（保持 URL 干净）
      urlParams.delete('loginas');
      const newSearch = urlParams.toString();
      const newUrl = window.location.pathname + (newSearch ? '?' + newSearch : '') + window.location.hash;
      window.history.replaceState({}, '', newUrl);
    }
    const userId = localStorage.getItem(CURRENT_USER_KEY);
    if (userId) return getUserById(userId);
  } catch (e) {}
  return null;
}

function setCurrentUser(userId) {
  try {
    localStorage.setItem(CURRENT_USER_KEY, userId);
  } catch (e) {}
}

function logout() {
  try {
    localStorage.removeItem(CURRENT_USER_KEY);
  } catch (e) {}
}

// ============================================================
// 开发模式开关（生产环境默认 false，需要明确开启）
// ============================================================

// 启用方式：URL 加 ?dev=1
// 关闭方式：不带 ?dev= 或手动 localStorage.removeItem('contentlist_dev_mode')
function isDevMode() {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('dev') === '1') {
      try { localStorage.setItem('contentlist_dev_mode', '1'); } catch (e) {}
      return true;
    }
    return localStorage.getItem('contentlist_dev_mode') === '1';
  } catch (e) { return false; }
}

// ============================================================
// 版本升级管理
// ============================================================

// 检查并处理版本升级
// - 跨大版本（major）变化时提示用户清理
// - 跨次要版本（minor）变化时自动迁移
function checkAppVersion() {
  try {
    const stored = localStorage.getItem(APP_VERSION_KEY);
    if (stored === APP_VERSION) return { upgraded: false };

    const oldV = stored ? parseVersion(stored) : { major: 0, minor: 0, patch: 0 };
    const newV = parseVersion(APP_VERSION);

    // 跨大版本：清理旧数据 + 提示
    if (newV.major > oldV.major) {
      const cleared = clearAllAppData();
      try { localStorage.setItem(APP_VERSION_KEY, APP_VERSION); } catch (e) {}
      return { upgraded: true, major: true, cleared, oldV, newV };
    }

    // 次要版本：保留数据，只更新版本号
    try { localStorage.setItem(APP_VERSION_KEY, APP_VERSION); } catch (e) {}
    return { upgraded: true, major: false, oldV, newV };
  } catch (e) {
    return { upgraded: false };
  }
}

function parseVersion(v) {
  const m = (v || '0.0.0').match(/(\d+)\.(\d+)\.(\d+)/);
  return m ? { major: +m[1], minor: +m[2], patch: +m[3] } : { major: 0, minor: 0, patch: 0 };
}

function clearAllAppData() {
  const keys = [
    CURRENT_USER_KEY, FAVORITE_LISTS_KEY, USER_LISTS_KEY, USER_ITEMS_KEY,
    LIKED_ITEMS_KEY, REPORTS_KEY, BANNED_USERS_KEY, ADMIN_LOGS_KEY,
    ADMIN_SESSION_KEY
  ];
  let cleared = 0;
  keys.forEach(k => {
    try { localStorage.removeItem(k); cleared++; } catch (e) {}
  });
  return cleared;
}

// ============================================================
// 用户创建的清单 / 单条（localStorage 持久化）
// ============================================================

// 清单封面颜色 / emoji 随机池
const COVER_COLORS = ['#fe2c55', '#ff2442', '#07c160', '#722ed1', '#ffa940', '#13c2c2', '#eb2f96', '#2f54eb'];
const COVER_EMOJIS = ['📚', '🎨', '🍳', '🏠', '💪', '📷', '🎵', '✈️', '☕', '🌙', '🎮', '🌿', '🍰', '🛍️'];
function pickRandomColor() { return COVER_COLORS[Math.floor(Math.random() * COVER_COLORS.length)]; }
function pickRandomEmoji() { return COVER_EMOJIS[Math.floor(Math.random() * COVER_EMOJIS.length)]; }

// 读：用户创建的清单
function getUserLists() {
  try {
    const data = localStorage.getItem(USER_LISTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) { return []; }
}

// 读：所有清单（mock + user）
function getAllLists() {
  return [...MOCK_LISTS, ...getUserLists()];
}

// 读：按 ID（覆盖 mock）
function getListById(id) {
  return getAllLists().find(l => l.id === id);
}

// 读：当前用户的清单
function getCurrentUserLists() {
  const user = getCurrentUser();
  if (!user) return [];
  return getAllLists().filter(l => l.creatorId === user.id);
}

// 写：创建清单（追加到 user 列表）
// 自动生成清单简介（基于内容，无需 AI）
// 1 条：用其介绍；多条：N 个平台合集
function autoGenerateIntro(list) {
  const items = (list.itemIds || []).map(id => getItemById(id)).filter(Boolean);
  if (items.length === 0) return '';
  if (items.length === 1) return items[0].intro || '';
  const platforms = [...new Set(items.map(i => getPlatformInfo(i.platform).shortName))];
  return `${items.length} 个${platforms.join('+')}合集`;
}

function createUserList({ title, description, anonymous }) {
  const user = getCurrentUser();
  if (!user) return null;
  const now = new Date().toISOString().slice(0, 10);
  const list = {
    id: 'l_' + Date.now(),
    title: (title || '').trim(),
    description: (description || '').trim(),
    creatorId: user.id,
    anonymous: !!anonymous,
    coverColor: pickRandomColor(),
    coverEmoji: pickRandomEmoji(),
    itemIds: [],
    collectCount: 0,
    createTime: now,
    updatedTime: now
  };
  const lists = getUserLists();
  lists.push(list);
  try { localStorage.setItem(USER_LISTS_KEY, JSON.stringify(lists)); } catch (e) {}
  return list;
}

// 编辑清单（仅创建者可改）
// returns: { ok: true, list } | { ok: false, error }
function editUserList(listId, updates) {
  const user = getCurrentUser();
  if (!user) return { ok: false, error: '未登录' };
  const lists = getUserLists();
  const list = lists.find(l => l.id === listId);
  if (!list) return { ok: false, error: '清单不存在' };
  if (list.creatorId !== user.id) return { ok: false, error: '无权编辑' };

  // 白名单字段
  if (typeof updates.title === 'string') list.title = updates.title.trim();
  if (typeof updates.description === 'string') list.description = updates.description.trim();
  if (typeof updates.anonymous === 'boolean') list.anonymous = updates.anonymous;

  list.updatedTime = new Date().toISOString().slice(0, 10);
  try { localStorage.setItem(USER_LISTS_KEY, JSON.stringify(lists)); } catch (e) {}
  return { ok: true, list };
}

// 写：把 item 加入清单
function addItemToUserList(itemId, listId) {
  const lists = getUserLists();
  const list = lists.find(l => l.id === listId);
  if (!list) return false;
  if (!list.itemIds.includes(itemId)) {
    list.itemIds.push(itemId);
    try { localStorage.setItem(USER_LISTS_KEY, JSON.stringify(lists)); } catch (e) {}
  }
  return true;
}

// 读：用户发布的单条
function getUserItems() {
  try {
    const data = localStorage.getItem(USER_ITEMS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) { return []; }
}

// 读：所有单条（user 在前，更新鲜）
function getAllItems() {
  return [...getUserItems(), ...MOCK_ITEMS];
}

// 读：按 ID
function getItemById(id) {
  return getAllItems().find(i => i.id === id);
}

// 写：发布单条
function publishUserItem({ url, intro, platform }) {
  const user = getCurrentUser();
  if (!user) return null;
  const item = {
    id: 'i_' + Date.now(),
    url: url,
    platform: platform,
    title: '',
    intro: (intro || '').trim(),
    creatorId: user.id,
    likeCount: 0,
    collectCount: 0,
    createTime: new Date().toISOString().slice(0, 16).replace('T', ' ')
  };
  const items = getUserItems();
  items.unshift(item); // 新的在前
  try { localStorage.setItem(USER_ITEMS_KEY, JSON.stringify(items)); } catch (e) {}
  return item;
}

// ============================================================
// 举报 / 审核
// ============================================================

// 读：所有举报
function getAllReports() {
  try {
    const data = localStorage.getItem(REPORTS_KEY);
    if (data) return JSON.parse(data);
    // 第一次访问：写一批演示数据
    const seed = seedReports();
    try { localStorage.setItem(REPORTS_KEY, JSON.stringify(seed)); } catch (e) {}
    return seed;
  } catch (e) { return []; }
}

// 写：新增举报
function addReport({ type, targetId, reason, description, reporterId }) {
  const reports = getAllReports();
  const r = {
    id: 'r_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    type,           // 'list' | 'item' | 'user'
    targetId,
    reason,         // 'spam' | 'porn' | 'fraud' | 'infringement' | 'other'
    description: (description || '').trim(),
    reporterId: reporterId || 'u_anon',
    status: 'pending',  // 'pending' | 'approved' | 'rejected'
    createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
  };
  reports.unshift(r);
  try { localStorage.setItem(REPORTS_KEY, JSON.stringify(reports)); } catch (e) {}
  return r;
}

// 写：处理举报（通过/拒绝）
function handleReport(reportId, action) {
  const reports = getAllReports();
  const r = reports.find(x => x.id === reportId);
  if (!r) return false;
  r.status = action; // 'approved' | 'rejected'
  r.handledAt = new Date().toISOString().slice(0, 16).replace('T', ' ');
  r.handlerId = 'admin';
  try { localStorage.setItem(REPORTS_KEY, JSON.stringify(reports)); } catch (e) {}
  return true;
}

// 演示举报数据（MOCK 已清空 · 方案 B1）—— 不再 seed 任何 MOCK id 的举报
function seedReports() {
  return [];
}

// ============================================================
// 用户封禁
// ============================================================

function getBannedUserIds() {
  try {
    const data = localStorage.getItem(BANNED_USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) { return []; }
}

function isBanned(userId) {
  return getBannedUserIds().includes(userId);
}

function banUser(userId) {
  const ids = getBannedUserIds();
  if (!ids.includes(userId)) {
    ids.push(userId);
    try { localStorage.setItem(BANNED_USERS_KEY, JSON.stringify(ids)); } catch (e) {}
  }
  return true;
}

function unbanUser(userId) {
  const ids = getBannedUserIds().filter(id => id !== userId);
  try { localStorage.setItem(BANNED_USERS_KEY, JSON.stringify(ids)); } catch (e) {}
  return true;
}

// ============================================================
// 操作日志
// ============================================================

function getAdminLogs() {
  try {
    const data = localStorage.getItem(ADMIN_LOGS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) { return []; }
}

function addAdminLog(action, target, details) {
  const logs = getAdminLogs();
  logs.unshift({
    id: 'log_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    operatorId: 'admin',
    operatorName: 'admin',
    action,         // 'delete_list' | 'ban_user' | 'approve_report' | ...
    target: target || '',
    details: details || '',
    createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
  });
  // 限制最近 200 条
  if (logs.length > 200) logs.length = 200;
  try { localStorage.setItem(ADMIN_LOGS_KEY, JSON.stringify(logs)); } catch (e) {}
}

// ============================================================
// 管理员鉴权
// ============================================================

function adminLogin(username, password) {
  if (username === ADMIN_ACCOUNT.username && password === ADMIN_ACCOUNT.password) {
    try { localStorage.setItem(ADMIN_SESSION_KEY, '1'); } catch (e) {}
    return true;
  }
  return false;
}

function adminLogout() {
  try { localStorage.removeItem(ADMIN_SESSION_KEY); } catch (e) {}
}

function isAdminLoggedIn() {
  try { return localStorage.getItem(ADMIN_SESSION_KEY) === '1'; } catch (e) { return false; }
}

// ============================================================
// 后台管理操作（删清单 / 删内容）
// ============================================================

// 删除用户清单（从 localStorage 移除）
function adminDeleteUserList(listId) {
  const lists = getUserLists().filter(l => l.id !== listId);
  try { localStorage.setItem(USER_LISTS_KEY, JSON.stringify(lists)); } catch (e) {}
  return true;
}

// 删除用户单条（从 localStorage 移除）
function adminDeleteUserItem(itemId) {
  const items = getUserItems().filter(i => i.id !== itemId);
  try { localStorage.setItem(USER_ITEMS_KEY, JSON.stringify(items)); } catch (e) {}
  // 同时从所有 user 清单的 itemIds 中移除
  const lists = getUserLists().map(l => ({
    ...l,
    itemIds: l.itemIds.filter(id => id !== itemId)
  }));
  try { localStorage.setItem(USER_LISTS_KEY, JSON.stringify(lists)); } catch (e) {}
  return true;
}

// 编辑清单（仅改 title/description，演示用）
function adminUpdateList(listId, updates) {
  const lists = getUserLists();
  const list = lists.find(l => l.id === listId);
  if (!list) return false;
  Object.assign(list, updates);
  try { localStorage.setItem(USER_LISTS_KEY, JSON.stringify(lists)); } catch (e) {}
  return true;
}

// 编辑单条
function adminUpdateItem(itemId, updates) {
  const items = getUserItems();
  const item = items.find(i => i.id === itemId);
  if (!item) return false;
  Object.assign(item, updates);
  try { localStorage.setItem(USER_ITEMS_KEY, JSON.stringify(items)); } catch (e) {}
  return true;
}

// 描述：举报原因中文
const REPORT_REASON_TEXT = {
  spam: '垃圾广告',
  porn: '色情低俗',
  fraud: '欺诈诱导',
  infringement: '侵权搬运',
  other: '其他原因'
};

// 描述：举报类型中文
const REPORT_TYPE_TEXT = {
  list: '清单',
  item: '内容',
  user: '用户'
};

// 获取已收藏的清单 ID 列表
function getFavoriteListIds() {
  try {
    const data = localStorage.getItem(FAVORITE_LISTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) { return []; }
}

function isFavorite(listId) {
  return getFavoriteListIds().includes(listId);
}

function toggleFavorite(listId) {
  const ids = getFavoriteListIds();
  const idx = ids.indexOf(listId);
  if (idx >= 0) {
    ids.splice(idx, 1);
  } else {
    ids.push(listId);
  }
  try {
    localStorage.setItem(FAVORITE_LISTS_KEY, JSON.stringify(ids));
  } catch (e) {}
  return idx < 0;  // 返回 true 表示已收藏
}

// 获取已点赞的 item ID 列表
function getLikedItemIds() {
  try {
    const data = localStorage.getItem(LIKED_ITEMS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) { return []; }
}

function isLiked(itemId) {
  return getLikedItemIds().includes(itemId);
}

function toggleLike(itemId) {
  const ids = getLikedItemIds();
  const idx = ids.indexOf(itemId);
  if (idx >= 0) {
    ids.splice(idx, 1);
  } else {
    ids.push(itemId);
  }
  try {
    localStorage.setItem(LIKED_ITEMS_KEY, JSON.stringify(ids));
  } catch (e) {}
  return idx < 0;  // 返回 true 表示已点赞
}

// ============================================================
// 数据导出（本地浏览器存储模式）
// 用途：
//   1. 用户主动备份（防止换设备/清缓存丢数据）
//   2. 未来接后端时，开发者可基于这份 JSON 批量迁移到云端
// 字段说明：仅包含用户自己的数据，不含 MOCK 演示数据
// ============================================================
function exportMyData() {
  const user = getCurrentUser();
  if (!user) return { ok: false, error: '未登录' };

  const data = {
    __meta: {
      formatVersion: '1.0',
      appVersion: APP_VERSION,
      exportedAt: new Date().toISOString(),
      source: '内容清单（本地浏览器存储演示版）',
      note: '未来接入云端后，开发者可基于此文件批量迁移到服务器（id 冲突时按 createdAt 合并）'
    },
    user: {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      avatarColor: user.avatarColor,
      bio: user.bio
    },
    lists: getUserLists(),                 // 用户创建的清单
    items: getUserItems(),                 // 用户发布的单条
    favoriteListIds: getFavoriteListIds(), // 收藏的清单 id
    likedItemIds: getLikedItemIds()        // 点赞的 item id
  };

  try {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const date = new Date().toISOString().slice(0, 10);
    a.download = `内容清单-备份-${user.name}-${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
    return {
      ok: true,
      fileName: a.download,
      count: { lists: data.lists.length, items: data.items.length }
    };
  } catch (e) {
    return { ok: false, error: e.message || '导出失败' };
  }
}
