<script setup>
import { ref, onUnmounted } from 'vue'
import { useAppStore } from '../stores'
defineOptions({ name: 'PageProfile' })

const store = useAppStore()

const editingNickname = ref(false)
const tempNickname = ref('')
const showPrivacySettings = ref(false)
const showContactPicker = ref(false)
const showAvatarPicker = ref(false)

const customHours = ref(0); const customMins = ref(0)
const privacyDurations = [
  { label: '30分钟', value: 30, icon: '⏰' },
  { label: '1小时', value: 60, icon: '🕐' },
  { label: '2小时', value: 120, icon: '🕑' },
  { label: '自定义', value: -1, icon: '⚙️' },
]

function startEditNickname() { tempNickname.value = store.nickname; editingNickname.value = true }
function saveNickname() { store.updateNickname(tempNickname.value); editingNickname.value = false }

const showCustomTime = ref(false)
function enablePrivacy(duration) {
  if (duration === -1) { showCustomTime.value = true; return }
  const mins = duration === -1 ? customHours.value * 60 + customMins.value : duration
  store.setPrivacyDuration(mins); store.togglePrivacyMode(); showPrivacySettings.value = false; showCustomTime.value = false
}
function confirmCustomTime() {
  const total = customHours.value * 60 + customMins.value
  if (total <= 0) { alert('请设置至少1分钟'); return }
  store.setPrivacyDuration(total); store.togglePrivacyMode(); showPrivacySettings.value = false; showCustomTime.value = false
}
function disablePrivacy() { store.togglePrivacyMode() }

function privacyStatusText() {
  if (!store.privacyMode) return '已关闭'
  if (store.privacyDuration === 0) return '已开启 · 不限时'
  return `已开启 · ${store.privacyDuration}分钟`
}

// SOS
const sosPressed = ref(false); const sosProgress = ref(0); const sosTriggered = ref(false)
let sosAnimFrame = null

function startSOS() {
  sosPressed.value = true; sosProgress.value = 0; sosTriggered.value = false
  const startTime = Date.now(); const duration = 5000
  function animate() {
    const elapsed = Date.now() - startTime
    sosProgress.value = Math.min(100, (elapsed / duration) * 100)
    if (elapsed >= duration) {
      sosPressed.value = false; sosProgress.value = 100; sosTriggered.value = true
      store.triggerSOS()
      setTimeout(() => { sosTriggered.value = false }, 3000)
      return
    }
    sosAnimFrame = requestAnimationFrame(animate)
  }
  sosAnimFrame = requestAnimationFrame(animate)
}
function cancelSOS() { sosPressed.value = false; sosProgress.value = 0; if (sosAnimFrame) cancelAnimationFrame(sosAnimFrame) }
onUnmounted(() => { if (sosAnimFrame) cancelAnimationFrame(sosAnimFrame) })
</script>

