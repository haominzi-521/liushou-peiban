<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '../stores'

const store = useAppStore()

// 新建任务弹窗
const showAddTask = ref(false)
const newTaskTitle = ref('')
const newTaskPoints = ref(10)
const editingPoints = ref(false)
const newTaskCategory = ref('自定义')

// 奖励兑换确认
const showRewardConfirm = ref(null)

// 积分等级星星
const starLevel = computed(() => {
  const p = store.points
  if (p >= 300) return '🌟🌟🌟'
  if (p >= 200) return '🌟🌟'
  if (p >= 100) return '🌟'
  return '⭐'
})

const starLabel = computed(() => {
  const p = store.points
  if (p >= 300) return '黄金'
  if (p >= 200) return '白银'
  if (p >= 100) return '青铜'
  return '新手'
})

const showPointsConfirm = ref(false)
const showContactPickerForTask = ref(false)

function handleAddTask() {
  if (!newTaskTitle.value.trim()) return
  if (newTaskPoints.value > 500) {
    showPointsConfirm.value = true
    return
  }
  doAddTask()
}

function doAddTask() {
  const ok = store.addTask(newTaskTitle.value.trim(), newTaskPoints.value, newTaskCategory.value, 'self')
  if (!ok) {
    alert(`自己最多布置 ${store.selfTaskLimit} 个任务哦～`)
    return
  }
  newTaskTitle.value = ''; newTaskPoints.value = 10; newTaskCategory.value = '自定义'
  showAddTask.value = false; showPointsConfirm.value = false
}

function confirmHighPoints() {
  showPointsConfirm.value = false
  showContactPickerForTask.value = true
}

function selectContactForApproval(contact) {
  showContactPickerForTask.value = false
  const taskTitle = newTaskTitle.value.trim()
  const taskPoints = newTaskPoints.value
  // 先添加为待审批任务
  const pendingTask = store.addPendingTask(taskTitle, taskPoints, newTaskCategory.value)
  // 发送审批申请
  store.sendTaskApplication(contact.id, contact.name, taskTitle, taskPoints, store.nickname, pendingTask.id)
  // 清理表单
  newTaskTitle.value = ''; newTaskPoints.value = 10; newTaskCategory.value = '自定义'
  showAddTask.value = false
}

function handleAddRecommended(recTask) {
  const ok = store.addRecommendedTask(recTask)
  if (!ok) {
    if (store.selfTaskCount >= store.selfTaskLimit) {
      alert(`自己最多布置 ${store.selfTaskLimit} 个任务哦～`)
    } else {
      alert('该任务已存在，不要重复添加哦～')
    }
  }
}

function handleRedeem(reward) {
  if (store.points < reward.cost) {
    alert(`积分不足！还需 ${reward.cost - store.points} 分`)
    return
  }
  if (reward.stock <= 0) {
    alert('该奖励已兑完～')
    return
  }
  showRewardConfirm.value = reward
}

function confirmRedeem() {
  if (showRewardConfirm.value) {
    store.redeemReward(showRewardConfirm.value.id)
    showRewardConfirm.value = null
  }
}

const categoryOptions = ['运动', '学习', '生活', '习惯', '孝心', '健康', '自定义']
const recTab = ref('全部')

// 历史任务弹窗
const showHistoryPopup = ref(false)
</script>

