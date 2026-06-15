<script setup>
import { ref } from 'vue'
import MapModal from './MapModal.vue'

defineProps({
  safety: { type: Object, required: true },
  markers: { type: Array, default: () => [] },
  mapCenter: { type: Array, default: () => [31.2304, 121.4737] },
})

const showMap = ref(false)
</script>

<template>
  <div class="road-reminder card">
    <div class="section-title">
      <span>⚠️</span> 道路轻提醒
    </div>
    <div class="road-status">
      <div class="status-indicator" :class="{ alert: safety.hasAlerts }">
        <span class="status-dot"></span>
        <span class="status-text">{{ safety.location }}：{{ safety.status }}</span>
      </div>
      <button class="view-markers-btn" @click="showMap = true">
        📍 查看附近标记点
      </button>
    </div>
    <div class="road-tips">
      <div class="tip-item">🚶 过马路注意左右看</div>
      <div class="tip-item">🛑 远离大货车盲区</div>
    </div>

    <!-- 地图弹窗 -->
    <MapModal
      :show="showMap"
      :markers="markers"
      :center="mapCenter"
      @close="showMap = false"
    />
  </div>
</template>

<style scoped>
.road-reminder {
  border-left: 4px solid var(--accent);
}

.road-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent);
  animation: pulse 2s infinite;
}

.status-indicator.alert .status-dot {
  background: var(--danger);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.status-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.view-markers-btn {
  background: var(--accent-bg);
  color: #00796B;
  border: none;
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.view-markers-btn:active {
  transform: scale(0.95);
}

.road-tips {
  display: flex;
  gap: 12px;
}

.tip-item {
  font-size: 12px;
  color: var(--text-light);
  background: var(--bg);
  padding: 6px 12px;
  border-radius: 20px;
}
</style>
