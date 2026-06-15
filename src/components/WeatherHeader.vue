<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '../stores'

const store = useAppStore()

defineProps({
  weather: { type: Object, required: true },
})

const showCityPicker = ref(false)
const searchKeyword = ref('')
const allCities = store.getCityList()

// 搜索过滤后的城市
const filteredCities = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase()
  if (!kw) return allCities
  return allCities.filter(c =>
    c.name.toLowerCase().includes(kw) ||
    c.province.toLowerCase().includes(kw)
  )
})

// 按省份分组
const groupedCities = computed(() => {
  const groups = {}
  filteredCities.value.forEach(city => {
    const prov = city.province
    if (!groups[prov]) groups[prov] = []
    groups[prov].push(city)
  })
  return groups
})

function selectCity(city) {
  store.changeCity(city.name)
  showCityPicker.value = false
  searchKeyword.value = ''
}

function openPicker() {
  searchKeyword.value = ''
  showCityPicker.value = true
}

// 根据天气和时间生成问候语
const greetingText = computed(() => {
  const hour = new Date().getHours()
  const { condition } = store.weather
  let timeGreeting = '早上好'
  if (hour >= 12 && hour < 18) timeGreeting = '下午好'
  else if (hour >= 18 || hour < 5) timeGreeting = '晚上好'

  const weatherEmoji = condition.includes('雨') ? '🌧️'
    : condition.includes('雪') ? '❄️'
    : condition.includes('云') || condition.includes('阴') ? '☁️'
    : '☀️'
  return `${timeGreeting} ${weatherEmoji}`
})