<template>
  <div class="profile-page">
    <!-- 头像 -->
    <div class="profile-header card">
      <div class="avatar" @click="showAvatarPicker = true"><span>{{ store.avatar }}</span></div>
      <div class="profile-name-area">
        <template v-if="editingNickname">
          <input v-model="tempNickname" class="nickname-input" maxlength="10" @keyup.enter="saveNickname" autofocus />
          <button class="nickname-save" @click="saveNickname">✓</button>
        </template>
        <template v-else>
          <span class="nickname">{{ store.nickname }}</span>
        </template>
      </div>
      <div class="profile-points"><span class="pp-stars">🌟🌟🌟</span><span class="pp-value">{{ store.points }} 分</span></div>
    </div>

    <!-- 隐私时刻 -->
    <div class="card">
      <div class="section-title"><span>🔒</span> 隐私时刻</div>
      <p class="section-desc">开启后暂时不上传位置和照片到家长端</p>
      <div v-if="!store.privacyMode" class="privacy-off">
        <button class="privacy-enable-btn" @click="showPrivacySettings = !showPrivacySettings"><span>🛡️</span> 开启自定义隐私模式</button>
      </div>
      <div v-else class="privacy-on">
        <div class="privacy-active-badge"><span class="privacy-dot-anim"></span><span>{{ privacyStatusText() }}</span></div>
        <button class="privacy-disable-btn" @click="disablePrivacy">✕ 关闭隐私模式</button>
      </div>
      <!-- 自定义时间 -->
      <div class="custom-time-box" v-if="showCustomTime">
        <p class="ct-label">自定义隐私时长（最长24小时）</p>
        <div class="ct-row"><input v-model.number="customHours" type="number" class="ct-input" min="0" max="24" placeholder="时" /><span>时</span><input v-model.number="customMins" type="number" class="ct-input" min="0" max="59" placeholder="分" /><span>分</span></div>
        <button class="ct-confirm" @click="confirmCustomTime">✅ 确认开启</button>
      </div>
      <div class="privacy-options" v-if="showPrivacySettings && !store.privacyMode && !showCustomTime">
        <div class="privacy-options-label">选择隐私时长：</div>
        <div class="privacy-options-grid">
          <div v-for="d in privacyDurations" :key="d.value" class="privacy-option" @click="enablePrivacy(d.value)">
            <span class="po-icon">{{ d.icon }}</span><span class="po-label">{{ d.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- SOS紧急呼叫 -->
    <div class="card sos-card">
      <div class="section-title"><span>🆘</span> SOS紧急呼叫</div>
      <p class="section-desc">遇到危险时，长按按钮5秒自动呼叫紧急联系人</p>
      <div class="sos-section">
        <div class="sos-btn-wrapper"
          @mousedown.prevent="startSOS" @mouseup="cancelSOS" @mouseleave="cancelSOS"
          @touchstart.prevent="startSOS" @touchend="cancelSOS" @touchcancel="cancelSOS">
          <div class="sos-btn" :class="{ pressing: sosPressed, triggered: sosTriggered }">
            <div class="sos-ring" v-if="sosPressed"></div>
            <span class="sos-text">{{ sosTriggered ? '✅ 已呼叫' : sosPressed ? '呼叫中...' : 'SOS' }}</span>
          </div>
          <svg v-if="sosPressed" class="sos-progress-ring" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="5" />
            <circle cx="50" cy="50" r="46" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"
              :stroke-dasharray="289" :stroke-dashoffset="289 - (289 * sosProgress) / 100" transform="rotate(-90 50 50)" />
          </svg>
        </div>
        <p v-if="!sosPressed && !sosTriggered" class="sos-hint">长按此按钮5秒</p>
        <p v-if="sosTriggered" class="sos-success">🚨 已通知紧急联系人！请保持电话畅通</p>
      </div>

      <!-- 紧急联系人（带切换） -->
      <div class="emergency-contact">
        <div class="ec-label">📞 紧急联系人</div>
        <div class="ec-info">
          <span class="ec-avatar">{{ store.emergencyContact.emoji }}</span>
          <div class="ec-detail">
            <span class="ec-name">{{ store.emergencyContact.name }}</span>
            <span class="ec-phone">{{ store.emergencyContact.phone }}</span>
          </div>
          <button class="ec-switch" @click="showContactPicker = true">🔄</button>
          <button class="ec-call" @click="store.triggerSOS()">📞</button>
        </div>
      </div>

      <!-- 切换联系人弹窗 -->
      <Teleport to="body">
        <div class="picker-overlay" v-if="showContactPicker" @click.self="showContactPicker = false">
          <div class="picker-sheet">
            <div class="picker-header"><span class="picker-title">选择紧急联系人</span><span class="picker-close" @click="showContactPicker = false">✕</span></div>
            <div class="picker-list">
              <div v-for="(c, i) in store.chatContacts" :key="c.id" class="contact-option"
                :class="{ selected: i === store.currentContactIndex }" @click="store.switchContact(); showContactPicker = false">
                <span class="co-emoji">{{ c.emoji }}</span>
                <div class="co-info"><span class="co-name">{{ c.name }}</span><span class="co-relation">{{ c.relation }}</span></div>
                <span class="co-phone">{{ c.phone }}</span>
                <span v-if="i === store.currentContactIndex" class="co-check">✓</span>
              </div>
            </div>
          </div>
        </div>
      </Teleport>
    </div>

    <!-- 设置 -->
    <div class="card">
      <div class="section-title"><span>⚙️</span> 设置</div>
      <div class="settings-list">
        <div class="settings-item" @click="$router.push('/settings')">
          <span>查看全部设置</span>
          <span class="settings-arrow">›</span>
        </div>
      </div>
    </div>

    <!-- 头像选择器 -->
    <Teleport to="body">
      <div class="picker-overlay" v-if="showAvatarPicker" @click.self="showAvatarPicker = false">
        <div class="picker-sheet">
          <div class="picker-header"><span class="picker-title">选择头像</span><span class="picker-close" @click="showAvatarPicker = false">✕</span></div>
          <div class="avatar-picker-body">
            <div v-for="g in store.avatarOptions" :key="g.group" class="avatar-group">
              <div class="avatar-group-label">{{ g.group }}</div>
              <div class="avatar-icon-grid">
                <span v-for="icon in g.icons" :key="icon" class="avatar-icon-option" :class="{ picked: store.avatar === icon }" @click="store.setAvatar(icon); showAvatarPicker = false">{{ icon }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
    <div class="bottom-spacer"></div>
  </div>
</template>

<style scoped>
.profile-page { padding-bottom: 16px; }
.profile-header { background: linear-gradient(135deg, #FFF3E0, #FFE0B2, #FFCC80); text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 24px 16px; }
.avatar { width: 72px; height: 72px; background: rgba(255,255,255,0.6); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 36px; }
.profile-name-area { display: flex; align-items: center; gap: 6px; }
.nickname { font-size: 22px; font-weight: 700; color: var(--text); }
.nickname-edit { background: rgba(255,255,255,0.5); border: none; border-radius: 6px; padding: 4px 8px; font-size: 14px; cursor: pointer; }
.nickname-input { border: 2px solid var(--primary); border-radius: 8px; padding: 4px 10px; font-size: 18px; font-weight: 700; width: 140px; text-align: center; outline: none; font-family: inherit; color: var(--text); }
.nickname-save { background: var(--primary); color: #fff; border: none; border-radius: 8px; padding: 4px 12px; font-size: 16px; font-weight: 700; cursor: pointer; }
.profile-points { display: flex; align-items: center; gap: 6px; }
.pp-stars { font-size: 16px; }
.pp-value { font-size: 15px; font-weight: 600; color: var(--primary); }
.section-desc { font-size: 13px; color: var(--text-muted); margin-bottom: 12px; }

.privacy-off { text-align: center; }
.privacy-enable-btn { width: 100%; background: linear-gradient(135deg, #E8EAF6, #C5CAE9); border: none; border-radius: 14px; padding: 14px; font-size: 16px; font-weight: 700; color: #3F51B5; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; }
.privacy-on { display: flex; flex-direction: column; gap: 10px; align-items: center; }
.privacy-active-badge { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 700; color: #4CAF50; background: #E8F5E9; padding: 10px 20px; border-radius: 12px; }
.privacy-dot-anim { width: 10px; height: 10px; background: #4CAF50; border-radius: 50%; animation: pulse 1.5s infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.5); } }
.privacy-disable-btn { background: var(--bg); border: 1px solid var(--border); border-radius: 10px; padding: 8px 20px; font-size: 14px; color: var(--text-muted); cursor: pointer; }
.privacy-options { margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--border); }
.privacy-options-label { font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 10px; }
.privacy-options-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.privacy-option { background: var(--bg); border-radius: 12px; padding: 14px 6px; text-align: center; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 4px; border: 1.5px solid transparent; }
.privacy-option:active { border-color: var(--primary); transform: scale(0.95); }
.po-icon { font-size: 22px; }
.po-label { font-size: 12px; font-weight: 600; color: var(--text); }

.custom-time-box { margin-top: 14px; padding: 14px; background: var(--bg); border-radius: 12px; text-align: center; }
.ct-label { font-size: 13px; color: var(--text-light); margin-bottom: 8px; }
.ct-row { display: flex; align-items: center; justify-content: center; gap: 4px; }
.ct-input { width: 60px; border: 2px solid var(--border); border-radius: 8px; padding: 6px; text-align: center; font-size: 18px; font-weight: 700; outline: none; font-family: inherit; }
.ct-input:focus { border-color: var(--primary); }
.ct-confirm { width: 100%; margin-top: 10px; background: var(--primary); color: #fff; border: none; border-radius: 10px; padding: 10px; font-size: 14px; font-weight: 600; cursor: pointer; }

.sos-card { border-left: 4px solid var(--danger); }
.sos-section { display: flex; flex-direction: column; align-items: center; margin-bottom: 16px; }
.sos-btn-wrapper { position: relative; width: 100px; height: 100px; cursor: pointer; user-select: none; }
.sos-btn { width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(135deg, #EF476F, #D32F2F); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(239,71,111,0.4); transition: all 0.15s; position: relative; z-index: 2; }
.sos-btn:active, .sos-btn.pressing { transform: scale(1.08); box-shadow: 0 6px 24px rgba(239,71,111,0.6); }
.sos-btn.triggered { background: linear-gradient(135deg, #4CAF50, #388E3C); box-shadow: 0 4px 16px rgba(76,175,80,0.4); }
.sos-ring { position: absolute; inset: -8px; border-radius: 50%; border: 3px solid rgba(239,71,111,0.4); animation: ringExpand 1s infinite; }
@keyframes ringExpand { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(1.3); opacity: 0; } }
.sos-text { font-size: 18px; font-weight: 800; color: #fff; letter-spacing: 1px; }
.sos-progress-ring { position: absolute; inset: -8px; width: 116px; height: 116px; z-index: 1; }
.sos-hint { font-size: 13px; color: var(--text-muted); margin-top: 10px; }
.sos-success { font-size: 14px; color: #4CAF50; font-weight: 600; margin-top: 10px; text-align: center; }

.emergency-contact { background: var(--bg); border-radius: 12px; padding: 14px; }
.ec-label { font-size: 13px; font-weight: 600; color: var(--text-light); margin-bottom: 8px; }
.ec-info { display: flex; align-items: center; gap: 10px; }
.ec-avatar { width: 40px; height: 40px; background: #FFE0E0; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 22px; }
.ec-detail { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.ec-name { font-size: 15px; font-weight: 600; color: var(--text); }
.ec-phone { font-size: 13px; color: var(--text-muted); }
.ec-switch { width: 36px; height: 36px; border-radius: 50%; background: #E3F2FD; border: none; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.ec-switch:active { background: #BBDEFB; }
.ec-call { width: 40px; height: 40px; border-radius: 50%; background: #4CAF50; border: none; font-size: 18px; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.ec-call:active { background: #388E3C; }

/* 联系人选择器 */
.picker-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1000; display: flex; align-items: flex-end; justify-content: center; }
.picker-sheet { width: 100%; max-width: 430px; background: #fff; border-radius: 20px 20px 0 0; animation: slideUp 0.25s ease-out; }
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
.picker-header { display: flex; justify-content: space-between; align-items: center; padding: 18px 20px; border-bottom: 1px solid var(--border); }
.picker-title { font-size: 17px; font-weight: 700; color: var(--text); }
.picker-close { font-size: 18px; color: var(--text-muted); cursor: pointer; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
.picker-list { padding: 8px 0 24px; }
.contact-option { display: flex; align-items: center; gap: 12px; padding: 14px 20px; cursor: pointer; }
.contact-option:active { background: var(--bg); }
.contact-option.selected { background: var(--primary-bg); }
.co-emoji { font-size: 28px; }
.co-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.co-name { font-size: 16px; font-weight: 600; color: var(--text); }
.co-relation { font-size: 12px; color: var(--text-muted); }
.co-phone { font-size: 14px; color: var(--text-light); }
.co-check { font-size: 18px; color: var(--primary); font-weight: 700; }

/* 头像选择器 */
.avatar-picker-body { padding: 12px 16px 24px; max-height: 55vh; overflow-y: auto; }
.avatar-group { margin-bottom: 16px; }
.avatar-group-label { font-size: 13px; font-weight: 600; color: var(--text-light); margin-bottom: 6px; }
.avatar-icon-grid { display: flex; flex-wrap: wrap; gap: 8px; }
.avatar-icon-option { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; font-size: 28px; background: var(--bg); border-radius: 12px; cursor: pointer; border: 2px solid transparent; transition: all 0.15s; }
.avatar-icon-option:active { transform: scale(0.9); }
.avatar-icon-option.picked { border-color: var(--primary); background: var(--primary-bg); transform: scale(1.1); }

.settings-list { display: flex; flex-direction: column; }
.settings-item { display: flex; justify-content: space-between; align-items: center; padding: 13px 4px; font-size: 15px; color: var(--text); cursor: pointer; border-bottom: 1px solid #f5f0ea; }
.settings-item:last-child { border-bottom: none; }
.settings-arrow { font-size: 20px; color: var(--text-muted); }
.settings-switch { font-size: 12px; font-weight: 700; padding: 3px 14px; border-radius: 12px; }
.settings-switch.on { background: #E8F5E9; color: #4CAF50; }
.bottom-spacer { height: 16px; }
</style>
