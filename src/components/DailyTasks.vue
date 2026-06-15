<script setup>
import { ref } from 'vue'
import { useAppStore } from '../stores'
import Fireworks from './Fireworks.vue'

defineProps({ tasks: { type: Array, required: true }, points: { type: Number, required: true } })
const emit = defineEmits(['complete', 'undo', 'goTaskIsland'])
const store = useAppStore()

const confirmTask = ref(null)
const showFireworks = ref(false)
const celebrateMsg = ref('')

function askConfirm(task) {
  if (task.done) { emit('undo', task.id); return }
  confirmTask.value = task
}
function confirmYes() {
  emit('complete', confirmTask.value.id)
  celebrateMsg.value = `🎉 恭喜你完成「${confirmTask.value.title}」！+${confirmTask.value.points}分`
  showFireworks.value = true
  confirmTask.value = null
  setTimeout(() => { showFireworks.value = false
    if (store.allActiveTasks.length === 0) {
      setTimeout(() => {
        celebrateMsg.value = '🏆 恭喜你已完成所有任务！太厉害了！'
        showFireworks.value = true
        setTimeout(() => { showFireworks.value = false }, 3500)
      }, 500)
    }
  }, 2500)
}
function confirmNo() { confirmTask.value = null }
</script>

<template>
  <div class="daily-tasks card">
    <div class="task-header">
      <div class="section-title"><span>🎯</span> 今日任务</div>
      <div class="header-right">
        <span class="task-progress">{{ store.doneTaskCount }}/{{ store.totalTaskCount + store.doneTaskCount }}</span>
        <select class="priority-select" v-model="store.taskPriority" @change="(e) => store.setTaskPriority(e.target.value)">
          <option value="all">全部</option><option value="parent">优先父母</option><option value="self">优先自己</option>
        </select>
      </div>
    </div>
    <div class="tasks-list">
      <div v-for="task in store.sortedActiveTasks" :key="task.id" class="task-item" :class="{ done: task.done }" @click="askConfirm(task)">
        <div class="task-check"><span v-if="task.done">✅</span><span v-else>⬜</span></div>
        <span class="task-title">{{ task.title }}</span>
        <span class="task-source" :class="task.source">{{ task.source === 'parent' ? '父母' : '自己' }}</span>
        <span class="task-points">+{{ task.points }}分</span>
      </div>
      <div v-if="store.allActiveTasks.length === 0" class="empty-tasks">🎉 全部完成！</div>
    </div>
    <div class="tasks-footer"><button class="go-island-btn" @click="emit('goTaskIsland')">去任务岛 <span class="arrow">›</span></button></div>

    <!-- 确认弹窗 -->
    <Teleport to="body">
      <div class="confirm-overlay" v-if="confirmTask" @click.self="confirmNo">
        <div class="confirm-box">
          <div class="confirm-task-title">{{ confirmTask.title }}</div>
          <div class="confirm-reward">完成可获得 +{{ confirmTask.points }} 分</div>
          <div class="confirm-btns">
            <button class="confirm-btn no" @click="confirmNo">😅 我还没有</button>
            <button class="confirm-btn yes" @click="confirmYes">✅ 是的我已完成</button>
          </div>
        </div>
      </div>
      <!-- 庆祝文字 -->
      <div class="celebrate-toast" v-if="celebrateMsg && showFireworks">{{ celebrateMsg }}</div>
    </Teleport>
    <Fireworks :show="showFireworks" />
  </div>
</template>

<style scoped>
.task-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.header-right { display: flex; align-items: center; gap: 8px; }
.task-progress { font-size: 13px; font-weight: 700; color: var(--primary); background: var(--primary-bg); padding: 2px 10px; border-radius: 10px; white-space: nowrap; }
.priority-select { font-size: 11px; border: 1px solid var(--border); border-radius: 8px; padding: 3px 6px; outline: none; font-family: inherit; color: var(--text-light); background: #fff; }
.tasks-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; max-height: 240px; overflow-y: auto; padding-right: 2px; }
.tasks-list::-webkit-scrollbar { width: 3px; }
.tasks-list::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
.task-item { display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: var(--bg); border-radius: var(--radius-sm); cursor: pointer; transition: all 0.2s; flex-shrink: 0; }
.task-item:active { background: #F5E6D8; }
.task-check { font-size: 18px; flex-shrink: 0; }
.task-title { flex: 1; font-size: 14px; font-weight: 500; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.task-item.done .task-title { text-decoration: line-through; color: var(--text-muted); }
.task-source { font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 6px; flex-shrink: 0; }
.task-source.parent { background: #E3F2FD; color: #1976D2; }
.task-source.self { background: #FFF3E0; color: #F57C00; }
.task-points { font-size: 12px; font-weight: 700; color: var(--primary); background: var(--primary-bg); padding: 2px 8px; border-radius: 10px; flex-shrink: 0; }
.empty-tasks { text-align: center; color: var(--text-muted); padding: 20px; font-size: 14px; }
.tasks-footer { display: flex; justify-content: flex-end; }
.go-island-btn { background: var(--primary); color: #fff; border: none; border-radius: 20px; padding: 8px 20px; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px; }
.go-island-btn:active { transform: scale(0.96); opacity: 0.9; }
.arrow { font-size: 18px; }

/* 弹窗 */
.confirm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1500; display: flex; align-items: center; justify-content: center; }
.confirm-box { width: 300px; background: #fff; border-radius: 20px; padding: 28px 24px; text-align: center; animation: popIn 0.2s ease-out; }
@keyframes popIn { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.confirm-task-title { font-size: 20px; font-weight: 700; color: var(--text); margin-bottom: 6px; }
.confirm-reward { font-size: 14px; color: var(--primary); font-weight: 600; margin-bottom: 18px; }
.confirm-btns { display: flex; flex-direction: column; gap: 10px; }
.confirm-btn { padding: 14px; border-radius: 14px; border: none; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
.confirm-btn:active { transform: scale(0.96); }
.confirm-btn.yes { background: var(--primary); color: #fff; }
.confirm-btn.no { background: var(--bg); color: var(--text-muted); }

.celebrate-toast { position: fixed; top: 30%; left: 50%; transform: translateX(-50%); z-index: 2001; background: rgba(0,0,0,0.8); color: #FFD93D; font-size: 18px; font-weight: 700; padding: 16px 28px; border-radius: 16px; text-align: center; pointer-events: none; animation: bounceIn 0.5s; }
@keyframes bounceIn { 0% { transform: translateX(-50%) scale(0); } 60% { transform: translateX(-50%) scale(1.1); } 100% { transform: translateX(-50%) scale(1); } }
</style>
