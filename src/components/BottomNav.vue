<script setup>
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const router = useRouter()

const tabs = [
  { name: 'home', label: '首页', icon: '🏠', path: '/' },
  { name: 'chat', label: '亲子交流', icon: '💬', path: '/chat' },
  { name: 'record', label: '快乐记录', icon: '📸', path: '/record' },
  { name: 'profile', label: '我的', icon: '👤', path: '/profile' },
]

const activeTab = computed(() => route.name)

function switchTab(tab) {
  router.push(tab.path)
}
</script>

<template>
  <nav class="bottom-nav">
    <div
      v-for="tab in tabs"
      :key="tab.name"
      class="nav-item"
      :class="{ active: activeTab === tab.name }"
      @click="switchTab(tab)"
    >
      <span class="nav-icon">{{ tab.icon }}</span>
      <span class="nav-label">{{ tab.label }}</span>
    </div>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 430px;
  height: 64px;
  background: #fff;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 8px;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 100;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.nav-item:active { transform: scale(0.92); }

.nav-icon {
  font-size: 22px;
  transition: transform 0.2s;
}

.nav-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-muted);
  transition: color 0.2s;
}

.nav-item.active .nav-label {
  color: var(--primary);
  font-weight: 700;
}

.nav-item.active .nav-icon {
  transform: translateY(-2px);
}

.nav-item.active {
  background: var(--primary-bg);
}
</style>