// 天气背景 - 晴天暖色、阴雨冷色、雪天冰白、四季分明
const bgStyle = computed(() => {
  const { temp, condition } = store.weather
  const hour = new Date().getHours()
  const month = new Date().getMonth() + 1 // 1-12
  const isNight = hour < 6 || hour >= 19

  // ---- 夜晚统一暗色 ----
  if (isNight) {
    if (condition.includes('雨')) return 'linear-gradient(170deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
    if (condition.includes('雪')) return 'linear-gradient(170deg, #1a1a2e 0%, #1e2a3a 50%, #2c3e50 100%)'
    if (condition.includes('阴') || condition.includes('云')) return 'linear-gradient(170deg, #1a1a2e 0%, #1e2a42 50%, #162447 100%)'
    // 晴天夜晚: 深蓝星空
    if (temp > 25) return 'linear-gradient(170deg, #0d1b2a 0%, #1b2838 40%, #1a1a3e 100%)'
    return 'linear-gradient(170deg, #0a0a1a 0%, #141e30 40%, #1a1a3e 100%)'
  }

  // ========== 雪天：纯白冰蓝冬日感 ==========
  if (condition.includes('雪')) {
    if (temp < -10) return 'linear-gradient(170deg, #B0BEC5 0%, #CFD8DC 30%, #E0E0E0 70%, #F5F5F5 100%)'
    return 'linear-gradient(170deg, #B0C4DE 0%, #CFD8DC 30%, #E8EAF0 70%, #F8FAFE 100%)'
  }

  // ========== 雨天：沉静灰蓝冷色 ==========
  if (condition.includes('雷')) {
    return 'linear-gradient(160deg, #455A64 0%, #546E7A 30%, #607D8B 70%, #90A4AE 100%)'
  }
  if (condition.includes('大雨') || condition.includes('暴雨')) {
    return 'linear-gradient(160deg, #4E6E7A 0%, #5C7A8A 30%, #78909C 70%, #90A4AE 100%)'
  }
  if (condition.includes('雨')) {
    return 'linear-gradient(160deg, #607D8B 0%, #78909C 30%, #90A4AE 70%, #B0BEC5 100%)'
  }

  // ========== 阴天：清冷灰调 ==========
  if (condition.includes('阴')) {
    if (temp > 25) return 'linear-gradient(160deg, #8D9BA8 0%, #A0ADB8 40%, #B8C4CE 100%)'
    return 'linear-gradient(160deg, #7A8B99 0%, #8D9BA8 40%, #A0ADB8 100%)'
  }

  // ========== 多云：冷暖交织 ==========
  if (condition.includes('云')) {
    if (temp > 25) return 'linear-gradient(170deg, #90A4AE 0%, #B0BEC5 30%, #FFE0B2 90%)'
    return 'linear-gradient(170deg, #8899A6 0%, #9EAEBB 40%, #CFD8DC 100%)'
  }

  // ========== 晴天（核心）：始终暖色，按季节+温度变化 ==========
  const isSpring = month >= 3 && month <= 5   // 春
  const isSummer = month >= 6 && month <= 8   // 夏
  const isAutumn = month >= 9 && month <= 11  // 秋
  const isWinter = month >= 12 || month <= 2  // 冬

  // 盛夏酷暑 ≥35°
  if (temp >= 35) {
    return 'linear-gradient(170deg, #FF6F00 0%, #FF8F00 25%, #FFAB40 60%, #FFCC80 100%)'
  }
  // 炎热 30-34°
  if (temp >= 30) {
    return isSummer
      ? 'linear-gradient(170deg, #FF8C42 0%, #FFA040 30%, #FFC170 65%, #FFE0B2 100%)'
      : 'linear-gradient(170deg, #FF9800 0%, #FFB74D 30%, #FFD180 65%, #FFEED6 100%)'
  }
  // 温暖 25-29°
  if (temp >= 25) {
    if (isSpring) return 'linear-gradient(170deg, #FFB74D 0%, #FFCC80 30%, #FFE0B2 65%, #FFF8E1 100%)'
    if (isAutumn) return 'linear-gradient(170deg, #FFA726 0%, #FFCC80 30%, #FFE0B2 65%, #FFF3E0 100%)'
    if (isWinter) return 'linear-gradient(170deg, #FFD180 0%, #FFE4B5 30%, #FFECCB 65%, #FFF8EC 100%)'
    return 'linear-gradient(170deg, #FFB74D 0%, #FFD180 30%, #FFE8C0 65%, #FFF5E8 100%)'
  }
  // 舒适 20-24°
  if (temp >= 20) {
    if (isSpring) return 'linear-gradient(170deg, #FFCC80 0%, #FDD9A8 30%, #FFE8C8 65%, #FFF8EC 100%)'
    if (isAutumn) return 'linear-gradient(170deg, #E8A84C 0%, #F5C882 30%, #FFDFB0 65%, #FFF3E0 100%)'
    if (isWinter) return 'linear-gradient(170deg, #FFDAB9 0%, #FFE8D0 30%, #FFF0E0 65%, #FFF8F2 100%)'
    return 'linear-gradient(170deg, #FFCC80 0%, #FFDDA8 30%, #FFECD0 65%, #FFF8EC 100%)'
  }
  // 微凉 15-19°
  if (temp >= 15) {
    if (isWinter) return 'linear-gradient(170deg, #E8D0B0 0%, #F0DCC0 30%, #F8E8D8 65%, #FFF4EC 100%)'
    if (isAutumn) return 'linear-gradient(170deg, #DDA060 0%, #E8C080 30%, #F5D8B0 65%, #FFF0DC 100%)'
    return 'linear-gradient(170deg, #E8C880 0%, #F0D8A8 30%, #F8E8C8 65%, #FFF8EC 100%)'
  }
  // 偏冷 10-14°
  if (temp >= 10) {
    return isWinter
      ? 'linear-gradient(170deg, #D8C8B0 0%, #E5D8C4 30%, #F0E8D8 65%, #FAF4EC 100%)'
      : 'linear-gradient(170deg, #E0C890 0%, #ECD8A8 30%, #F5E8C8 65%, #FDF8EC 100%)'
  }
  // 寒冷 0-9°
  if (temp >= 0) {
    return isWinter
      ? 'linear-gradient(170deg, #C8C0B8 0%, #D8D0C8 30%, #E8E0D8 65%, #F5F0EC 100%)'
      : 'linear-gradient(170deg, #D8C098 0%, #E8D8B8 30%, #F0E8D0 65%, #F8F4E8 100%)'
  }
  // 极寒 <0°
  return 'linear-gradient(170deg, #B8B0A8 0%, #C8C0B8 30%, #D8D0C8 65%, #E8E4DC 100%)'
})
</script>