<template>
  <div class="task-island">
    <!-- 积分头部 -->
    <div class="points-header card">
      <div class="points-badge">
        <span class="points-stars">{{ starLevel }}</span>
        <span class="points-value">{{ store.points }}</span>
        <span class="points-unit">分</span>
      </div>
      <div class="points-bar">
        <div class="bar-fill" :style="{ width: Math.min(100, (store.points / 400) * 100) + '%' }"></div>
      </div>
      <div class="points-next">
        🎯 还需 {{ Math.max(0, (store.favoriteRewards.length ? store.rewards.find(r => store.favoriteRewards.includes(r.id))?.cost || 500 : 500) - store.points) }} 分可兑换赞过的物品
      </div>
    </div>

    <!-- 新建任务 -->
    <div class="card">
      <button class="new-task-btn" @click="showAddTask = !showAddTask">
        <span class="btn-icon">{{ showAddTask ? '✕' : '＋' }}</span>
        <span>{{ showAddTask ? '取消' : '新建任务' }}</span>
        <span class="self-limit">（自己 {{ store.selfTaskCount }}/{{ store.selfTaskLimit }}）</span>
      </button>

      <div class="add-task-form" v-if="showAddTask">
        <input
          v-model="newTaskTitle"
          type="text"
          class="task-input"
          placeholder="输入任务名称..."
          @keyup.enter="handleAddTask"
        />
        <div class="task-form-row">
          <div class="form-field">
            <label class="field-label">📝 积分奖励</label>
            <div class="points-stepper">
              <button class="step-btn" @click="newTaskPoints = Math.max(5, newTaskPoints - 5)">−</button>
              <input v-if="editingPoints" v-model.number="newTaskPoints" type="number" min="5" max="1000"
                class="step-input" @blur="editingPoints = false" @keyup.enter="editingPoints = false" autofocus />
              <span v-else class="step-value" @click="editingPoints = true">{{ newTaskPoints }}分</span>
              <button class="step-btn" @click="newTaskPoints = Math.min(1000, newTaskPoints + 5)">+</button>
            </div>
          </div>
          <div class="form-field">
            <label class="field-label">🏷️ 分类</label>
            <select v-model="newTaskCategory" class="category-select">
              <option v-for="c in categoryOptions" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
        </div>
        <button class="submit-task-btn" @click="handleAddTask" :disabled="!newTaskTitle.trim()">
          ✅ 添加任务
        </button>
      </div>
    </div>

    <!-- 进行中任务 -->
    <div class="card">
      <div class="section-title">
        <span>📋</span> 进行中
        <span class="task-count-badge">{{ store.allActiveTasks.length }}</span>
      </div>
      <div v-if="store.allActiveTasks.length === 0 && store.pendingTasks.length === 0" class="empty-hint">
        🎉 所有任务都完成啦！添加新任务吧～
      </div>

      <!-- 待审批任务 -->
      <div v-for="task in store.pendingTasks" :key="'p'+task.id" class="task-row pending-row">
        <div class="task-checkbox">⏳</div>
        <div class="task-info">
          <span class="task-name">{{ task.title }}</span>
          <span class="task-meta">
            <span class="task-cat">{{ task.category }}</span>
            <span class="task-source self">✋ 自己布置</span>
            <span class="pending-label">🕐 待审批</span>
          </span>
        </div>
        <span class="task-pts">+{{ task.points }}分</span>
      </div>

      <div
        v-for="task in store.allActiveTasks"
        :key="task.id"
        class="task-row"
        @click="store.completeTask(task.id)"
      >
        <div class="task-checkbox">
          <span v-if="false">✅</span>
          <span v-else>⬜</span>
        </div>
        <div class="task-info">
          <span class="task-name">{{ task.title }}</span>
          <span class="task-meta">
            <span class="task-cat">{{ task.category }}</span>
            <span class="task-source" :class="task.source">
              {{ task.source === 'parent' ? '👨‍👩‍👧 父母布置' : '✋ 自己布置' }}
            </span>
            <span class="task-deadline">截止今天</span>
          </span>
        </div>
        <div class="task-actions">
          <span class="task-pts">+{{ task.points }}分</span>
          <button
            v-if="task.id > 100"
            class="task-del"
            @click.stop="store.deleteTask(task.id)"
          >🗑️</button>
        </div>
      </div>
    </div>

    <!-- 推荐任务（标签横版筛选） -->
    <div class="card">
      <div class="section-title"><span>💡</span> 推荐任务</div>
      <div class="rec-tabs">
        <span v-for="cat in ['全部','运动','学习','生活','习惯','孝心','健康']" :key="cat"
          class="rec-tab" :class="{ active: recTab === cat }" @click="recTab = cat">{{ cat }}</span>
      </div>
      <div class="rec-scroll">
        <div v-for="rec in store.recommendedTasks.filter(t => recTab === '全部' || t.category === recTab)" :key="rec.id"
          class="rec-card" @click="handleAddRecommended(rec)">
          <span class="rec-icon">{{ rec.icon }}</span>
          <span class="rec-title">{{ rec.title }}</span>
          <span class="rec-pts">+{{ rec.points }}分</span>
        </div>
      </div>
    </div>

    <!-- 已完成任务 -->
    <div class="card" v-if="store.completedTasks.length > 0">
      <div class="section-title">
        <span>🎉</span> 已完成
        <span class="task-count-badge done">{{ store.completedTasks.length }}</span>
      </div>
      <div
        v-for="task in store.completedTasks"
        :key="task.id"
        class="task-row done-row"
      >
        <div class="task-checkbox checked">✅</div>
        <div class="task-info">
          <span class="task-name done-text">{{ task.title }}</span>
          <span class="task-meta">{{ task.category }}</span>
        </div>
        <div class="task-actions">
          <button class="undo-btn" @click="store.undoTask(task.id)">↩ 撤销</button>
        </div>
      </div>
    </div>

    <!-- ===== 历史任务 ===== -->
    <div class="card">
      <div class="section-title" style="cursor:pointer" @click="showHistoryPopup = true">
        <span>📜</span> 历史任务
      </div>
      <p class="history-hint">点击查看往期已完成的任务记录</p>
    </div>

    <!-- 历史任务弹窗 -->
    <div v-if="showHistoryPopup" class="history-overlay" @click.self="showHistoryPopup = false">
      <div class="history-dialog">
        <div class="hd-title">📜 往期任务记录</div>
        <div class="hd-list">
          <div v-for="h in store.taskHistory" :key="h.date" class="hd-date-group">
            <div class="hd-date-label">📅 {{ h.date }}</div>
            <div v-for="(t, i) in h.tasks" :key="i" class="hd-task-row">
              ✅ {{ t.title }}
              <span class="hd-pts">+{{ t.points }}分</span>
              <span class="hd-src" :class="t.source">{{ t.source === 'parent' ? '父母' : '自己' }}</span>
            </div>
          </div>
        </div>
        <button class="hd-close-btn" @click="showHistoryPopup = false">关闭</button>
      </div>
    </div>

    <!-- 积分兑换 -->
    <div class="card">
      <div class="section-title"><span>🎁</span> 积分兑换</div>
      <div class="reward-toolbar">
        <select class="reward-sort" v-model="store.rewardSort" @change="(e) => store.setRewardSort(e.target.value)">
          <option value="default">默认排序</option>
          <option value="cheap">由便宜到贵</option>
          <option value="expensive">由贵到便宜</option>
          <option value="favorites">❤️ 我喜欢</option>
        </select>
      </div>
      <div class="reward-grid">
        <div
          v-for="reward in store.sortedRewards"
          :key="reward.id"
          class="reward-card"
          :class="{ locked: store.points < reward.cost || reward.stock <= 0 }"
          @click="handleRedeem(reward)"
        >
          <span class="reward-icon">{{ reward.icon }}</span>
          <span class="reward-name">{{ reward.name }}</span>
          <span class="reward-cost">🪙 {{ reward.cost }}分</span>
          <span class="reward-stock" v-if="reward.stock <= 1">仅剩{{ reward.stock }}份</span>
          <span class="heart-icon" :class="{ liked: store.favoriteRewards.includes(reward.id) }"
            @click.stop="store.toggleFavoriteReward(reward.id)">
            {{ store.favoriteRewards.includes(reward.id) ? '❤️' : '🤍' }}
          </span>
        </div>
      </div>

      <!-- 兑换记录 -->
      <div class="redeem-history" v-if="store.redeemHistory.length > 0">
        <div class="history-title">📜 最近兑换</div>
        <div class="history-item" v-for="h in store.redeemHistory.slice(-5).reverse()" :key="h.id">
          <span>{{ h.icon }}</span>
          <span>{{ h.name }}</span>
          <span class="history-cost">-{{ h.cost }}分</span>
          <span class="history-time">{{ h.time }}</span>
        </div>
      </div>
    </div>

    <!-- 高分确认弹窗 -->
    <Teleport to="body">
      <div class="confirm-overlay" v-if="showPointsConfirm" @click.self="showPointsConfirm = false">
        <div class="confirm-dialog">
          <div class="confirm-icon">⚠️</div>
          <div class="confirm-title">是否设定这个数值？</div>
          <div class="confirm-name">由于超过500积分需要申请家长</div>
          <div class="confirm-cost">🪙 {{ newTaskPoints }} 分</div>
          <div class="confirm-actions">
            <button class="confirm-cancel" @click="showPointsConfirm = false">我再想想</button>
            <button class="confirm-ok" @click="confirmHighPoints">是的我确定</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 选择联系人审批 -->
    <Teleport to="body">
      <div class="picker-overlay" v-if="showContactPickerForTask" @click.self="showContactPickerForTask = false">
        <div class="picker-sheet">
          <div class="picker-header"><span class="picker-title">选择审批人</span><span class="picker-close" @click="showContactPickerForTask = false">✕</span></div>
          <div class="picker-list">
            <div v-for="c in store.chatContacts" :key="c.id" class="contact-option" @click="selectContactForApproval(c)">
              <span class="co-emoji">{{ c.emoji }}</span>
              <div class="co-info"><span class="co-name">{{ c.name }}</span><span class="co-relation">{{ c.relation }}</span></div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 兑换确认弹窗 -->
    <Teleport to="body">
      <div class="confirm-overlay" v-if="showRewardConfirm" @click.self="showRewardConfirm = null">
        <div class="confirm-dialog">
          <div class="confirm-icon">{{ showRewardConfirm.icon }}</div>
          <div class="confirm-title">确认兑换？</div>
          <div class="confirm-name">{{ showRewardConfirm.name }}</div>
          <div class="confirm-cost">消耗 🪙 {{ showRewardConfirm.cost }} 分</div>
          <div class="confirm-balance">
            兑换后剩余 {{ store.points - showRewardConfirm.cost }} 分
          </div>
          <div class="confirm-actions">
            <button class="confirm-cancel" @click="showRewardConfirm = null">再想想</button>
            <button class="confirm-ok" @click="confirmRedeem">确认兑换 ✅</button>
          </div>
        </div>
      </div>
    </Teleport>

    <div class="bottom-spacer"></div>
  </div>
