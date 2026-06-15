<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  show: { type: Boolean, default: false },
  markers: { type: Array, default: () => [] },
  center: { type: Array, default: () => [31.2304, 121.4737] }, // 默认上海
})

const emit = defineEmits(['close'])

let map = null
let markerLayer = null
const mapContainer = ref(null)

// 自定义图标
function createIcon(type) {
  const colors = {
    danger: '#EF476F',   // 危险
    warning: '#FFD166',  // 注意
    info: '#06D6A0',     // 安全提示
    school: '#4FC3F7',   // 学校
  }
  const icons = {
    danger: '🚫',
    warning: '⚠️',
    info: 'ℹ️',
    school: '🏫',
  }
  const color = colors[type] || colors.warning
  const emoji = icons[type] || icons.warning

  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      font-size: 28px;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
      transform: translate(-50%, -50%);
    ">${emoji}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  })
}

// 当前位置图标
const currentLocationIcon = L.divIcon({
  className: 'current-location',
  html: `<div style="
    width: 20px; height: 20px;
    background: #4285F4;
    border: 3px solid #fff;
    border-radius: 50%;
    box-shadow: 0 0 0 4px rgba(66,133,244,0.3), 0 2px 6px rgba(0,0,0,0.3);
    transform: translate(-50%, -50%);
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

function initMap() {
  if (!mapContainer.value || map) return

  map = L.map(mapContainer.value, {
    center: props.center,
    zoom: 15,
    zoomControl: false,
    attributionControl: false,
  })

  // 使用 OpenStreetMap 瓦片
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
  }).addTo(map)

  // 当前位置标记
  L.marker(props.center, { icon: currentLocationIcon })
    .addTo(map)
    .bindPopup('<b>📍 我的位置</b><br/>当前安全区域')

  // 添加标记图层
  markerLayer = L.layerGroup().addTo(map)

  // 缩放到合适级别
  setTimeout(() => {
    map.invalidateSize()
  }, 300)
}

function renderMarkers() {
  if (!markerLayer || !map) return
  markerLayer.clearLayers()

  props.markers.forEach(m => {
    const marker = L.marker([m.lat, m.lng], { icon: createIcon(m.type) })
    marker.bindPopup(`
      <div style="font-family: sans-serif; min-width: 140px;">
        <div style="font-size: 15px; font-weight: 700; margin-bottom: 4px;">
          ${m.icon} ${m.title}
        </div>
        <div style="font-size: 12px; color: #666; margin-bottom: 6px;">${m.desc}</div>
        <div style="font-size: 11px; color: #999;">距你 ${m.distance}</div>
      </div>
    `)
    marker.addTo(markerLayer)
  })
}

watch(() => props.show, async (val) => {
  if (val) {
    await nextTick()
    setTimeout(() => {
      initMap()
      renderMarkers()
    }, 100)
  }
})

watch(() => props.markers, () => {
  renderMarkers()
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
    markerLayer = null
  }
})
</script>

<template>
  <Teleport to="body">
    <div class="map-overlay" v-if="show" @click.self="emit('close')">
      <div class="map-sheet">
        <!-- 顶部栏 -->
        <div class="map-topbar">
          <button class="map-back" @click="emit('close')">
            <span>←</span> 返回
          </button>
          <span class="map-title">📍 附近安全标记点</span>
          <span class="map-count" v-if="markers.length">{{ markers.length }}个标记</span>
        </div>

        <!-- 地图 -->
        <div class="map-body" ref="mapContainer"></div>

        <!-- 底部图例 -->
        <div class="map-legend">
          <div class="legend-item">
            <span class="legend-dot current"></span> 我的位置
          </div>
          <div class="legend-item">
            <span>🚫</span> 危险点
          </div>
          <div class="legend-item">
            <span>⚠️</span> 注意点
          </div>
          <div class="legend-item">
            <span>🏫</span> 学校
          </div>
          <div class="legend-item">
            <span>ℹ️</span> 安全提示
          </div>
        </div>

        <!-- 标记列表 -->
        <div class="marker-list">
          <div
            v-for="(m, i) in markers"
            :key="i"
            class="marker-card"
            :class="m.type"
          >
            <span class="marker-icon">{{ m.icon }}</span>
            <div class="marker-info">
              <span class="marker-title">{{ m.title }}</span>
              <span class="marker-desc">{{ m.desc }}</span>
            </div>
            <span class="marker-distance">{{ m.distance }}</span>
          </div>
          <div v-if="markers.length === 0" class="no-markers">
            ✅ 附近暂无安全标记点
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style>
/* Leaflet 容器必须显式设置高度 */
.map-body {
  width: 100%;
  flex: 1;
  min-height: 0;
}
.map-body .leaflet-container {
  width: 100%;
  height: 100%;
}

/* 自定义标记样式覆盖 */
.custom-marker {
  background: none !important;
  border: none !important;
}
</style>

<style scoped>
.map-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.map-sheet {
  width: 100%;
  max-width: 430px;
  height: 88vh;
  background: #fff;
  border-radius: 20px 20px 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.25s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

/* 顶部栏 */
.map-topbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.map-back {
  background: var(--bg);
  border: none;
  border-radius: 10px;
  padding: 6px 14px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 2px;
}

.map-back:active { opacity: 0.7; }

.map-title {
  flex: 1;
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
}

.map-count {
  font-size: 12px;
  color: var(--primary);
  background: var(--primary-bg);
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 600;
}

/* 地图区 */
.map-body {
  flex: 1;
  min-height: 0;
  background: #E8E4D8;
}

/* 图例 */
.map-legend {
  display: flex;
  gap: 12px;
  padding: 10px 16px;
  overflow-x: auto;
  flex-shrink: 0;
  border-top: 1px solid var(--border);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--text-light);
  white-space: nowrap;
  flex-shrink: 0;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.legend-dot.current {
  background: #4285F4;
  box-shadow: 0 0 0 3px rgba(66,133,244,0.2);
}

/* 标记列表 */
.marker-list {
  max-height: 32vh;
  overflow-y: auto;
  padding: 8px 16px 20px;
  flex-shrink: 0;
}

.no-markers {
  text-align: center;
  padding: 20px;
  font-size: 15px;
  color: var(--text-muted);
}

.marker-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 12px;
  margin-bottom: 8px;
  background: var(--bg);
  border-left: 4px solid transparent;
  transition: all 0.15s;
}

.marker-card:active { transform: scale(0.98); }

.marker-card.danger {
  border-left-color: #EF476F;
  background: #FFF5F5;
}

.marker-card.warning {
  border-left-color: #FFD166;
  background: #FFFDF5;
}

.marker-card.info {
  border-left-color: #06D6A0;
  background: #F5FFFC;
}

.marker-card.school {
  border-left-color: #4FC3F7;
  background: #F5FAFF;
}

.marker-icon { font-size: 22px; flex-shrink: 0; }

.marker-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.marker-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.marker-desc {
  font-size: 12px;
  color: var(--text-light);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.marker-distance {
  font-size: 12px;
  color: var(--text-muted);
  flex-shrink: 0;
  font-weight: 500;
}
</style>
