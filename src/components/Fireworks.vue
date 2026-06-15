<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({ show: { type: Boolean, default: false } })
const canvas = ref(null)
let particles = []; let animId = null

function createFirework(x, y) {
  for (let i = 0; i < 40; i++) {
    const angle = (Math.PI * 2 * i) / 40
    const speed = 2 + Math.random() * 4
    particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      life: 60 + Math.random() * 40, color: ['#FF6B6B','#FFD93D','#6BCB77','#4D96FF','#FF922B','#E040FB'][Math.floor(Math.random()*6)] })
  }
}

function animate() {
  const ctx = canvas.value?.getContext('2d'); if (!ctx) return
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)
  particles = particles.filter(p => p.life > 0)
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.life--
    ctx.globalAlpha = p.life / 100; ctx.fillStyle = p.color
    ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill()
  })
  ctx.globalAlpha = 1
  if (particles.length) animId = requestAnimationFrame(animate)
}

function launch() {
  if (!canvas.value) return
  canvas.value.width = window.innerWidth; canvas.value.height = window.innerHeight
  createFirework(canvas.value.width * 0.3, canvas.value.height * 0.4)
  createFirework(canvas.value.width * 0.7, canvas.value.height * 0.3)
  createFirework(canvas.value.width * 0.5, canvas.value.height * 0.5)
  setTimeout(() => { createFirework(canvas.value.width * 0.4, canvas.value.height * 0.25)
    createFirework(canvas.value.width * 0.6, canvas.value.height * 0.45) }, 400)
  animId = requestAnimationFrame(animate)
}

watch(() => props.show, v => { if (v) launch() })
onUnmounted(() => { if (animId) cancelAnimationFrame(animId) })
</script>

<template>
  <canvas v-show="show" ref="canvas" class="fireworks-canvas"></canvas>
</template>

<style scoped>
.fireworks-canvas { position: fixed; inset: 0; z-index: 2000; pointer-events: none; }
</style>