</template>

<style scoped>
.task-island {
  padding-bottom: 16px;
}

/* ===== 积分头部 ===== */
.points-header {
  background: linear-gradient(135deg, #FFF3E0, #FFE0B2, #FFCC80);
  text-align: center;
}

.points-badge {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 6px;
  margin-bottom: 6px;
}

.points-stars { font-size: 22px; }

.points-value {
  font-size: 42px;
  font-weight: 800;
  color: var(--primary);
  line-height: 1;
}

.points-unit {
  font-size: 18px;
  font-weight: 600;
  color: var(--primary);
}

.points-rank {
  margin-bottom: 12px;
}

.rank-badge {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  background: var(--primary);
  padding: 3px 16px;
  border-radius: 12px;
}

.points-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--secondary), var(--accent));
  border-radius: 4px;
  transition: width 0.5s ease;
}

.points-next {
  font-size: 12px;
  color: var(--text-light);
}

/* ===== 新建任务按钮 ===== */
.new-task-btn {
  width: 100%;
  background: var(--bg);
  border: 2px dashed var(--primary-light);
  border-radius: 12px;
  padding: 12px;
  font-size: 15px;
  font-weight: 600;
  color: var(--primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
}

.new-task-btn:active { background: var(--primary-bg); }

.btn-icon { font-size: 18px; }

/* ===== 新建任务表单 ===== */
.add-task-form {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.task-input {
  width: 100%;
  border: 2px solid var(--border);
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 15px;
  color: var(--text);
  outline: none;
  font-family: inherit;
  transition: border-color 0.2s;
}

.task-input:focus { border-color: var(--primary); }

.task-form-row {
  display: flex;
  gap: 12px;
}

.form-field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-label {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
}

.points-stepper {
  display: flex;
  align-items: center;
  gap: 0;
  background: var(--bg);
  border-radius: 10px;
  overflow: hidden;
}

.step-btn {
  width: 36px;
  height: 34px;
  border: none;
  background: var(--border);
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  cursor: pointer;
}

.step-btn:active { opacity: 0.7; }

.step-value {
  flex: 1;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: var(--primary);
  cursor: pointer;
}
.step-input {
  flex: 1;
  text-align: center;
  font-size: 14px;
  font-weight: 700;
  color: var(--primary);
  border: 1px solid var(--primary);
  border-radius: 6px;
  padding: 2px 4px;
  outline: none;
  font-family: inherit;
  width: 60px;
}

.category-select {
  width: 100%;
  padding: 8px 10px;
  border: 2px solid var(--border);
  border-radius: 10px;
  font-size: 14px;
  color: var(--text);
  background: #fff;
  outline: none;
  font-family: inherit;
}

.submit-task-btn {
  width: 100%;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-task-btn:active { transform: scale(0.97); }
.submit-task-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* ===== 任务列表 ===== */
.task-count-badge {
  font-size: 12px;
  background: var(--primary-bg);
  color: var(--primary);
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 700;
}
.task-count-badge.done {
  background: #E8F5E9;
  color: #388E3C;
}

.empty-hint {
  text-align: center;
  padding: 20px 0;
  font-size: 14px;
  color: var(--text-muted);
}

.task-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;
  margin-top: 4px;
}

.task-row:active { background: var(--bg); }
.task-row:first-child { margin-top: 8px; }

.done-row { opacity: 0.7; }

.task-checkbox { font-size: 20px; flex-shrink: 0; }
.task-checkbox.checked { font-size: 18px; }

.task-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.task-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--text);
}

