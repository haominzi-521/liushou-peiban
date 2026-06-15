<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '../stores'
defineOptions({ name: 'PageHappyRecord' })

const store = useAppStore()

const activeTab = ref('food')
const showAddFood = ref(false)
const newFoodEmoji = ref('🍚')
const newFoodName = ref('')
const newFoodMeal = ref('午餐')
const rankingMode = ref('child') // 'child' | 'parent'
const editingDay = ref(null)
const editNoteText = ref('')

const emojiPalette = ['🍕','🍜','🍰','🍦','🥗','🍔','🌮','🍣','🍩','🍉','🍗','🥟','🍝','🍿','🧁','🥩','🍌','🍪','🍞','🍳']
const mealOptions = ['早餐','午餐','晚餐','点心','夜宵']
const ratingOptions = ['超赞','好评','中评','一般']
const weekDays = ['日','一','二','三','四','五','六']

// 食物按日期分组
const foodByDate = computed(() => {
  const groups = {}
  const all = [...store.foodDiary, ...store.parentFoodDiary]
  all.sort((a, b) => b.date.localeCompare(a.date) || (b.id > a.id ? 1 : -1))
  all.forEach(f => {
    if (!groups[f.date]) groups[f.date] = []
    groups[f.date].push(f)
  })
  return Object.entries(groups)
})

// 当前排行榜
const currentRankings = computed(() =>
  rankingMode.value === 'parent' ? store.parentFoodRankings : store.foodRankings
)

function handleAddFood() {
  if (!newFoodName.value.trim()) return
  store.addFoodEntry(newFoodEmoji.value, newFoodName.value.trim(), newFoodMeal.value)
  newFoodName.value = ''; newFoodEmoji.value = '🍚'; newFoodMeal.value = '午餐'
  showAddFood.value = false
}

function getRatingEmoji(r) {
  return { '超赞':'🤩','好评':'😋','中评':'😐','一般':'😕' }[r] || '😐'
}
function getRatingColor(r) {
  return { '超赞':'#FF6B6B','好评':'#FFB347','中评':'#A0AEC0','一般':'#CBD5E0' }[r] || '#A0AEC0'
}

