<script setup>
defineProps({
  diary: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <div class="outfit-diary card">
    <div class="section-title">
      <span>📸</span> 穿搭日记
    </div>
    <div class="diary-content">
      <div class="diary-capture">
        <div class="capture-btn">
          <span class="capture-icon">📷</span>
          <span class="capture-text">拍照记录今日穿搭</span>
        </div>
      </div>
      <div class="diary-recent">
        <span class="recent-label">最近3天</span>
        <div class="recent-thumbs">
          <div
            v-for="(day, index) in diary"
            :key="index"
            class="thumb-item"
          >
            <div class="thumb-placeholder">
              <span class="thumb-emoji">🧒</span>
            </div>
            <span class="thumb-date">{{ day.date }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.diary-content {
  display: flex;
  gap: 16px;
}

.diary-capture {
  flex-shrink: 0;
}

.capture-btn {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, var(--primary-bg), #FFE0CC);
  border-radius: var(--radius-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border: 2px dashed var(--primary-light);
  cursor: pointer;
  transition: all 0.2s;
}

.capture-btn:active {
  transform: scale(0.95);
  border-style: solid;
}

.capture-icon {
  font-size: 28px;
}

.capture-text {
  font-size: 11px;
  color: var(--primary);
  font-weight: 600;
  text-align: center;
  line-height: 1.3;
}

.diary-recent {
  flex: 1;
  min-width: 0;
}

.recent-label {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 8px;
  display: block;
}

.recent-thumbs {
  display: flex;
  gap: 10px;
}

.thumb-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.thumb-placeholder {
  width: 60px;
  height: 60px;
  background: var(--bg);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
}

.thumb-emoji {
  font-size: 24px;
  opacity: 0.5;
}

.thumb-date {
  font-size: 11px;
  color: var(--text-muted);
}
</style>
