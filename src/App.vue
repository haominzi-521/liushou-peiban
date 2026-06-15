<script setup>
import { watch, computed } from 'vue'
import { useAppStore } from './stores'
import BottomNav from './components/BottomNav.vue'

const store = useAppStore()

// 主题色全局同步
watch(() => store.themeColor, c => {
  document.documentElement.style.setProperty('--primary', c)
  document.documentElement.style.setProperty('--primary-bg', c + '22')
  document.documentElement.style.setProperty('--primary-light', c + '99')
  document.documentElement.style.setProperty('--bg', c + '15')
  document.documentElement.style.setProperty('--card-bg', '#FFFFFF')
}, { immediate: true })

// 字体大小 - 通过 zoom 缩放整个应用
watch(() => store.fontSize, s => {
  const el = document.getElementById('app')
  if (!el) return
  if (s === 'large') el.style.zoom = '1.15'
  else if (s === 'small') el.style.zoom = '0.88'
  else el.style.zoom = '1'
}, { immediate: true })

// 主题图案背景（放最底层）
const patternStyle = computed(() => {
  const p = store.themePattern
  if (p === 'none') return {}
  const emoji = { bunny: '🐰', dolphin: '🐬', star: '⭐', flower: '🌸', cat: '🐱', dog: '🐶', bear: '🐻' }[p] || '⭐'
  return {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Ctext x='30' y='38' text-anchor='middle' font-size='28' opacity='0.5'%3E${encodeURIComponent(emoji)}%3C/text%3E%3C/svg%3E")`,
    backgroundSize: '60px 60px',
    backgroundRepeat: 'repeat',
  }
})
</script>

<template>
  <div class="app-shell">
    <!-- 图案背景：最底层，不阻挡操作 -->
    <div class="pattern-bg" v-if="store.themePattern !== 'none'" :style="patternStyle"></div>
    <router-view />
    <BottomNav v-if="!store.hideBottomNav" />
  </div>
</template>

<style>
.app-shell { min-height: 100dvh; position: relative; }

/* 图案放到最底层：低 z-index + 禁止交互 */
.pattern-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: -1;
  opacity: 0.80;
}
</style>
