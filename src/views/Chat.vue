<script setup>
import { ref, nextTick, watch, computed } from 'vue'
import { useAppStore } from '../stores'
defineOptions({ name: 'PageChat' })

const store = useAppStore()
const view = ref('contacts')
const activeContact = ref(null)
const newMessage = ref('')
const chatBody = ref(null)
const showEmojiPicker = ref(false)
const showMenu = ref(false)
const addPhone = ref(''); const addName = ref(''); const addRelation = ref('')

// 联系人来自 Store，特别关注排最前
const contacts = computed(() => [...store.chatContacts].sort((a, b) => {
  if (a.special && !b.special) return -1
  if (!a.special && b.special) return 1
  return 0
}))

// 历史消息模板
const historyMsgs = {
  '妈妈': [{ text: '宝贝今天过得开心吗？', time: '10:30' }, { text: '记得多喝水哦～💧', time: '12:00' }],
  '爸爸': [{ text: '晚上爸爸给你打电话', time: '14:20' }, { text: '周末带你去游乐园！🎢', time: '昨天' }],
  '奶奶': [{ text: '宝贝，奶奶做了你爱吃的饺子🥟', time: '周二' }],
}

function lastMsg(c) {
  const msgs = store.chatMessages.filter(m => m.contactName === c.name)
  if (msgs.length) return msgs[msgs.length - 1].text
  const h = historyMsgs[c.name] || []
  return h.length ? h[h.length - 1].text : ''
}
function lastTime(c) {
  const msgs = store.chatMessages.filter(m => m.contactName === c.name)
  if (msgs.length) return msgs[msgs.length - 1].time
  const h = historyMsgs[c.name] || []
  return h.length ? h[h.length - 1].time : ''
}
function hasUnread(c) { return !store.messageReadStatus[c.id] }

const activeMessages = computed(() => {
  if (!activeContact.value) return []
  return store.chatMessages.filter(m => m.contactName === activeContact.value.name)
})

const emojiStickers = ['😀','😂','🥰','😍','🤩','😎','🥺','😢','😡','👍','👎','💪','🙏','❤️','💔','🔥','⭐','🎉','🌸','🌟','🍕','🍦','🎮','📚','🏃','💤','🎵','📷','🏠','🚗','🌈','☀️','🌧️','❄️','🎂','🎁']

let resolveTimer = null

function openConversation(c) {
  activeContact.value = c; view.value = 'conversation'; showMenu.value = false
  store.markMessageRead(c.id); store.hideBottomNav = true
  scrollToBottom()
  // 检查未处理的任务申请，启动随机审批
  checkPendingApplications()
}

function checkPendingApplications() {
  if (!activeContact.value) return
  const pending = store.chatMessages.filter(m =>
    m.type === 'taskApplication' &&
    !m.applicationData?.resolved &&
    m.contactName === activeContact.value.name
  )
  pending.forEach(msg => {
    const delay = 2000 + Math.random() * 3000 // 2-5秒随机
    resolveTimer = setTimeout(() => {
      const approved = Math.random() > 0.5
      store.resolveTaskApplication(msg.id, approved)
      scrollToBottom()
    }, delay)
  })
}
function backToContacts() {
  if (resolveTimer) clearTimeout(resolveTimer)
  if (activeContact.value) store.markMessageUnread(activeContact.value.id)
  view.value = 'contacts'; activeContact.value = null; store.hideBottomNav = false; showMenu.value = false
}
function send() {
  const text = newMessage.value.trim(); if (!text) return
  store.sendChatMessage(text, activeContact.value?.name || '')
  newMessage.value = ''; showEmojiPicker.value = false; scrollToBottom()
}
function insertEmoji(e) { newMessage.value += e }
function scrollToBottom() { nextTick(() => { if (chatBody.value) chatBody.value.scrollTop = chatBody.value.scrollHeight }) }

