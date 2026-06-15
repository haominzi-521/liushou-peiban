import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 全国城市天气模拟数据（省会+主要城市，覆盖所有省份）
const cityWeatherDB = {
  // ===== 直辖市 =====
  '北京': { temp: 30, condition: '晴', icon: '☀️', humidity: 35, wind: '3级', visibility: '12km', province: '直辖市' },
  '上海': { temp: 24, condition: '小雨', icon: '🌧️', humidity: 78, wind: '2级', visibility: '8km', province: '直辖市' },
  '天津': { temp: 29, condition: '多云', icon: '⛅', humidity: 45, wind: '3级', visibility: '10km', province: '直辖市' },
  '重庆': { temp: 26, condition: '阴', icon: '☁️', humidity: 75, wind: '1级', visibility: '7km', province: '直辖市' },

  // ===== 华东 =====
  '南京': { temp: 27, condition: '多云', icon: '⛅', humidity: 60, wind: '2级', visibility: '9km', province: '江苏' },
  '苏州': { temp: 26, condition: '小雨', icon: '🌧️', humidity: 82, wind: '2级', visibility: '7km', province: '江苏' },
  '无锡': { temp: 26, condition: '多云', icon: '⛅', humidity: 65, wind: '2级', visibility: '9km', province: '江苏' },
  '杭州': { temp: 25, condition: '小雨', icon: '🌧️', humidity: 80, wind: '2级', visibility: '6km', province: '浙江' },
  '宁波': { temp: 26, condition: '多云', icon: '⛅', humidity: 72, wind: '2级', visibility: '9km', province: '浙江' },
  '温州': { temp: 27, condition: '阴', icon: '☁️', humidity: 78, wind: '2级', visibility: '8km', province: '浙江' },
  '合肥': { temp: 28, condition: '晴', icon: '☀️', humidity: 50, wind: '2级', visibility: '10km', province: '安徽' },
  '福州': { temp: 30, condition: '多云', icon: '⛅', humidity: 72, wind: '2级', visibility: '10km', province: '福建' },
  '厦门': { temp: 31, condition: '晴', icon: '☀️', humidity: 75, wind: '3级', visibility: '11km', province: '福建' },
  '济南': { temp: 29, condition: '晴', icon: '☀️', humidity: 38, wind: '3级', visibility: '13km', province: '山东' },
  '青岛': { temp: 26, condition: '多云', icon: '⛅', humidity: 70, wind: '4级', visibility: '11km', province: '山东' },
  '南昌': { temp: 30, condition: '晴', icon: '☀️', humidity: 62, wind: '2级', visibility: '11km', province: '江西' },

  // ===== 华南 =====
  '广州': { temp: 33, condition: '多云', icon: '⛅', humidity: 82, wind: '1级', visibility: '10km', province: '广东' },
  '深圳': { temp: 31, condition: '雷阵雨', icon: '⛈️', humidity: 88, wind: '3级', visibility: '5km', province: '广东' },
  '珠海': { temp: 32, condition: '阵雨', icon: '🌦️', humidity: 85, wind: '3级', visibility: '6km', province: '广东' },
  '东莞': { temp: 32, condition: '多云', icon: '⛅', humidity: 80, wind: '2级', visibility: '9km', province: '广东' },
  '南宁': { temp: 32, condition: '阵雨', icon: '🌦️', humidity: 84, wind: '2级', visibility: '7km', province: '广西' },
  '桂林': { temp: 30, condition: '多云', icon: '⛅', humidity: 78, wind: '1级', visibility: '8km', province: '广西' },
  '海口': { temp: 34, condition: '雷阵雨', icon: '⛈️', humidity: 85, wind: '3级', visibility: '8km', province: '海南' },
  '三亚': { temp: 33, condition: '晴', icon: '☀️', humidity: 80, wind: '3级', visibility: '12km', province: '海南' },

  // ===== 华中 =====
  '武汉': { temp: 27, condition: '多云', icon: '⛅', humidity: 65, wind: '2级', visibility: '9km', province: '湖北' },
  '长沙': { temp: 29, condition: '晴', icon: '☀️', humidity: 58, wind: '2级', visibility: '10km', province: '湖南' },
  '郑州': { temp: 28, condition: '晴', icon: '☀️', humidity: 42, wind: '3级', visibility: '12km', province: '河南' },
  '洛阳': { temp: 29, condition: '晴', icon: '☀️', humidity: 40, wind: '2级', visibility: '13km', province: '河南' },

  // ===== 华北 =====
  '石家庄': { temp: 29, condition: '晴', icon: '☀️', humidity: 38, wind: '3级', visibility: '12km', province: '河北' },
  '太原': { temp: 25, condition: '晴', icon: '☀️', humidity: 35, wind: '3级', visibility: '14km', province: '山西' },
  '呼和浩特': { temp: 22, condition: '晴', icon: '☀️', humidity: 30, wind: '4级', visibility: '15km', province: '内蒙古' },
  '包头': { temp: 22, condition: '晴', icon: '☀️', humidity: 28, wind: '4级', visibility: '16km', province: '内蒙古' },

  // ===== 东北 =====
  '沈阳': { temp: 22, condition: '晴', icon: '☀️', humidity: 40, wind: '3级', visibility: '13km', province: '辽宁' },
  '大连': { temp: 23, condition: '多云', icon: '⛅', humidity: 65, wind: '4级', visibility: '12km', province: '辽宁' },
  '长春': { temp: 20, condition: '晴', icon: '☀️', humidity: 38, wind: '3级', visibility: '14km', province: '吉林' },
  '哈尔滨': { temp: 18, condition: '晴', icon: '☀️', humidity: 40, wind: '4级', visibility: '15km', province: '黑龙江' },
  '齐齐哈尔': { temp: 17, condition: '多云', icon: '⛅', humidity: 42, wind: '4级', visibility: '14km', province: '黑龙江' },

  // ===== 西北 =====
  '西安': { temp: 28, condition: '晴', icon: '☀️', humidity: 42, wind: '2级', visibility: '11km', province: '陕西' },
  '兰州': { temp: 24, condition: '晴', icon: '☀️', humidity: 28, wind: '3级', visibility: '14km', province: '甘肃' },
  '西宁': { temp: 16, condition: '多云', icon: '⛅', humidity: 40, wind: '3级', visibility: '15km', province: '青海' },
  '银川': { temp: 26, condition: '晴', icon: '☀️', humidity: 25, wind: '3级', visibility: '15km', province: '宁夏' },
  '乌鲁木齐': { temp: 25, condition: '晴', icon: '☀️', humidity: 22, wind: '3级', visibility: '16km', province: '新疆' },

  // ===== 西南 =====
  '成都': { temp: 22, condition: '阴', icon: '☁️', humidity: 70, wind: '2级', visibility: '6km', province: '四川' },
  '绵阳': { temp: 23, condition: '阴', icon: '☁️', humidity: 68, wind: '2级', visibility: '7km', province: '四川' },
  '贵阳': { temp: 23, condition: '小雨', icon: '🌧️', humidity: 82, wind: '2级', visibility: '5km', province: '贵州' },
  '昆明': { temp: 22, condition: '多云', icon: '⛅', humidity: 55, wind: '2级', visibility: '11km', province: '云南' },
  '丽江': { temp: 20, condition: '晴', icon: '☀️', humidity: 45, wind: '2级', visibility: '14km', province: '云南' },
  '拉萨': { temp: 18, condition: '晴', icon: '☀️', humidity: 20, wind: '3级', visibility: '18km', province: '西藏' },

  // ===== 港澳台 =====
  '香港': { temp: 32, condition: '阵雨', icon: '🌦️', humidity: 85, wind: '3级', visibility: '7km', province: '特别行政区' },
  '澳门': { temp: 32, condition: '多云', icon: '⛅', humidity: 82, wind: '3级', visibility: '8km', province: '特别行政区' },
  '台北': { temp: 30, condition: '多云', icon: '⛅', humidity: 75, wind: '3级', visibility: '9km', province: '台湾' },
}

