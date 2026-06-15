<script setup>
import { ref, onUnmounted } from 'vue'

defineProps({
  items: { type: Array, required: true },
  advice: { type: String, default: '' },
})

const scrollRef = ref(null)
const scrollIndex = ref(0)
let isDown = false, startX = 0, scrollLeft = 0

function onScroll() {
  const el = scrollRef.value
  if (!el) return
  const width = el.children[0]?.offsetWidth || 120
  scrollIndex.value = Math.round(el.scrollLeft / (width + 12))
}

// 鼠标拖拽滑动
function onMouseDown(e) {
  isDown = true
  const el = scrollRef.value
  el.style.cursor = 'grabbing'
  startX = e.pageX - el.offsetLeft
  scrollLeft = el.scrollLeft
}
function onMouseLeave() { isDown = false; if (scrollRef.value) scrollRef.value.style.cursor = 'grab' }
function onMouseUp() { isDown = false; if (scrollRef.value) scrollRef.value.style.cursor = 'grab' }
function onMouseMove(e) {
  if (!isDown) return
  e.preventDefault()
  const el = scrollRef.value
  const x = e.pageX - el.offsetLeft
  const walk = (x - startX) * 1.5
  el.scrollLeft = scrollLeft - walk
}
onUnmounted(() => { isDown = false })
</script>

<template>
  <div class="outfit-recommend card">
    <div class="section-title"><span>👕</span> 今日穿搭推荐</div>
    <p class="outfit-advice" v-if="advice">{{ advice }}</p>
    <div class="scroll-wrapper">
      <div class="h-scroll" ref="scrollRef" @scroll="onScroll"
        @mousedown="onMouseDown" @mousemove="onMouseMove"
        @mouseleave="onMouseLeave" @mouseup="onMouseUp">
        <div v-for="item in items" :key="item.id" class="outfit-card">
          <div class="outfit-icon">{{ item.icon }}</div>
          <div class="outfit-info">
            <div class="outfit-top">{{ item.top }}</div>
            <div class="outfit-plus">+</div>
            <div class="outfit-bottom">{{ item.bottom }}</div>
          </div>
          <div class="outfit-tip">{{ item.tip }}</div>
        </div>
        <div class="outfit-card outfit-free">
          <div class="outfit-icon">🎨</div>
          <div class="outfit-info"><div class="outfit-free-text">自由</div><div class="outfit-free-text">搭配</div></div>
        </div>
      </div>
    </div>
    <div class="scroll-dots">
      <span v-for="(item, i) in [...items, { id: 'free' }]" :key="i" class="dot" :class="{ active: scrollIndex === i }"></span>
    </div>
    <p class="scroll-hint">← 左右滑动查看更多 →</p>
  </div>
</template>

<style scoped>
.outfit-advice { font-size: 13px; color: var(--primary); font-weight: 600; margin-bottom: 10px; padding: 6px 12px; background: var(--primary-bg); border-radius: 8px; display: inline-block; }
.scroll-wrapper { position: relative; }
.h-scroll { display: flex; gap: 12px; overflow-x: auto; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; padding: 4px 4px 8px; scroll-behavior: smooth; cursor: grab; }
.h-scroll::-webkit-scrollbar { height: 0; }
.outfit-card { width: 110px; min-width: 110px; min-height: 140px; background: linear-gradient(145deg, #FFF3E0, #FFE0B2); border-radius: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 14px 8px 10px; gap: 6px; border: 2px solid transparent; scroll-snap-align: start; transition: all 0.25s; cursor: pointer; position: relative; user-select: none; }
.outfit-card:active { border-color: var(--primary); transform: scale(0.96); }
.outfit-icon { font-size: 34px; transition: transform 0.2s; pointer-events: none; }
.outfit-card:active .outfit-icon { transform: scale(1.15); }
.outfit-info { display: flex; flex-direction: column; align-items: center; font-size: 14px; font-weight: 700; color: var(--text); gap: 1px; pointer-events: none; }
.outfit-plus { font-size: 10px; color: var(--primary); font-weight: 700; }
.outfit-tip { font-size: 10px; color: var(--text-light); background: rgba(255,255,255,0.7); padding: 2px 8px; border-radius: 10px; margin-top: 2px; pointer-events: none; }
.outfit-free { background: linear-gradient(145deg, #E8F5E9, #C8E6C9); min-height: 140px; }
.outfit-free-text { font-size: 14px; font-weight: 700; color: #388E3C; }
.scroll-dots { display: flex; justify-content: center; gap: 6px; margin-top: 10px; }
.dot { width: 6px; height: 6px; border-radius: 50%; background: var(--border); transition: all 0.3s; }
.dot.active { background: var(--primary); width: 20px; border-radius: 3px; }
.scroll-hint { text-align: center; font-size: 11px; color: var(--text-muted); margin-top: 6px; }
</style>