<template>
  <div class="weather-header card" :style="{ background: bgStyle }">
    <div class="weather-top">
      <div class="weather-location" @click="openPicker">
        <span class="location-icon">📍</span>
        <span class="city-name">{{ weather.city }}</span>
        <span class="switch-arrow">▾</span>
      </div>
      <div class="weather-badge">
        <span class="greeting">{{ greetingText }}</span>
      </div>
    </div>
    <div class="weather-main">
      <div class="weather-temp">
        <span class="temp-value">{{ weather.temp }}°</span>
      </div>
      <div class="weather-condition">
        <span class="condition-icon">{{ weather.icon }}</span>
        <span class="condition-text">{{ weather.condition }}</span>
      </div>
    </div>
    <div class="weather-extra">
      <span>💧 湿度 {{ weather.humidity }}%</span>
      <span>🌬️ 风力 {{ weather.wind }}</span>
      <span>👀 能见度 {{ weather.visibility }}</span>
    </div>

    <!-- 城市选择弹窗 -->
    <Teleport to="body">
      <div class="picker-overlay" v-if="showCityPicker" @click.self="showCityPicker = false">
        <div class="picker-sheet">
          <div class="picker-header">
            <span class="picker-title">选择城市</span>
            <span class="picker-close" @click="showCityPicker = false">✕</span>
          </div>
          <!-- 搜索框 -->
          <div class="picker-search">
            <span class="search-icon">🔍</span>
            <input
              v-model="searchKeyword"
              type="text"
              class="search-input"
              placeholder="搜索城市名称或省份..."
              autofocus
            />
            <span v-if="searchKeyword" class="search-clear" @click="searchKeyword = ''">✕</span>
          </div>
          <!-- 当前定位城市快捷入口 -->
          <div v-if="!searchKeyword" class="current-city-bar">
            <span class="current-label">📍 当前定位</span>
            <span class="current-city">上海</span>
          </div>
          <!-- 城市列表 -->
          <div class="picker-list">
            <template v-if="filteredCities.length === 0">
              <div class="no-result">😕 没有找到匹配的城市</div>
            </template>
            <template v-else>
              <div v-for="(cities, prov) in groupedCities" :key="prov" class="province-group">
                <div class="province-label">{{ prov }}</div>
                <div class="province-cities">
                  <span
                    v-for="city in cities"
                    :key="city.name"
                    class="city-tag"
                    :class="{ selected: city.name === weather.city }"
                    @click="selectCity(city)"
                  >
                    {{ city.name }}
                    <span class="city-tag-temp">{{ city.temp }}°</span>
                  </span>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.weather-header {
  border-radius: var(--radius);
  position: relative;
  overflow: hidden;
  color: #fff;
  transition: background 0.6s ease;
}

.weather-header::before {
  content: '';
  position: absolute;
  top: -40px;
  right: -30px;
  width: 120px;
  height: 120px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 50%;
}

.weather-header::after {
  content: '';
  position: absolute;
  bottom: -50px;
  left: -20px;
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 50%;
}

.weather-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  position: relative;
  z-index: 1;
}

.weather-location {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 5px 10px 5px 6px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(4px);
  transition: background 0.2s;
}

.weather-location:active {
  background: rgba(255, 255, 255, 0.32);
}

.location-icon { font-size: 14px; }

.city-name {
  font-size: 16px;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.switch-arrow { font-size: 12px; opacity: 0.8; }

.greeting {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 12px;
  backdrop-filter: blur(4px);
}

.weather-main {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 14px;
  position: relative;
  z-index: 1;
}

.temp-value {
  font-size: 48px;
  font-weight: 700;
  line-height: 1;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.weather-condition {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.condition-icon { font-size: 36px; }
.condition-text { font-size: 15px; font-weight: 600; opacity: 0.9; }

.weather-extra {
  display: flex;
  gap: 16px;
  font-size: 12px;
  opacity: 0.88;
  position: relative;
  z-index: 1;
}

/* ===== 城市选择器 ===== */
.picker-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.picker-sheet {
  width: 100%;
  max-width: 430px;
  max-height: 82vh;
  background: #fff;
  border-radius: 20px 20px 0 0;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.25s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  flex-shrink: 0;
}

.picker-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--text);
}

.picker-close {
  font-size: 18px;
  color: var(--text-muted);
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.picker-close:active { background: var(--bg); }

/* 搜索框 */
.picker-search {
  margin: 0 16px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg);
  border-radius: 12px;
  padding: 10px 14px;
  flex-shrink: 0;
  border: 1px solid transparent;
  transition: border-color 0.2s;
}

.picker-search:focus-within {
  border-color: var(--primary);
  background: #fff;
}

.search-icon { font-size: 15px; flex-shrink: 0; }

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 15px;
  color: var(--text);
  outline: none;
  font-family: inherit;
}

.search-input::placeholder {
  color: var(--text-muted);
  font-size: 14px;
}

.search-clear {
  font-size: 14px;
  color: var(--text-muted);
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 50%;
}

.search-clear:active { background: var(--border); }

/* 当前定位 */
.current-city-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  flex-shrink: 0;
}

.current-label { font-size: 12px; color: var(--text-muted); }

.current-city {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary);
  background: var(--primary-bg);
  padding: 4px 14px;
  border-radius: 16px;
}

/* 城市列表 */
.picker-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 24px;
}

.no-result {
  text-align: center;
  padding: 40px 0;
  font-size: 15px;
  color: var(--text-muted);
}

.province-group {
  margin-bottom: 16px;
}

.province-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-muted);
  margin-bottom: 8px;
  padding-left: 4px;
  letter-spacing: 1px;
}

.province-cities {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.city-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 14px;
  background: var(--bg);
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  cursor: pointer;
  transition: all 0.15s;
  border: 1.5px solid transparent;
}

.city-tag:active {
  transform: scale(0.96);
}

.city-tag.selected {
  background: var(--primary-bg);
  color: var(--primary);
  border-color: var(--primary);
  font-weight: 700;
}

.city-tag-temp {
  font-size: 11px;
  color: var(--text-light);
  font-weight: 400;
}

.city-tag.selected .city-tag-temp {
  color: var(--primary);
}
</style>