.done-text { text-decoration: line-through; color: var(--text-muted); }

.task-meta {
  display: flex;
  gap: 8px;
  font-size: 11px;
  color: var(--text-muted);
}

.task-cat {
  background: var(--bg);
  padding: 1px 8px;
  border-radius: 6px;
}

.task-source {
  padding: 1px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
}
.task-source.parent {
  background: #E3F2FD;
  color: #1976D2;
}
.task-source.self {
  background: #FFF3E0;
  color: #F57C00;
}

.self-limit {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 400;
}

.pending-row { opacity: 0.6; background: #FFFDE7; }
.pending-label { font-size: 10px; font-weight: 600; color: #F57C00; background: #FFF3E0; padding: 2px 6px; border-radius: 4px; }

.task-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.task-pts {
  font-size: 13px;
  font-weight: 700;
  color: var(--primary);
  background: var(--primary-bg);
  padding: 2px 8px;
  border-radius: 10px;
}

.task-del {
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  padding: 2px;
  opacity: 0.5;
}

.task-del:active { opacity: 1; }

.undo-btn {
  background: var(--bg);
  border: none;
  border-radius: 8px;
  padding: 4px 10px;
  font-size: 12px;
  color: var(--text-light);
  cursor: pointer;
  font-weight: 500;
}

.undo-btn:active { background: var(--border); }

/* ===== 推荐任务 ===== */
.rec-tabs { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 4px; }
.rec-tabs::-webkit-scrollbar { height: 0; }
.rec-tab { padding: 5px 14px; border-radius: 14px; font-size: 12px; font-weight: 600; white-space: nowrap; cursor: pointer; background: var(--bg); color: var(--text-light); border: 1px solid transparent; flex-shrink: 0; }
.rec-tab.active { background: var(--primary); color: #fff; }
.rec-tab:active { transform: scale(0.95); }
.rec-category { margin-bottom: 12px; }
.rec-cat-label { font-size: 12px; font-weight: 700; color: var(--primary); margin-bottom: 4px; padding-left: 2px; }
.rec-scroll { display: flex; gap: 8px; overflow-x: auto; padding: 4px 2px 8px; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; }
.rec-scroll::-webkit-scrollbar { height: 0; }
.rec-card { flex-shrink: 0; scroll-snap-align: start; width: 100px; }

.recommend-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 8px;
}

.rec-card {
  background: var(--bg);
  border-radius: 12px;
  padding: 14px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.15s;
  border: 1.5px solid transparent;
}

.rec-card:active {
  border-color: var(--primary);
  transform: scale(0.96);
}

.rec-icon { font-size: 28px; }

.rec-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

.rec-pts {
  font-size: 11px;
  color: var(--primary);
  font-weight: 600;
}

/* ===== 历史日历 ===== */
.cal-nav { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.cal-nav-btn { background: var(--bg); border: none; border-radius: 8px; padding: 4px 12px; cursor: pointer; font-size: 14px; color: var(--text); }
.cal-nav-title { font-size: 14px; font-weight: 700; color: var(--text); }
.weekday-row { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; margin-bottom: 2px; }
.weekday-cell { text-align: center; font-size: 11px; font-weight: 600; color: var(--text-muted); padding: 4px 0; }
.cal-grid-sm { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
.cal-day-sm { aspect-ratio: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 8px; font-size: 12px; cursor: default; position: relative; }
.cal-day-sm.hasTask { background: var(--primary-bg); cursor: pointer; }
.cal-day-sm.selected { border: 2px solid var(--primary); }
.cal-num-sm { font-size: 12px; font-weight: 500; }
.cal-badge { position: absolute; top: 1px; right: 1px; width: 14px; height: 14px; border-radius: 50%; background: var(--primary); color: #fff; font-size: 9px; display: flex; align-items: center; justify-content: center; }
/* 历史悬浮窗 */
.history-popup-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 500; display: flex; align-items: center; justify-content: center; }
.history-popup { width: 300px; max-height: 60vh; overflow-y: auto; background: #fff; border-radius: 16px; padding: 24px 20px; text-align: center; animation: popIn 0.2s ease-out; }
.hp-date { font-size: 17px; font-weight: 700; color: var(--primary); margin-bottom: 12px; }
.hp-task { font-size: 14px; padding: 6px 0; color: var(--text); display: flex; align-items: center; justify-content: center; gap: 6px; }
.hp-source { font-size: 10px; font-weight: 600; padding: 1px 6px; border-radius: 4px; }
.hp-source.parent { background: #E3F2FD; color: #1976D2; }
.hp-source.self { background: #FFF3E0; color: #F57C00; }
.hp-empty { font-size: 14px; color: var(--text-muted); padding: 20px 0; }
.hp-close { margin-top: 14px; background: var(--bg); border: none; border-radius: 10px; padding: 8px 24px; font-size: 14px; font-weight: 600; color: var(--text-muted); cursor: pointer; }
.td-pts { font-size: 11px; color: var(--primary); font-weight: 600; }

/* ===== 积分工具栏 ===== */
.reward-toolbar { margin-bottom: 8px; }
.reward-sort { width: 100%; border: 1px solid var(--border); border-radius: 8px; padding: 6px 10px; font-size: 13px; outline: none; font-family: inherit; color: var(--text); }

/* ===== 积分兑换 ===== */
.reward-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 8px;
}

.reward-card {
  background: linear-gradient(145deg, #FFF8E1, #FFECB3);
  border-radius: 12px;
  padding: 14px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.15s;
  border: 1.5px solid transparent;
  position: relative;
}

.reward-card:active { transform: scale(0.96); }

.reward-card.locked {
  opacity: 0.5;
  background: var(--bg);
}

.reward-icon { font-size: 30px; }

.reward-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

.reward-cost {
  font-size: 12px;
  color: var(--primary);
  font-weight: 700;
}

.reward-stock {
  font-size: 10px;
  color: var(--danger);
  font-weight: 600;
  position: absolute;
  top: 6px;
  right: 8px;
}

.heart-icon {
  position: absolute;
  bottom: 4px;
  right: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: transform 0.15s;
}
.heart-icon:active { transform: scale(1.3); }
.heart-icon.liked { animation: heartPop 0.3s; }
@keyframes heartPop { 0% { transform: scale(1); } 50% { transform: scale(1.4); } 100% { transform: scale(1); } }

/* ===== 兑换记录 ===== */
.redeem-history {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}

.history-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-light);
  margin-bottom: 6px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-muted);
  padding: 4px 0;
}

.history-cost {
  color: var(--danger);
  font-weight: 600;
  margin-left: auto;
}

.history-time {
  font-size: 11px;
  color: var(--text-muted);
}

/* ===== 确认弹窗 ===== */
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirm-dialog {
  width: 280px;
  background: #fff;
  border-radius: 20px;
  padding: 28px 24px 20px;
  text-align: center;
  animation: popIn 0.25s ease-out;
}

@keyframes popIn {
  from { transform: scale(0.85); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.confirm-icon { font-size: 48px; margin-bottom: 8px; }

.confirm-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 4px;
}

.confirm-name {
  font-size: 15px;
  color: var(--primary);
  font-weight: 600;
  margin-bottom: 8px;
}

.confirm-cost {
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 4px;
}

.confirm-balance {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 16px;
}

.confirm-actions {
  display: flex;
  gap: 10px;
}

.confirm-cancel, .confirm-ok {
  flex: 1;
  padding: 10px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.15s;
}

.confirm-cancel {
  background: var(--bg);
  color: var(--text-muted);
}

.confirm-ok {
  background: var(--primary);
  color: #fff;
}

.confirm-cancel:active, .confirm-ok:active { transform: scale(0.95); }

/* 联系人选择器 */
.picker-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1000; display: flex; align-items: flex-end; justify-content: center; }
.picker-sheet { width: 100%; max-width: 430px; max-height: 55vh; background: #fff; border-radius: 20px 20px 0 0; overflow: hidden; animation: slideUp 0.25s ease-out; }
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
.picker-header { display: flex; justify-content: space-between; align-items: center; padding: 18px 20px; border-bottom: 1px solid var(--border); }
.picker-title { font-size: 17px; font-weight: 700; color: var(--text); }
.picker-close { font-size: 18px; color: var(--text-muted); cursor: pointer; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
.picker-list { padding: 8px 0 24px; overflow-y: auto; max-height: 40vh; }
.contact-option { display: flex; align-items: center; gap: 12px; padding: 14px 20px; cursor: pointer; }
.contact-option:active { background: var(--bg); }
.co-emoji { font-size: 28px; }
.co-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.co-name { font-size: 16px; font-weight: 600; color: var(--text); }
.co-relation { font-size: 12px; color: var(--text-muted); }

.bottom-spacer { height: 16px; }

/* ===== 历史任务弹窗（新版） ===== */
.history-hint { font-size: 13px; color: var(--text-muted); margin-top: 2px; }
.history-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 500; display: flex; align-items: center; justify-content: center; }
.history-dialog { width: 320px; max-height: 65vh; overflow-y: auto; background: #fff; border-radius: 18px; padding: 24px 20px; display: flex; flex-direction: column; gap: 12px; }
.hd-title { font-size: 18px; font-weight: 700; color: var(--text); text-align: center; }
.hd-list { display: flex; flex-direction: column; gap: 12px; }
.hd-date-group { background: var(--bg); border-radius: 12px; padding: 12px; }
.hd-date-label { font-size: 14px; font-weight: 700; color: var(--primary); margin-bottom: 6px; }
.hd-task-row { font-size: 14px; padding: 4px 0; color: var(--text); display: flex; align-items: center; gap: 6px; }
.hd-pts { font-size: 12px; color: var(--primary); font-weight: 600; }
.hd-src { font-size: 10px; font-weight: 600; padding: 1px 6px; border-radius: 4px; }
.hd-src.parent { background: #E3F2FD; color: #1976D2; }
.hd-src.self { background: #FFF3E0; color: #F57C00; }
.hd-close-btn { margin-top: 4px; background: var(--primary); color: #fff; border: none; border-radius: 10px; padding: 10px; font-size: 15px; font-weight: 600; cursor: pointer; }
.hd-close-btn:active { opacity: 0.8; }
</style>