function addFriend() {
  if (!addPhone.value.trim() || !addName.value.trim()) return
  const emoji = addRelation.value === '妈妈' ? '👩' : addRelation.value === '爸爸' ? '👨' : addRelation.value === '奶奶' ? '👵' : addRelation.value === '爷爷' ? '👴' : '👤'
  store.addChatContact(addName.value.trim(), emoji, addPhone.value.trim(), addRelation.value || '其他')
  addPhone.value = ''; addName.value = ''; addRelation.value = ''; view.value = 'contacts'
  alert('✅ 联系人添加成功！')
}
function delContact() {
  if (!activeContact.value) return
  if (confirm(`确定删除联系人「${activeContact.value.name}」？`)) {
    store.deleteChatContact(activeContact.value.id)
    view.value = 'contacts'; activeContact.value = null; store.hideBottomNav = false
  }
  showMenu.value = false
}
function toggleSpecial() {
  if (!activeContact.value) return
  showMenu.value = false
  const wasSpecial = activeContact.value.special
  store.toggleSpecialContact(activeContact.value.id)
  // refresh reference from store
  activeContact.value = store.chatContacts.find(c => c.id === activeContact.value.id)
  // now check correctly
  const nowSpecial = activeContact.value?.special
  alert(nowSpecial ? `⭐ 已将「${activeContact.value.name}」设为特别关注` : `⭐ 已取消「${activeContact.value.name}」的特别关注`)
}
function searchHistory() {
  alert(`🔍 查找「${activeContact.value?.name}」的聊天记录...`)
  showMenu.value = false
}

watch(() => store.chatMessages.length, scrollToBottom)
</script>