// 根据天气智能推荐穿搭
function generateOutfits(temp, condition) {
  const isRainy = condition.includes('雨')
  const isSnowy = condition.includes('雪')

  let outfits = []

  if (isSnowy || temp < 5) {
    outfits = [
      { id: 1, top: '厚羽绒服', bottom: '棉裤', icon: '🧥👖', tip: '极寒保暖' },
      { id: 2, top: '棉服', bottom: '加绒裤', icon: '🧣👖', tip: '防风御寒' },
      { id: 3, top: '毛衣', bottom: '厚长裤', icon: '👔👖', tip: '室内穿着' },
    ]
  } else if (temp < 10) {
    outfits = [
      { id: 1, top: '羽绒服', bottom: '厚长裤', icon: '🧥👖', tip: '保暖首选' },
      { id: 2, top: '棉服', bottom: '长裤', icon: '🧣👖', tip: '舒适保暖' },
      { id: 3, top: '毛衣', bottom: '加绒裤', icon: '👔👖', tip: '轻薄暖意' },
    ]
  } else if (temp < 15) {
    outfits = [
      { id: 1, top: '厚外套', bottom: '长裤', icon: '🧥👖', tip: '早晚微凉' },
      { id: 2, top: '卫衣', bottom: '长裤', icon: '👕👖', tip: '休闲舒适' },
      { id: 3, top: '毛衣', bottom: '牛仔裤', icon: '👔👖', tip: '经典搭配' },
    ]
  } else if (temp < 20) {
    outfits = [
      { id: 1, top: '长袖', bottom: '长裤', icon: '👔👖', tip: '温度适宜' },
      { id: 2, top: '薄外套', bottom: '长裤', icon: '🧥👖', tip: '可穿可脱' },
      { id: 3, top: '卫衣', bottom: '运动裤', icon: '👕👖', tip: '活力穿搭' },
    ]
  } else if (temp < 25) {
    outfits = [
      { id: 1, top: 'T恤', bottom: '长裤', icon: '👕👖', tip: '清爽舒适' },
      { id: 2, top: '长袖', bottom: '长裤', icon: '👔👖', tip: '防温差' },
      { id: 3, top: '短袖', bottom: '短裤', icon: '👕🩳', tip: '午后偏热' },
    ]
  } else if (temp < 30) {
    outfits = [
      { id: 1, top: 'T恤', bottom: '短裤', icon: '👕🩳', tip: '清凉一夏' },
      { id: 2, top: '短袖', bottom: '裙子', icon: '👗', tip: '甜美风格' },
      { id: 3, top: '防晒衣', bottom: '短裤', icon: '🧥🩳', tip: '户外防晒' },
    ]
  } else {
    outfits = [
      { id: 1, top: '背心', bottom: '短裤', icon: '🎽🩳', tip: '极致凉爽' },
      { id: 2, top: '连衣裙', bottom: '凉鞋', icon: '👗👡', tip: '透气舒适' },
      { id: 3, top: '防晒衣', bottom: '短裤', icon: '🧥🩳', tip: '必备防晒' },
    ]
  }

  if (isRainy) {
    outfits = outfits.map(o => ({ ...o, tip: o.tip + ' · 带伞' }))
    outfits.push({ id: 4, top: '雨衣', bottom: '雨鞋', icon: '🧥👢', tip: '雨天装备' })
  }

  return outfits
}