// 穿搭日历（带节日）
const calendarDays = computed(() => {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = []
  for (let i = 0; i < firstDay; i++) days.push({ day: '', empty: true })
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${month + 1}/${d}`
    const hasRecord = d >= 12 && d <= today.getDate()
    const note = store.calendarNotes[dateStr]
    days.push({
      day: d, date: dateStr,
      isToday: d === today.getDate(),
      hasPhoto: hasRecord,
      emoji: hasRecord ? ['👚','👕','👗','🧥','👔'][(d-12)%5] : undefined,
      note,
    })
  }
  return days
})

function openDayEdit(day) {
  if (day.empty || day.isToday) return
  editingDay.value = day
  editNoteText.value = day.note?.text || ''
}

function saveNote() {
  if (!editingDay.value) return
  if (editNoteText.value.trim()) {
    store.addCalendarNote(editingDay.value.date, {
      type: 'custom',
      text: editNoteText.value.trim(),
      color: '#FFB347',
    })
  } else {
    store.removeCalendarNote(editingDay.value.date)
  }
  editingDay.value = null
}
</script>

<template>
  <div class="happy-record">
    <div class="tab-bar">
      <button class="tab-btn" :class="{ active: activeTab === 'food' }" @click="activeTab = 'food'">🍔 美食</button>
      <button class="tab-btn" :class="{ active: activeTab === 'outfit' }" @click="activeTab = 'outfit'">👗 穿搭</button>
    </div>

    <!-- ======== 美食 ======== -->
    <div v-if="activeTab === 'food'" class="tab-content">
      <div class="card">
        <div class="section-title"><span>📸</span> 今日美食</div>
        <button class="capture-btn" @click="showAddFood = !showAddFood">
          <span class="capture-icon">{{ showAddFood ? '✕' : '📷' }}</span>
          <span class="capture-text">{{ showAddFood ? '取消' : '点击拍照记录美食' }}</span>
        </button>
        <div class="add-food-form" v-if="showAddFood">
          <div class="form-section">
            <label class="form-label">😋 选择图标</label>
            <div class="emoji-grid">
              <span v-for="e in emojiPalette" :key="e" class="emoji-option" :class="{ picked: newFoodEmoji === e }" @click="newFoodEmoji = e">{{ e }}</span>
            </div>
          </div>
          <input v-model="newFoodName" type="text" class="food-input" placeholder="输入食物名称..." @keyup.enter="handleAddFood" />
          <div class="meal-options">
            <span v-for="m in mealOptions" :key="m" class="meal-tag" :class="{ picked: newFoodMeal === m }" @click="newFoodMeal = m">{{ m }}</span>
          </div>
          <button class="submit-food-btn" @click="handleAddFood" :disabled="!newFoodName.trim()">✅ 记录美食</button>
        </div>
        <div class="today-foods" v-if="store.todayFoods.length">
          <div v-for="food in store.todayFoods" :key="food.id" class="food-swipe-wrapper">
            <div class="food-item" :class="{ swiped: food._swiped }"
              @touchstart="food._tx = $event.touches[0].clientX"
              @touchmove="food._dx = $event.touches[0].clientX - (food._tx||0); if(food._dx < -30) food._swiped = true"
              @touchend="if(!food._swiped) {}; if(food._dx > 30) food._swiped = false">
              <span class="food-emoji">{{ food.emoji }}</span>
              <div class="food-info"><span class="food-name">{{ food.name }}</span><span class="food-meal">{{ food.meal }}</span></div>
              <div class="food-rating">
                <span v-for="r in ratingOptions" :key="r" class="rating-star" :style="{ color: food.rating === r ? getRatingColor(r) : '#ddd' }" @click.stop="store.rateFood(food.id, r)">{{ getRatingEmoji(r) }}</span>
              </div>
            </div>
            <div class="swipe-actions" v-show="food._swiped">
              <button class="swipe-btn delete" @click="store.deleteFoodEntry(food.id); food._swiped = false">🗑️</button>
              <button class="swipe-btn cancel" @click="food._swiped = false">↩️</button>
            </div>
          </div>
        </div>
        <div v-else class="empty-hint">今天还没记录美食哦～快拍一张吧！</div>
      </div>

      <!-- 按日期分布 -->
      <div class="card" v-if="foodByDate.length">
        <div class="section-title"><span>📋</span> 美食日记</div>
        <div v-for="[date, foods] in foodByDate" :key="date" class="date-group">
          <div class="date-header">
            <span class="date-text">{{ date }}</span>
            <span class="date-count">{{ foods.length }}条记录</span>
          </div>
          <div v-for="food in foods" :key="food.id" class="food-row">
            <span class="food-emoji-sm">{{ food.emoji }}</span>
            <span class="food-name-sm">{{ food.name }}</span>
            <span class="food-meal-sm">{{ food.meal }}</span>
            <span v-if="food.by" class="food-by">👤{{ food.by }}</span>
            <span class="food-rating-sm" :style="{ color: getRatingColor(food.rating) }">{{ food.rating }}</span>
          </div>
        </div>
      </div>

      <!-- 排行榜切换 -->
      <div class="card ranking-card">
        <div class="ranking-tabs">
          <button class="rank-tab" :class="{ active: rankingMode === 'child' }" @click="rankingMode = 'child'">🧒 我的排行</button>
          <button class="rank-tab" :class="{ active: rankingMode === 'parent' }" @click="rankingMode = 'parent'">👨‍👩‍👧 爸妈排行</button>
        </div>
        <div class="section-title" style="margin-top:12px"><span>🏆</span> 美食排行榜</div>
        <div v-for="(item, index) in currentRankings" :key="item.name" class="rank-item">
          <div class="rank-num" :class="'rank-' + (index + 1)">{{ index + 1 }}</div>
          <span class="rank-emoji">{{ item.emoji }}</span>
          <div class="rank-info"><span class="rank-name">{{ item.name }}</span><span class="rank-tag">{{ item.topRating }}</span></div>
          <div class="rank-score"><span class="rank-thumbs">{{ item.count >= 3 ? '👍👍👍' : item.count >= 2 ? '👍👍' : '👍' }}</span><span class="rank-count">×{{ item.count }}</span></div>
        </div>
        <div v-if="currentRankings.length === 0" class="empty-hint">记录更多美食来上榜吧～</div>
      </div>
    </div>

    <!-- ======== 穿搭 ======== -->
    <div v-if="activeTab === 'outfit'" class="tab-content">
      <div class="card">
        <div class="section-title"><span>📸</span> 今日穿搭</div>
        <button class="capture-btn"><span class="capture-icon">📷</span><span class="capture-text">拍照记录今日穿搭</span></button>
        <p class="capture-hint">每天记录穿搭，一个月后看看风格变化吧～</p>
      </div>

      <!-- 穿搭月历（可编辑+节日） -->
      <div class="card">
        <div class="section-title"><span>📅</span> 穿搭月历</div>
        <div class="month-label">{{ new Date().getFullYear() }}年{{ new Date().getMonth() + 1 }}月</div>
        <div class="weekday-row"><span v-for="d in weekDays" :key="d" class="weekday-cell">{{ d }}</span></div>
        <div class="calendar-grid">
          <div
            v-for="(day, idx) in calendarDays" :key="idx"
            class="cal-day"
            :class="{ empty: day.empty, today: day.isToday, 'has-photo': day.hasPhoto, 'has-note': day.note }"
            :style="day.note ? { '--note-color': day.note.color } : {}"
            @click="openDayEdit(day)"
          >
            <template v-if="!day.empty">
              <span class="cal-num">{{ day.day }}</span>
              <span v-if="day.note" class="cal-note-text">{{ day.note.text.length > 4 ? day.note.text.slice(0,4)+'…' : day.note.text }}</span>
              <span v-else-if="day.emoji" class="cal-emoji">{{ day.emoji }}</span>
              <span v-else-if="day.hasPhoto" class="cal-dot"></span>
            </template>
          </div>
        </div>
        <div class="note-legend">
          <span class="note-legend-item"><span class="nl-dot" style="background:#EC407A"></span> 母亲节</span>
          <span class="note-legend-item"><span class="nl-dot" style="background:#42A5F5"></span> 父亲节</span>
          <span class="note-legend-item"><span class="nl-dot" style="background:#FF6B6B"></span> 节日</span>
          <span class="note-legend-item"><span class="nl-dot" style="background:#FFB347"></span> 生日</span>
        </div>
      </div>

      <div class="card">
        <div class="section-title"><span>🖼️</span> 最近穿搭</div>
        <div class="recent-outfits">
          <div v-for="(item, idx) in store.outfitDiary" :key="idx" class="outfit-thumb">
            <div class="outfit-thumb-bg"><span class="outfit-thumb-emoji">🧒</span></div>
            <span class="outfit-thumb-date">{{ item.date }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑备注弹窗 -->
    <Teleport to="body">
      <div class="note-overlay" v-if="editingDay" @click.self="saveNote">
        <div class="note-dialog">
          <div class="note-d-title">📝 {{ editingDay.date }} 添加备注</div>
          <input v-model="editNoteText" class="note-input" placeholder="如：🎂 奶奶生日、🎈 儿童节..." maxlength="20" @keyup.enter="saveNote" autofocus />
          <div class="note-d-actions">
            <button class="note-btn cancel" @click="editingDay = null">取消</button>
            <button class="note-btn save" @click="saveNote">保存</button>
          </div>
        </div>
      </div>
    </Teleport>

    <div class="bottom-spacer"></div>
  </div>
</template>

<style scoped>
.happy-record { padding-bottom: 16px; }
.tab-bar { display: flex; padding: 12px 16px; position: sticky; top: 0; background: var(--bg); z-index: 10; }
.tab-btn { flex: 1; padding: 10px 0; font-size: 16px; font-weight: 600; border: none; background: transparent; color: var(--text-muted); cursor: pointer; border-bottom: 3px solid transparent; transition: all 0.2s; }
.tab-btn.active { color: var(--primary); border-bottom-color: var(--primary); }
.tab-content { padding: 0 0 8px; }
.capture-btn { width: 100%; height: 80px; background: linear-gradient(135deg, var(--primary-bg), #FFE0CC); border: 2px dashed var(--primary-light); border-radius: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; cursor: pointer; }
.capture-icon { font-size: 28px; }
.capture-text { font-size: 14px; color: var(--primary); font-weight: 600; }
.capture-hint { text-align: center; font-size: 12px; color: var(--text-muted); margin-top: 8px; }
.add-food-form { margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: 10px; }
.form-section { display: flex; flex-direction: column; gap: 4px; }
.form-label { font-size: 13px; font-weight: 600; color: var(--text-light); }
.emoji-grid { display: flex; flex-wrap: wrap; gap: 6px; }
.emoji-option { width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; font-size: 22px; background: var(--bg); border-radius: 10px; cursor: pointer; border: 2px solid transparent; }
.emoji-option.picked { border-color: var(--primary); background: var(--primary-bg); transform: scale(1.1); }
.food-input { width: 100%; border: 2px solid var(--border); border-radius: 10px; padding: 10px 14px; font-size: 15px; color: var(--text); outline: none; font-family: inherit; }
.food-input:focus { border-color: var(--primary); }
.meal-options { display: flex; gap: 8px; }
.meal-tag { padding: 6px 16px; background: var(--bg); border-radius: 16px; font-size: 13px; font-weight: 500; color: var(--text-light); cursor: pointer; border: 1.5px solid transparent; }
.meal-tag.picked { border-color: var(--primary); color: var(--primary); background: var(--primary-bg); font-weight: 700; }
.submit-food-btn { width: 100%; background: var(--primary); color: #fff; border: none; border-radius: 12px; padding: 11px; font-size: 15px; font-weight: 600; cursor: pointer; }
.submit-food-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.today-foods { margin-top: 14px; display: flex; flex-direction: column; gap: 8px; }
.food-item { display: flex; align-items: center; gap: 10px; padding: 12px 14px; background: var(--bg); border-radius: 12px; }
.food-emoji { font-size: 32px; flex-shrink: 0; }
.food-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.food-name { font-size: 15px; font-weight: 600; color: var(--text); }
.food-meal { font-size: 12px; color: var(--text-muted); }
.food-rating { display: flex; gap: 4px; }
.rating-star { font-size: 20px; cursor: pointer; }

/* 日期分组 */
.date-group { margin-bottom: 14px; }
.date-header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; padding: 4px 0; }
.date-text { font-size: 15px; font-weight: 700; color: var(--primary); }
.date-count { font-size: 11px; color: var(--text-muted); background: var(--bg); padding: 2px 8px; border-radius: 8px; }
.food-row { display: flex; align-items: center; gap: 6px; padding: 7px 4px; font-size: 13px; border-bottom: 1px solid #f9f5f0; }
.food-emoji-sm { font-size: 18px; }
.food-name-sm { font-weight: 500; color: var(--text); flex: 1; }
.food-meal-sm { color: var(--text-muted); font-size: 11px; }
.food-by { font-size: 11px; color: var(--primary); font-weight: 500; }
.food-rating-sm { font-size: 12px; font-weight: 600; }

/* 排行榜切换 */
.ranking-tabs { display: flex; gap: 8px; }
.rank-tab { flex: 1; padding: 8px; border-radius: 10px; border: 1.5px solid var(--border); background: #fff; font-size: 14px; font-weight: 600; color: var(--text-muted); cursor: pointer; }
.rank-tab.active { border-color: var(--primary); color: var(--primary); background: var(--primary-bg); }
.ranking-card { background: linear-gradient(180deg, #FFF8E1, #fff); }
.rank-item { display: flex; align-items: center; gap: 10px; padding: 12px 8px; }
.rank-num { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: #fff; flex-shrink: 0; }
.rank-1 { background: linear-gradient(135deg, #FFD700, #FFA000); font-size: 16px; }
.rank-2 { background: linear-gradient(135deg, #C0C0C0, #9E9E9E); }
.rank-3 { background: linear-gradient(135deg, #CD7F32, #A0522D); }
.rank-num:not(.rank-1):not(.rank-2):not(.rank-3) { background: var(--border); color: var(--text-muted); }
.rank-emoji { font-size: 28px; flex-shrink: 0; }
.rank-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.rank-name { font-size: 15px; font-weight: 600; color: var(--text); }
.rank-tag { font-size: 11px; color: var(--primary); background: var(--primary-bg); padding: 1px 8px; border-radius: 6px; align-self: flex-start; }
.rank-score { display: flex; align-items: center; gap: 4px; }
.rank-thumbs { font-size: 13px; }
.rank-count { font-size: 13px; color: var(--text-muted); font-weight: 600; }

/* 穿搭月历 */
.month-label { text-align: center; font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 10px; }
.weekday-row { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; margin-bottom: 4px; }
.weekday-cell { text-align: center; font-size: 12px; font-weight: 600; color: var(--text-muted); padding: 6px 0; }
.calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; }
.cal-day { aspect-ratio: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 8px; font-size: 11px; color: var(--text); gap: 1px; cursor: pointer; position: relative; border: 1.5px solid transparent; }
.cal-day.empty { pointer-events: none; }
.cal-day.today { background: var(--primary-bg); font-weight: 800; color: var(--primary); border-color: var(--primary); }
.cal-day.has-photo:active { background: #f0e0d0; }
.cal-day.has-note { background: color-mix(in srgb, var(--note-color, #FFB347) 15%, transparent); border-color: var(--note-color, #FFB347); border-width: 2px; }
.cal-num { font-size: 12px; font-weight: 500; }
.today .cal-num { font-weight: 800; }
.cal-note-text { font-size: 8px; color: var(--note-color, #FFB347); font-weight: 700; text-align: center; line-height: 1.1; max-width: 100%; overflow: hidden; }
.cal-emoji { font-size: 13px; }
.cal-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--primary-light); }

.note-legend { display: flex; gap: 10px; margin-top: 10px; justify-content: center; flex-wrap: wrap; }
.note-legend-item { font-size: 11px; color: var(--text-muted); display: flex; align-items: center; gap: 3px; }
.nl-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }

/* 备注弹窗 */
.note-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; }
.note-dialog { width: 280px; background: #fff; border-radius: 16px; padding: 24px 20px; text-align: center; }
.note-d-title { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 12px; }
.note-input { width: 100%; border: 2px solid var(--border); border-radius: 10px; padding: 10px 14px; font-size: 15px; outline: none; font-family: inherit; }
.note-input:focus { border-color: var(--primary); }
.note-d-actions { display: flex; gap: 10px; margin-top: 14px; }
.note-btn { flex: 1; padding: 10px; border-radius: 10px; border: none; font-size: 14px; font-weight: 600; cursor: pointer; }
.note-btn.cancel { background: var(--bg); color: var(--text-muted); }
.note-btn.save { background: var(--primary); color: #fff; }
.note-btn:active { transform: scale(0.95); }

.recent-outfits { display: flex; gap: 12px; margin-top: 4px; overflow-x: auto; }
.outfit-thumb { display: flex; flex-direction: column; align-items: center; gap: 4px; flex-shrink: 0; }
.outfit-thumb-bg { width: 64px; height: 64px; background: var(--bg); border-radius: 12px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border); }
.outfit-thumb-emoji { font-size: 24px; opacity: 0.5; }
.outfit-thumb-date { font-size: 11px; color: var(--text-muted); }
.empty-hint { text-align: center; padding: 20px 0; font-size: 14px; color: var(--text-muted); }
.bottom-spacer { height: 16px; }

/* 左滑删除 */
.food-swipe-wrapper { position: relative; overflow: hidden; border-radius: 12px; }
.food-swipe-wrapper .food-item { transition: transform 0.2s; }
.food-swipe-wrapper .food-item.swiped { transform: translateX(-80px); }
.swipe-actions { position: absolute; right: 0; top: 0; bottom: 0; display: flex; align-items: center; gap: 6px; padding-right: 8px; z-index: 1; }
.swipe-btn { width: 34px; height: 34px; border-radius: 50%; border: none; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.swipe-btn.delete { background: #FFE0E0; }
.swipe-btn.cancel { background: #E8F5E9; }
</style>