<template>
  <div class="chat-page" :class="{ 'conversation-view': view === 'conversation' }">
    <!-- ===== 联系人列表 ===== -->
    <template v-if="view === 'contacts'">
      <div class="chat-header"><span class="chat-header-icon">💬</span><div class="chat-header-info"><span class="chat-header-title">亲子交流</span><span class="chat-header-sub">{{ contacts.length }}个联系人</span></div><button class="add-friend-btn" @click="view = 'addFriend'">＋</button></div>
      <div class="contact-list">
        <div v-for="c in contacts" :key="c.id" class="contact-item" @click="openConversation(c)">
          <div class="contact-avatar">{{ c.emoji }}</div>
          <div class="contact-info">
            <div class="contact-top"><span class="contact-name"><span v-if="c.special" class="special-star">⭐</span> {{ c.name }}</span><span class="contact-time">{{ lastTime(c) }}</span></div>
            <div class="contact-bottom"><span class="contact-msg">{{ lastMsg(c) }}</span><span v-if="hasUnread(c)" class="contact-badge"></span></div>
          </div>
        </div>
      </div>
    </template>

    <!-- ===== 对话页面 ===== -->
    <template v-if="view === 'conversation' && activeContact">
      <div class="chat-header">
        <button class="back-btn" @click="backToContacts">←</button>
        <div class="contact-avatar-sm">{{ activeContact.emoji }}</div>
        <div class="chat-header-info"><span class="chat-header-title">{{ activeContact.name }}</span></div>
        <button class="menu-btn" @click="showMenu = !showMenu">•••</button>
      </div>

      <!-- 三点菜单 -->
      <div class="menu-drop" v-if="showMenu" @click.self="showMenu = false">
        <div class="menu-item" @click="delContact">🗑️ 删除联系人</div>
        <div class="menu-item" @click="toggleSpecial">⭐ 特别关注</div>
        <div class="menu-item" @click="searchHistory">🔍 查找聊天记录</div>
      </div>

      <div class="chat-body" ref="chatBody">
        <div v-for="(m, i) in (historyMsgs[activeContact.name] || [])" :key="'h'+i" class="chat-msg">
          <div class="msg-avatar">{{ activeContact.emoji }}</div>
          <div class="msg-bubble"><div class="msg-sender">{{ activeContact.name }}</div><div class="msg-text">{{ m.text }}</div><div class="msg-time">{{ m.time }}</div></div>
        </div>
        <div v-for="msg in activeMessages" :key="msg.id" class="chat-msg" :class="{ mine: !msg.isParent }">
          <div class="msg-avatar">{{ msg.isParent ? activeContact.emoji : store.avatar }}</div>
          <div class="msg-bubble">
            <div class="msg-sender">{{ msg.isParent ? activeContact.name : store.nickname }}</div>
            <!-- 任务申请卡片 -->
            <div v-if="msg.type === 'taskApplication'" class="task-apply-card">
              <div class="tac-title">📋 任务审批申请</div>
              <div class="tac-body">{{ msg.text }}</div>
              <div v-if="!msg.applicationData.resolved" class="tac-btns">
                <button class="tac-btn approve" disabled>好的我同意啦</button>
                <button class="tac-btn reject" disabled>还需从长计议</button>
              </div>
              <div v-else class="tac-result" :class="{ approved: msg.applicationData.approved }">
                {{ msg.applicationData.approved ? '✅ 已同意' : '❌ 已拒绝' }}
              </div>
            </div>
            <div v-else class="msg-text">{{ msg.text }}</div>
            <div class="msg-time">{{ msg.time }}</div>
          </div>
        </div>
      </div>

      <div class="chat-input-bar">
        <button class="emoji-toggle" @click="showEmojiPicker = !showEmojiPicker">😊</button>
        <input v-model="newMessage" type="text" class="chat-input" placeholder="输入消息..." @keyup.enter="send" />
        <button class="chat-send" @click="send" :disabled="!newMessage.trim()">📨</button>
      </div>
      <div class="emoji-panel" v-if="showEmojiPicker"><span v-for="e in emojiStickers" :key="e" class="emoji-item" @click="insertEmoji(e)">{{ e }}</span></div>
    </template>

    <!-- ===== 添加联系人 ===== -->
    <template v-if="view === 'addFriend'">
      <div class="chat-header"><button class="back-btn" @click="view = 'contacts'">←</button><span class="chat-header-title">添加联系人</span></div>
      <div class="add-friend-form">
        <div class="aff-icon">📱</div>
        <p class="aff-desc">输入家人的手机号添加好友</p>
        <input v-model="addPhone" type="tel" class="aff-input" placeholder="手机号码" maxlength="11" />
        <input v-model="addName" type="text" class="aff-input" placeholder="称呼（如：妈妈）" maxlength="10" />
        <select v-model="addRelation" class="aff-select"><option value="">选择关系</option><option>妈妈</option><option>爸爸</option><option>爷爷</option><option>奶奶</option><option>其他</option></select>
        <button class="aff-submit" @click="addFriend" :disabled="!addPhone.trim() || !addName.trim()">✅ 添加联系人</button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.chat-page { display: flex; flex-direction: column; height: calc(100dvh - 64px); max-width: 430px; margin: 0 auto; background: #fff; position: relative; }
.chat-page.conversation-view { height: 100dvh; }

/* 顶部栏 */
.chat-header { display: flex; align-items: center; gap: 10px; padding: 12px 14px; background: linear-gradient(135deg, #FFF3E0, #FFE0B2); border-bottom: 1px solid var(--border); flex-shrink: 0; }
.chat-header-icon { font-size: 26px; }
.chat-header-info { flex: 1; display: flex; flex-direction: column; gap: 1px; }
.chat-header-title { font-size: 17px; font-weight: 700; color: var(--text); }
.chat-header-sub { font-size: 12px; color: var(--text-muted); }
.add-friend-btn { width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.6); border: none; font-size: 22px; font-weight: 700; color: var(--primary); cursor: pointer; display: flex; align-items: center; justify-content: center; }
.back-btn { background: none; border: none; font-size: 20px; cursor: pointer; color: var(--text); padding: 0 4px; flex-shrink: 0; }
.menu-btn { width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.4); border: none; font-size: 16px; font-weight: 700; color: var(--text); cursor: pointer; letter-spacing: 1px; line-height: 1; flex-shrink: 0; }

/* 三点菜单 */
.menu-drop { position: absolute; top: 56px; right: 12px; background: #fff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); z-index: 50; min-width: 160px; overflow: hidden; }
.menu-item { padding: 12px 16px; font-size: 14px; color: var(--text); cursor: pointer; border-bottom: 1px solid #f5f0ea; }
.menu-item:last-child { border-bottom: none; }
.menu-item:active { background: var(--bg); }

.special-star { font-size: 13px; margin-right: 2px; }

/* 联系人列表 */
.contact-list { flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch; }
.contact-item { display: flex; align-items: center; gap: 12px; padding: 14px 16px; cursor: pointer; border-bottom: 1px solid #f5f0ea; }
.contact-item:active { background: var(--bg); }
.contact-avatar { width: 48px; height: 48px; border-radius: 50%; background: #F5F0EA; display: flex; align-items: center; justify-content: center; font-size: 26px; flex-shrink: 0; }
.contact-avatar-sm { width: 36px; height: 36px; border-radius: 50%; background: #F5F0EA; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
.contact-info { flex: 1; min-width: 0; }
.contact-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.contact-name { font-size: 16px; font-weight: 600; color: var(--text); }
.contact-time { font-size: 11px; color: var(--text-muted); }
.contact-bottom { display: flex; justify-content: space-between; align-items: center; }
.contact-msg { font-size: 13px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 220px; }
.contact-badge { width: 10px; height: 10px; border-radius: 50%; background: var(--danger); flex-shrink: 0; margin-left: 4px; }

/* 聊天区 */
.chat-body { flex: 1; overflow-y: auto; padding: 12px 14px; display: flex; flex-direction: column; gap: 14px; background: #F5F0EA; -webkit-overflow-scrolling: touch; }
.chat-msg { display: flex; gap: 8px; align-items: flex-start; max-width: 85%; }
.chat-msg.mine { align-self: flex-end; flex-direction: row-reverse; }
.msg-avatar { width: 34px; height: 34px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
.msg-bubble { background: #fff; border-radius: 14px; padding: 10px 14px; box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
.chat-msg.mine .msg-bubble { background: #D4F0C0; }
.msg-sender { font-size: 11px; font-weight: 600; color: var(--primary); margin-bottom: 2px; }
.msg-text { font-size: 15px; color: var(--text); line-height: 1.5; }
/* 任务审批卡片 */
.task-apply-card { background: #FFF8E1; border-radius: 12px; padding: 12px; margin: 4px 0; min-width: 200px; }
.tac-title { font-size: 13px; font-weight: 700; color: #F57C00; margin-bottom: 6px; }
.tac-body { font-size: 14px; color: var(--text); line-height: 1.6; white-space: pre-line; margin-bottom: 10px; }
.tac-btns { display: flex; gap: 8px; }
.tac-btn { flex: 1; padding: 8px; border-radius: 8px; border: none; font-size: 13px; font-weight: 600; cursor: not-allowed; opacity: 0.5; }
.tac-btn.approve { background: #E8F5E9; color: #388E3C; }
.tac-btn.reject { background: #FFF3E0; color: #E65100; }
.tac-result { text-align: center; font-size: 14px; font-weight: 700; padding: 4px 0; }
.tac-result.approved { color: #4CAF50; }
.msg-time { font-size: 10px; color: var(--text-muted); text-align: right; margin-top: 4px; }

/* 输入栏（固定底部） */
.chat-input-bar { display: flex; gap: 6px; padding: 8px 10px; background: #fff; border-top: 1px solid var(--border); flex-shrink: 0; align-items: center; position: sticky; bottom: 0; }
.emoji-toggle { width: 38px; height: 38px; border-radius: 50%; background: var(--bg); border: none; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.chat-input { flex: 1; border: 2px solid var(--border); border-radius: 20px; padding: 9px 14px; font-size: 15px; color: var(--text); outline: none; font-family: inherit; background: var(--bg); }
.chat-input:focus { border-color: var(--primary); }
.chat-send { width: 40px; height: 40px; border-radius: 50%; background: var(--primary); color: #fff; border: none; font-size: 18px; cursor: pointer; flex-shrink: 0; }
.chat-send:disabled { opacity: 0.4; }
.emoji-panel { display: flex; flex-wrap: wrap; gap: 4px; padding: 10px 12px; background: #fff; border-top: 1px solid var(--border); max-height: 160px; overflow-y: auto; flex-shrink: 0; }
.emoji-item { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-size: 22px; cursor: pointer; border-radius: 8px; }
.emoji-item:active { background: var(--bg); transform: scale(1.2); }

/* 添加好友 */
.add-friend-form { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 40px 24px; gap: 14px; }
.aff-icon { font-size: 56px; }
.aff-desc { font-size: 14px; color: var(--text-muted); }
.aff-input, .aff-select { width: 100%; border: 2px solid var(--border); border-radius: 12px; padding: 12px 14px; font-size: 15px; outline: none; font-family: inherit; }
.aff-input:focus { border-color: var(--primary); }
.aff-submit { width: 100%; background: var(--primary); color: #fff; border: none; border-radius: 12px; padding: 14px; font-size: 16px; font-weight: 600; cursor: pointer; }
.aff-submit:disabled { opacity: 0.5; }
</style>