export const useAppStore = defineStore('app', () => {
  const nickname = ref('小宝贝')
  const points = ref(0)
  const avatar = ref('🧒')

  // 头像选择库
  const avatarOptions = [
    { group: '动物', icons: ['🐶','🐱','🐰','🐻','🐼','🐨','🦊','🐸','🐵','🐣','🦄','🐙'] },
    { group: '蔬菜', icons: ['🍅','🥕','🌽','🥦','🍆','🥑','🍄','🧅'] },
    { group: '物品', icons: ['🎈','🌟','🌈','🍀','🌸','🎵','⚽','📚','🎨','🧩'] },
  ]

  // ===== 个人中心 =====
  // 隐私模式
  const privacyMode = ref(false)
  const privacyDuration = ref(30) // 分钟，0 表示不限时

  // 聊天联系人（持久化，与紧急联系人同步）
  const chatContacts = ref([
    { id: 'c1', name: '妈妈', emoji: '👩', phone: '138****6789', fullPhone: '13812346789', relation: '母亲', special: false },
    { id: 'c2', name: '爸爸', emoji: '👨', phone: '139****8901', fullPhone: '13912348901', relation: '父亲', special: false },
    { id: 'c3', name: '奶奶', emoji: '👵', phone: '137****1234', fullPhone: '13712341234', relation: '祖母', special: false },
  ])
  let contactIdCounter = 10

  function toggleSpecialContact(id) {
    const c = chatContacts.value.find(x => x.id === id)
    if (c) c.special = !c.special
  }
  function addChatContact(name, emoji, phone, relation) {
    chatContacts.value.push({
      id: 'c' + (++contactIdCounter), name, emoji, phone: phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'), fullPhone: phone, relation, special: false
    })
  }

  // 紧急联系人列表（与聊天联系人同步）
  const emergencyContacts = computed(() => chatContacts.value.map(c => ({
    id: c.id, name: c.name, phone: c.phone, fullPhone: c.fullPhone, emoji: c.emoji, relation: c.relation,
  })))
  const currentContactIndex = ref(0)
  const emergencyContact = computed(() => emergencyContacts.value[currentContactIndex.value] || emergencyContacts.value[0])

  function deleteChatContact(id) {
    const idx = chatContacts.value.findIndex(c => c.id === id)
    if (idx !== -1) chatContacts.value.splice(idx, 1)
    if (currentContactIndex.value >= chatContacts.value.length) currentContactIndex.value = 0
  }

  // 亲子对话消息
  const chatMessages = ref([
    { id: 1, from: '妈妈', emoji: '👩', text: '宝贝今天过得开心吗？', time: '10:30', isParent: true },
    { id: 2, from: '小宝贝', emoji: '🧒', text: '开心！我今天跳绳100个了！', time: '10:32', isParent: false },
    { id: 3, from: '妈妈', emoji: '👩', text: '太棒了！继续加油哦～❤️', time: '10:33', isParent: true },
    { id: 4, from: '爸爸', emoji: '👨', text: '晚上爸爸给你打电话，想你了', time: '14:20', isParent: true },
    { id: 5, from: '小宝贝', emoji: '🧒', text: '好！我也想你🥰', time: '14:25', isParent: false },
  ])
  // 任务完成历史（记录日期）
  const taskHistory = ref([
    { date: '6/14', tasks: [
      { title: '做家务', points: 30, source: 'self' },
      { title: '早睡早起', points: 20, source: 'self' },
      { title: '读20分钟书', points: 30, source: 'parent' },
    ]},
    { date: '6/13', tasks: [
      { title: '做家务', points: 30, source: 'self' },
      { title: '早睡早起', points: 20, source: 'self' },
    ]},
  ])

  // 消息已读追踪
  const messageReadStatus = ref({}) // { contactId: true/false }

  // 主题色（马卡龙色系）
  const themeColor = ref('#FF8C42')
  const themePattern = ref('none')
  const fontSize = ref('normal')

  // 任务优先排序
  const hideBottomNav = ref(false)
  const taskPriority = ref('all') // 'all' | 'parent' | 'self'

  // 积分兑换排序
  const rewardSort = ref('default') // 'default' | 'cheap' | 'expensive' | 'favorites'

  const sortedRewards = computed(() => {
    let list = [...rewards.value]
    if (rewardSort.value === 'favorites') {
      list = list.filter(r => favoriteRewards.value.includes(r.id))
      list.sort((a, b) => a.cost - b.cost)
    } else if (rewardSort.value === 'cheap') {
      list.sort((a, b) => a.cost - b.cost)
    } else if (rewardSort.value === 'expensive') {
      list.sort((a, b) => b.cost - a.cost)
    }
    return list
  })

  // 排序后的活跃任务
  const sortedActiveTasks = computed(() => {
    let list = [...allActiveTasks.value]
    if (taskPriority.value === 'parent') list.sort((a, b) => (a.source === 'parent' ? -1 : 1))
    if (taskPriority.value === 'self') list.sort((a, b) => (a.source === 'self' ? -1 : 1))
    return list
  })

  // 所有任务总数（用于进度显示）
  const totalTaskCount = computed(() => allActiveTasks.value.length)
  const doneTaskCount = computed(() => completedTasks.value.length)

  let chatMsgCounter = 10

  const todayTasks = ref([
    { id: 1, title: '跳绳100个', points: 50, done: false, category: '运动', source: 'parent' },
    { id: 2, title: '读20分钟书', points: 30, done: false, category: '学习', source: 'parent' },
  ])

  // 自己布置的任务数量限制
  const selfTaskLimit = 3
  const selfTaskCount = computed(() => extraTasks.value.filter(t => t.source === 'self').length)

  // 用户自定义任务
  const extraTasks = ref([])

  // 待审批任务
  const pendingTasks = ref([])

  // 所有活跃任务（未完成的）
  const allActiveTasks = computed(() => {
    const all = [...todayTasks.value, ...extraTasks.value]
    return all.filter(t => !t.done)
  })

  // 已完成任务
  const completedTasks = computed(() => {
    const all = [...todayTasks.value, ...extraTasks.value]
    return all.filter(t => t.done)
  })

  // 推荐任务模板（按分类分组）
  const recommendedTasks = [
    { id: 'r1', title: '做家务', points: 30, icon: '🧹', category: '生活' },
    { id: 'r2', title: '早睡早起', points: 20, icon: '😴', category: '习惯' },
    { id: 'r3', title: '帮长辈按摩', points: 40, icon: '💆', category: '孝心' },
    { id: 'r4', title: '整理房间', points: 25, icon: '📦', category: '生活' },
    { id: 'r5', title: '喝满8杯水', points: 15, icon: '💧', category: '健康' },
    { id: 'r6', title: '写日记', points: 35, icon: '✏️', category: '学习' },
    { id: 'r7', title: '背古诗', points: 30, icon: '📖', category: '学习' },
    { id: 'r8', title: '跳绳', points: 45, icon: '🪢', category: '运动' },
    { id: 'r9', title: '跑步', points: 50, icon: '🏃', category: '运动' },
    { id: 'r10', title: '浇花', points: 15, icon: '🌻', category: '生活' },
    { id: 'r11', title: '刷牙2次', points: 10, icon: '🪥', category: '习惯' },
    { id: 'r12', title: '给爸妈打电话', points: 40, icon: '📞', category: '孝心' },
  ]

  // 推荐任务按分类分组
  const recommendedByCategory = computed(() => {
    const groups = {}
    recommendedTasks.forEach(t => {
      if (!groups[t.category]) groups[t.category] = []
      groups[t.category].push(t)
    })
    return groups
  })

  // 积分兑换奖励（数值上调10倍）
  const rewards = ref([
    { id: 'rw1', name: '冰淇淋', cost: 500, icon: '🍦', stock: 3 },
    { id: 'rw2', name: '游戏30分钟', cost: 1000, icon: '🎮', stock: 1 },
    { id: 'rw3', name: '看动画片', cost: 800, icon: '📺', stock: 2 },
    { id: 'rw4', name: '去公园玩', cost: 1500, icon: '🎠', stock: 1 },
    { id: 'rw5', name: '买小玩具', cost: 2000, icon: '🧸', stock: 1 },
    { id: 'rw6', name: '选晚餐菜单', cost: 600, icon: '🍽️', stock: 5 },
    { id: 'rw7', name: '看电影', cost: 1200, icon: '🎬', stock: 2 },
    { id: 'rw8', name: '买绘本', cost: 1800, icon: '📚', stock: 1 },
    { id: 'rw9', name: '去动物园', cost: 3000, icon: '🦁', stock: 1 },
    { id: 'rw10', name: '新书包', cost: 2500, icon: '🎒', stock: 1 },
  ])

  // 收藏的奖励
  const favoriteRewards = ref([])

  function toggleFavoriteReward(rewardId) {
    const idx = favoriteRewards.value.indexOf(rewardId)
    if (idx >= 0) favoriteRewards.value.splice(idx, 1)
    else favoriteRewards.value.push(rewardId)
  }

  // 兑换记录
  const redeemHistory = ref([])

  // ===== 快乐记录 =====
  // 美食日记
  const foodDiary = ref([
    { id: 1, date: '6/14', name: '披萨', emoji: '🍕', rating: '好评', meal: '午餐' },
    { id: 2, date: '6/14', name: '拉面', emoji: '🍜', rating: '中评', meal: '晚餐' },
    { id: 3, date: '6/13', name: '蛋糕', emoji: '🍰', rating: '超赞', meal: '点心' },
    { id: 4, date: '6/13', name: '水果沙拉', emoji: '🥗', rating: '好评', meal: '早餐' },
    { id: 5, date: '6/12', name: '冰淇淋', emoji: '🍦', rating: '超赞', meal: '点心' },
  ])

  // 父母美食日记
  const parentFoodDiary = ref([
    { id: 'p1', date: '6/14', name: '红烧肉', emoji: '🍖', rating: '超赞', meal: '午餐', by: '妈妈' },
    { id: 'p2', date: '6/13', name: '清蒸鱼', emoji: '🐟', rating: '好评', meal: '晚餐', by: '爸爸' },
    { id: 'p3', date: '6/13', name: '番茄炒蛋', emoji: '🍅', rating: '超赞', meal: '午餐', by: '妈妈' },
    { id: 'p4', date: '6/12', name: '炖鸡汤', emoji: '🍲', rating: '超赞', meal: '晚餐', by: '妈妈' },
  ])

  // 日历备注（节日/生日）
  const calendarNotes = ref({
    '6/1': { type: 'holiday', text: '🎈 儿童节', color: '#FF6B6B' },
    '6/15': { type: 'father', text: '👔 父亲节', color: '#42A5F5' },
    '5/11': { type: 'mother', text: '🌸 母亲节', color: '#EC407A' },
    '6/14': { type: 'birthday', text: '🎂 小美生日', color: '#FFB347' },
  })

  let foodIdCounter = 10

  // 美食排行榜（按出现次数+好评数排序）
  const foodRankings = computed(() => {
    const counts = {}
    foodDiary.value.forEach(f => {
      if (!counts[f.name]) counts[f.name] = { name: f.name, emoji: f.emoji, count: 0, ratings: [] }
      counts[f.name].count++
      counts[f.name].ratings.push(f.rating)
    })
    return Object.values(counts)
      .map(f => ({
        ...f,
        score: f.count + (f.ratings.filter(r => r === '超赞').length * 2) + f.ratings.filter(r => r === '好评').length,
        topRating: f.ratings.includes('超赞') ? '超赞' : f.ratings.includes('好评') ? '好评' : '中评',
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
  })

  // 父母美食排行榜
  const parentFoodRankings = computed(() => {
    const counts = {}
    parentFoodDiary.value.forEach(f => {
      if (!counts[f.name]) counts[f.name] = { name: f.name, emoji: f.emoji, count: 0, ratings: [] }
      counts[f.name].count++
      counts[f.name].ratings.push(f.rating)
    })
    return Object.values(counts)
      .map(f => ({
        ...f,
        score: f.count + (f.ratings.filter(r => r === '超赞').length * 2) + f.ratings.filter(r => r === '好评').length,
        topRating: f.ratings.includes('超赞') ? '超赞' : f.ratings.includes('好评') ? '好评' : '中评',
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
  })

  // 穿搭月历（扩展 outfitDiary 到整月）
  const outfitCalendarDays = computed(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days = []
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${month + 1}/${d}`
      const existing = outfitDiary.value.find(o => o.date === dateStr)
      days.push({
        day: d,
        date: dateStr,
        hasPhoto: existing?.image !== null || (existing && d >= 12 && d <= 14),
        emoji: d === today.getDate() ? '🧒' : undefined,
        isToday: d === today.getDate(),
      })
    }
    return days
  })

  // 今日美食记录
  const todayFoods = computed(() => {
    const today = new Date()
    const dateStr = `${today.getMonth() + 1}/${today.getDate()}`
    return foodDiary.value.filter(f => f.date === dateStr)
  })

  // 添加美食记录
  function addFoodEntry(emoji, name, meal = '午餐') {
    const today = new Date()
    const dateStr = `${today.getMonth() + 1}/${today.getDate()}`
    foodDiary.value.unshift({
      id: ++foodIdCounter,
      date: dateStr,
      name,
      emoji,
      rating: '好评',
      meal,
    })
  }

  // 给美食打分
  function rateFood(foodId, rating) {
    const food = foodDiary.value.find(f => f.id === foodId)
    if (food) food.rating = rating
  }

  // 删除美食记录
  function deleteFoodEntry(foodId) {
    const idx = foodDiary.value.findIndex(f => f.id === foodId)
    if (idx !== -1) foodDiary.value.splice(idx, 1)
  }

  const weather = ref({
    city: '上海',
    temp: 24,
    condition: '小雨',
    icon: '🌧️',
    humidity: 78,
    wind: '2级',
    visibility: '8km',
    province: '直辖市',
  })

  const outfitRecommendations = computed(() =>
    generateOutfits(weather.value.temp, weather.value.condition)
  )

  const outfitDiary = ref([
    { date: '6/12', image: null },
    { date: '6/13', image: null },
    { date: '6/14', image: null },
  ])

  const roadSafety = ref({
    status: '安全',
    location: '当前位置',
    hasAlerts: false,
  })

  // 地图中心坐标（全国主要城市）
  const mapCenter = computed(() => {
    const coordMap = {
      '上海': [31.2304, 121.4737], '北京': [39.9042, 116.4074], '天津': [39.3434, 117.3616],
      '重庆': [29.4316, 106.9123], '广州': [23.1291, 113.2644], '深圳': [22.5431, 114.0579],
      '成都': [30.5728, 104.0668], '杭州': [30.2741, 120.1551], '武汉': [30.5928, 114.3055],
      '西安': [34.3416, 108.9398], '南京': [32.0603, 118.7969], '哈尔滨': [45.8038, 126.5350],
      '昆明': [25.0389, 102.7183], '苏州': [31.2990, 120.5853], '无锡': [31.4912, 120.3119],
      '宁波': [29.8683, 121.5440], '温州': [28.0006, 120.6994], '合肥': [31.8206, 117.2272],
      '福州': [26.0745, 119.2965], '厦门': [24.4798, 118.0894], '济南': [36.6512, 117.1201],
      '青岛': [36.0671, 120.3826], '南昌': [28.6820, 115.8582], '南宁': [22.8170, 108.3665],
      '桂林': [25.2345, 110.1800], '海口': [20.0174, 110.3492], '三亚': [18.2528, 109.5120],
      '长沙': [28.2282, 112.9388], '郑州': [34.7466, 113.6253], '洛阳': [34.6181, 112.4536],
      '石家庄': [38.0428, 114.5149], '太原': [37.8706, 112.5489], '呼和浩特': [40.8424, 111.7490],
      '包头': [40.6582, 109.8404], '沈阳': [41.8057, 123.4315], '大连': [38.9140, 121.6147],
      '长春': [43.8965, 125.3258], '齐齐哈尔': [47.3543, 123.9180], '兰州': [36.0611, 103.8343],
      '西宁': [36.6171, 101.7785], '银川': [38.4872, 106.2309], '乌鲁木齐': [43.8256, 87.6168],
      '珠海': [22.2707, 113.5767], '东莞': [23.0208, 113.7518], '绵阳': [31.4675, 104.6786],
      '贵阳': [26.6470, 106.6302], '丽江': [26.8721, 100.2299], '拉萨': [29.6500, 91.1000],
      '香港': [22.3193, 114.1694], '澳门': [22.1987, 113.5439], '台北': [25.0330, 121.5654],
    }
    return coordMap[weather.value.city] || [31.2304, 121.4737]
  })

  // 附近安全标记点
  const safetyMarkers = computed(() => {
    const [lat, lng] = mapCenter.value
    return [
      {
        lat: lat + 0.008, lng: lng + 0.006,
        title: '十字路口注意', desc: '车流量大，过马路要小心', type: 'warning',
        icon: '⚠️', distance: '约300m',
      },
      {
        lat: lat - 0.005, lng: lng + 0.010,
        title: '学校路段慢行', desc: '附近有小学，上下学时段限速', type: 'school',
        icon: '🏫', distance: '约500m',
      },
      {
        lat: lat + 0.012, lng: lng - 0.004,
        title: '施工区域绕行', desc: '道路施工中，请走人行道', type: 'danger',
        icon: '🚫', distance: '约650m',
      },
      {
        lat: lat - 0.010, lng: lng - 0.008,
        title: '夜间照明不足', desc: '此路段晚上较暗，避免单独行走', type: 'warning',
        icon: '⚠️', distance: '约800m',
      },
      {
        lat: lat + 0.003, lng: lng - 0.012,
        title: '安全避雨亭', desc: '雨天可在此处避雨等待家长', type: 'info',
        icon: 'ℹ️', distance: '约400m',
      },
    ]
  })

  const outfitAdvice = computed(() => {
    const { temp, condition } = weather.value
    if (condition.includes('雨')) return `${temp}°C${condition}，记得带伞，穿防滑鞋哦～`
    if (temp >= 30) return `${temp}°C高温天气，注意防暑降温！`
    if (temp >= 25) return `${temp}°C暖和宜人，出门活动吧～`
    if (temp >= 15) return `${temp}°C早晚微凉，建议带件薄外套`
    if (temp >= 5) return `${temp}°C天气较冷，注意保暖哦～`
    return `${temp}°C寒冷天气，穿厚点别感冒！`
  })

  const totalPoints = computed(() => points.value)

  // 获取所有省份（分组用）
  const provinces = computed(() => {
    const set = new Set()
    Object.values(cityWeatherDB).forEach(c => set.add(c.province))
    return [...set]
  })

  function changeCity(cityName) {
    if (cityWeatherDB[cityName]) {
      const data = cityWeatherDB[cityName]
      weather.value = {
        city: cityName,
        temp: data.temp,
        condition: data.condition,
        icon: data.icon,
        humidity: data.humidity,
        wind: data.wind,
        visibility: data.visibility,
        province: data.province,
      }
    }
  }

  function getCityList() {
    return Object.keys(cityWeatherDB).map(name => ({
      name,
      ...cityWeatherDB[name],
    }))
  }

  // ===== 个人中心操作 =====
  function updateNickname(newName) {
    if (newName.trim()) nickname.value = newName.trim()
  }
  function setAvatar(av) { avatar.value = av }

  function togglePrivacyMode() {
    privacyMode.value = !privacyMode.value
  }

  function setPrivacyDuration(minutes) {
    privacyDuration.value = minutes
  }

  function triggerSOS() {
    // 模拟SOS呼叫
    alert(`🚨 SOS紧急呼叫已触发！\n正在呼叫${emergencyContact.value.name} ${emergencyContact.value.phone}\n请立即接听！`)
    // 实际APP中会调用系统电话或发送定位短信
  }

  function playVoice(buttonId) {
    const btn = voiceButtons.value.find(b => b.id === buttonId)
    if (!btn || !btn.recorded) {
      alert('该按键尚未录制语音，请联系家长设置')
      return
    }
    // 模拟播放语音
    alert(`🔊 正在播放：${btn.label}...`)
  }

  function switchContact() {
    currentContactIndex.value = (currentContactIndex.value + 1) % emergencyContacts.value.length
  }

  function addCalendarNote(date, note) {
    calendarNotes.value[date] = note
  }

  function removeCalendarNote(date) {
    delete calendarNotes.value[date]
  }

  function sendChatMessage(text, contactName = '') {
    chatMessages.value.push({
      id: ++chatMsgCounter,
      from: nickname.value,
      emoji: avatar.value,
      text,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      isParent: false,
      contactName,
    })
  }

  // 发送任务审批申请
  function sendTaskApplication(contactId, contactName, taskTitle, taskPoints, applicantName, pendingTaskId) {
    const msgId = ++chatMsgCounter
    chatMessages.value.push({
      id: msgId,
      from: applicantName,
      emoji: avatar.value,
      text: `${applicantName} 申请「${taskTitle}」任务\n所获积分为 ${taskPoints} 分`,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      isParent: false,
      contactName,
      type: 'taskApplication',
      applicationData: { taskTitle, taskPoints, applicantName, resolved: false, pendingTaskId },
    })
  }

  // 审批任务申请
  function resolveTaskApplication(msgId, approved) {
    const msg = chatMessages.value.find(m => m.id === msgId)
    if (!msg || !msg.applicationData) return
    msg.applicationData.resolved = true
    msg.applicationData.approved = approved
    const contactName = msg.contactName
    const replyText = approved ? '好的我同意呀 ✅' : '可以再商量一下嘛？🤔'
    chatMessages.value.push({
      id: ++chatMsgCounter,
      from: contactName,
      emoji: chatContacts.value.find(c => c.name === contactName)?.emoji || '👤',
      text: replyText,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      isParent: true,
      contactName,
    })
    // 如果审批通过，激活待审批任务
    if (approved && msg.applicationData.pendingTaskId) {
      const pTask = pendingTasks.value.find(t => t.id === msg.applicationData.pendingTaskId)
      if (pTask) {
        pendingTasks.value = pendingTasks.value.filter(t => t.id !== pTask.id)
        extraTasks.value.push({ ...pTask, pending: false })
      }
    }
    // 如果拒绝，删除待审批任务
    if (!approved && msg.applicationData.pendingTaskId) {
      pendingTasks.value = pendingTasks.value.filter(t => t.id !== msg.applicationData.pendingTaskId)
    }
  }

  // 添加待审批任务
  function addPendingTask(title, points, category) {
    const task = {
      id: ++taskIdCounter,
      title,
      points: parseInt(points) || 10,
      done: false,
      category,
      source: 'self',
      pending: true,
    }
    pendingTasks.value.push(task)
    return task
  }

  function markMessageRead(contactId) {
    messageReadStatus.value[contactId] = true
  }
  function markMessageUnread(contactId) {
    messageReadStatus.value[contactId] = false
  }

  function setThemeColor(color) { themeColor.value = color }
  function setThemePattern(pattern) { themePattern.value = pattern }
  function setFontSize(size) { fontSize.value = size }
  function setTaskPriority(p) { taskPriority.value = p }
  function setRewardSort(s) { rewardSort.value = s }

  let taskIdCounter = 100

  // 完成任务（支持所有任务列表）
  function completeTask(taskId) {
    const all = [...todayTasks.value, ...extraTasks.value]
    const task = all.find(t => t.id === taskId)
    if (task && !task.done) {
      task.done = true
      points.value += task.points
      // 记录到历史
      const today = new Date()
      const dateStr = `${today.getMonth() + 1}/${today.getDate()}`
      const existing = taskHistory.value.find(h => h.date === dateStr)
      if (existing) {
        existing.tasks.push({ title: task.title, points: task.points, source: task.source })
      } else {
        taskHistory.value.unshift({ date: dateStr, tasks: [{ title: task.title, points: task.points, source: task.source }] })
      }
    }
  }

  function undoTask(taskId) {
    const all = [...todayTasks.value, ...extraTasks.value]
    const task = all.find(t => t.id === taskId)
    if (task && task.done) {
      task.done = false
      points.value -= task.points
    }
  }

  // 新建任务
  function addTask(title, pointsValue, category = '自定义', source = 'self') {
    if (source === 'self' && selfTaskCount.value >= selfTaskLimit) {
      return false // 自己布置上限3个
    }
    const task = {
      id: ++taskIdCounter,
      title,
      points: parseInt(pointsValue) || 10,
      done: false,
      category,
      source,
    }
    extraTasks.value.push(task)
    return true
  }

  // 删除任务
  function deleteTask(taskId) {
    const idx = extraTasks.value.findIndex(t => t.id === taskId)
    if (idx !== -1) {
      extraTasks.value.splice(idx, 1)
    }
  }

  // 一键添加推荐任务
  function addRecommendedTask(recTask) {
    const allTitles = [...todayTasks.value, ...extraTasks.value].map(t => t.title)
    if (allTitles.includes(recTask.title)) return false
    if (selfTaskCount.value >= selfTaskLimit) return false
    const task = {
      id: ++taskIdCounter,
      title: recTask.title,
      points: recTask.points,
      done: false,
      category: recTask.category,
      source: 'self',
    }
    extraTasks.value.push(task)
    return true
  }

  // 兑换奖励
  function redeemReward(rewardId) {
    const reward = rewards.value.find(r => r.id === rewardId)
    if (!reward) return false
    if (points.value < reward.cost) return false
    if (reward.stock <= 0) return false
    points.value -= reward.cost
    reward.stock--
    redeemHistory.value.push({
      id: Date.now(),
      name: reward.name,
      icon: reward.icon,
      cost: reward.cost,
      time: new Date().toLocaleTimeString(),
    })
    return true
  }

  return {
    nickname,
    points,
    avatar,
    avatarOptions,
    privacyMode,
    privacyDuration,
    emergencyContact,
    emergencyContacts,
    currentContactIndex,
    chatContacts,
    chatMessages,
    calendarNotes,
    taskHistory,
    messageReadStatus,
    themeColor,
    hideBottomNav,
    themePattern,
    fontSize,
    taskPriority,
    rewardSort,
    favoriteRewards,
    sortedRewards,
    sortedActiveTasks,
    totalTaskCount,
    doneTaskCount,
    parentFoodDiary,
    parentFoodRankings,
    todayTasks,
    extraTasks,
    pendingTasks,
    selfTaskLimit,
    selfTaskCount,
    allActiveTasks,
    completedTasks,
    recommendedTasks,
    recommendedByCategory,
    rewards,
    redeemHistory,
    foodDiary,
    foodRankings,
    outfitCalendarDays,
    todayFoods,
    weather,
    outfitRecommendations,
    outfitDiary,
    roadSafety,
    mapCenter,
    safetyMarkers,
    totalPoints,
    outfitAdvice,
    provinces,
    changeCity,
    getCityList,
    completeTask,
    undoTask,
    addTask,
    addPendingTask,
    deleteTask,
    addRecommendedTask,
    redeemReward,
    addFoodEntry,
    rateFood,
    deleteFoodEntry,
    updateNickname,
    setAvatar,
    togglePrivacyMode,
    setPrivacyDuration,
    triggerSOS,
    switchContact,
    addChatContact,
    deleteChatContact,
    toggleSpecialContact,
    addCalendarNote,
    removeCalendarNote,
    sendChatMessage,
    sendTaskApplication,
    resolveTaskApplication,
    markMessageRead,
    markMessageUnread,
    toggleFavoriteReward,
    setThemeColor,
    setThemePattern,
    setTaskPriority,
    setRewardSort,
  }
})
