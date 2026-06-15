<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores'
defineOptions({ name: 'PageSettings' })

const router = useRouter(); const store = useAppStore()
const editingNickname = ref(false); const tempNickname = ref('')
const posShare = ref(true); const notifyEnabled = ref(true)
const showTheme = ref(false); const showFamily = ref(false); const showDevice = ref(false)
const showAbout = ref(false); const devicePhone = ref('138****6789')
const fontSize = ref('normal')

function startEditNickname() { tempNickname.value = store.nickname; editingNickname.value = true }
function saveNickname() { store.updateNickname(tempNickname.value); editingNickname.value = false }
function goBack() { router.back() }

// 马卡龙色系
const macaronColors = [
  { name: '蜜桃橙', val: '#FF8C42' }, { name: '樱花粉', val: '#F8BBD0' },
  { name: '薄荷绿', val: '#80CBC4' }, { name: '薰衣紫', val: '#CE93D8' },
  { name: '天空蓝', val: '#90CAF9' }, { name: '柠檬黄', val: '#FFF176' },
  { name: '草莓红', val: '#EF9A9A' }, { name: '奶昔白', val: '#FFF8E1' },
]
const patterns = [
  { name: '无', val: 'none', icon: '⬜' }, { name: '小兔子', val: 'bunny', icon: '🐰' },
  { name: '海豚', val: 'dolphin', icon: '🐬' }, { name: '星星', val: 'star', icon: '⭐' },
  { name: '花朵', val: 'flower', icon: '🌸' }, { name: '猫咪', val: 'cat', icon: '🐱' },
  { name: '小狗', val: 'dog', icon: '🐶' }, { name: '小熊', val: 'bear', icon: '🐻' },
]

// 家庭成员（从亲子交流读取）
const familyMembers = computed(() => [
  { name: '妈妈', emoji: '👩', phone: '138****6789', relation: '母亲' },
  { name: '爸爸', emoji: '👨', phone: '139****8901', relation: '父亲' },
  { name: '奶奶', emoji: '👵', phone: '137****1234', relation: '祖母' },
])
</script>

<template>
  <div class="settings-page">
    <div class="settings-topbar"><button class="back-btn" @click="goBack">←</button><span class="topbar-title">⚙️ 设置</span></div>

    <!-- 账号 -->
    <div class="card"><div class="section-title"><span>👤</span> 账号信息</div>
      <div class="settings-list">
        <div class="settings-item" @click="startEditNickname"><span>修改昵称</span><span class="settings-val">{{ store.nickname }}</span></div>
        <div class="settings-item"><span>积分</span><span class="settings-val">{{ store.points }} 分</span></div>
        <div class="settings-item"><span>紧急联系人</span><span class="settings-val">{{ store.emergencyContact.name }} {{ store.emergencyContact.phone }}</span></div>
      </div>
    </div>

    <!-- 通知与隐私 -->
    <div class="card"><div class="section-title"><span>🔔</span> 通知与隐私</div>
      <div class="settings-list">
        <div class="settings-item" @click="notifyEnabled = !notifyEnabled"><span>消息通知</span><span class="settings-switch" :class="{ on: notifyEnabled }">{{ notifyEnabled ? '开' : '关' }}</span></div>
        <div class="settings-item" @click="posShare = !posShare"><span>位置共享</span><span class="settings-switch" :class="{ on: posShare }">{{ posShare ? '开' : '关' }}</span></div>
        <div class="settings-item"><span>隐私模式</span><span class="settings-val" :style="{ color: store.privacyMode ? '#4CAF50' : '#999' }">{{ store.privacyMode ? (store.privacyDuration === 0 ? '不限时' : store.privacyDuration+'分钟') : '已关闭' }}</span></div>
      </div>
    </div>

    <!-- 显示（马卡龙主题） -->
    <div class="card"><div class="section-title"><span>🎨</span> 显示设置</div>
      <div class="settings-list">
        <div class="font-size-row">
          <span class="font-size-label">字体大小</span>
          <div class="font-size-options">
            <span v-for="s in [{v:'small',l:'小'},{v:'normal',l:'标准'},{v:'large',l:'大'}]" :key="s.v"
              class="fs-opt" :class="{ picked: fontSize === s.v }" @click="store.setFontSize(s.v)">{{ s.l }}</span>
          </div>
        </div>
        <div class="settings-item" @click="showTheme = !showTheme"><span>主题颜色</span><span class="settings-val" :style="{ color: store.themeColor }">● {{ macaronColors.find(c => c.val === store.themeColor)?.name || '蜜桃橙' }}</span></div>
        <div class="settings-item"><span>主题图案</span><span class="settings-val">{{ patterns.find(p => p.val === store.themePattern)?.icon }} {{ patterns.find(p => p.val === store.themePattern)?.name || '无' }}</span></div>
      </div>
      <!-- 色盘 -->
      <div v-if="showTheme" class="theme-panel">
        <div class="theme-label">选择主题色</div>
        <div class="color-grid">
          <div v-for="c in macaronColors" :key="c.val" class="color-item" :class="{ picked: store.themeColor === c.val }" :style="{ background: c.val }" @click="store.setThemeColor(c.val)"></div>
        </div>
        <div class="theme-label" style="margin-top:10px">选择图案</div>
        <div class="pattern-grid">
          <div v-for="p in patterns" :key="p.val" class="pattern-item" :class="{ picked: store.themePattern === p.val }" @click="store.setThemePattern(p.val)">{{ p.icon }}<span>{{ p.name }}</span></div>
        </div>
      </div>
    </div>

    <!-- 家庭管理 -->
    <div class="card"><div class="section-title"><span>👨‍👩‍👧</span> 家庭管理</div>
      <div class="settings-list">
        <div class="settings-item" @click="showFamily = !showFamily"><span>家庭成员</span><span class="settings-arrow">›</span></div>
      <div v-if="showFamily" class="sub-panel">
        <div v-for="m in familyMembers" :key="m.name" class="member-row"><span>{{ m.emoji }}</span><span>{{ m.name }}</span><span class="member-relation">{{ m.relation }}</span><span class="member-phone">{{ m.phone }}</span></div>
        <button class="add-member-btn">＋ 添加成员</button>
      </div>
        <div class="settings-item" @click="showDevice = !showDevice"><span>绑定设备</span><span class="settings-arrow">›</span></div>
      <div v-if="showDevice" class="sub-panel">
        <p class="device-desc">修改绑定手机号</p>
        <input v-model="devicePhone" type="tel" class="device-input" maxlength="11" />
        <button class="device-save" @click="showDevice = false; alert('✅ 手机号已更新')">保存</button>
      </div>
        <div class="settings-item"><span>任务审批</span><span class="settings-arrow">›</span></div>
      </div>
    </div>

    <!-- 帮助 -->
    <div class="card"><div class="section-title"><span>ℹ️</span> 帮助与关于</div>
      <div class="settings-list">
        <div class="settings-item"><span>使用帮助</span><span class="settings-arrow">›</span></div>
        <div class="settings-item"><span>意见反馈</span><span class="settings-arrow">›</span></div>
        <div class="settings-item" @click="showAbout = true"><span>关于我们</span><span class="settings-arrow">›</span></div>
      </div>
    </div>

    <div class="version">留守陪伴 v1.0.0</div>
    <div class="bottom-spacer"></div>

    <!-- 弹窗 -->
    <Teleport to="body">
      <div class="dialog-overlay" v-if="editingNickname" @click.self="saveNickname()"><div class="dialog-box"><div class="dialog-title">修改昵称</div><input v-model="tempNickname" class="dialog-input" maxlength="10" @keyup.enter="saveNickname()" autofocus /><div class="dialog-actions"><button class="dialog-btn cancel" @click="editingNickname = false">取消</button><button class="dialog-btn save" @click="saveNickname()">保存</button></div></div></div>
      <div class="dialog-overlay" v-if="showAbout" @click.self="showAbout = false"><div class="dialog-box"><div class="dialog-title">关于留守陪伴</div><p style="font-size:14px;color:var(--text-light);text-align:center;line-height:1.8;">🏠 留守陪伴 v1.0.0<br/>一款专为留守儿童设计的陪伴APP<br/>连接父母与孩子的温暖桥梁<br/>💕 让爱不再遥远</p><button class="dialog-btn save" style="width:100%;margin-top:12px" @click="showAbout = false">知道了</button></div></div>
    </Teleport>
  </div>
</template>

<style scoped>
.settings-page { padding-bottom: 16px; }
.settings-topbar { display: flex; align-items: center; gap: 10px; padding: 14px 16px; background: var(--bg); position: sticky; top: 0; z-index: 10; border-bottom: 1px solid var(--border); }
.back-btn { background: none; border: none; font-size: 18px; color: var(--text); cursor: pointer; }
.topbar-title { font-size: 18px; font-weight: 700; color: var(--text); }
.settings-list { display: flex; flex-direction: column; }
.settings-item { display: flex; justify-content: space-between; align-items: center; padding: 14px 4px; font-size: 15px; color: var(--text); cursor: pointer; border-bottom: 1px solid #f5f0ea; }
.settings-item:last-child { border-bottom: none; }
.settings-item:active { opacity: 0.6; }
.settings-arrow { font-size: 20px; color: var(--text-muted); }
.settings-val { font-size: 14px; color: var(--text-muted); }
.font-size-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 4px; border-bottom: 1px solid #f5f0ea; }
.font-size-label { font-size: 15px; color: var(--text); }
.font-size-options { display: flex; gap: 4px; }
.fs-opt { padding: 3px 12px; border-radius: 8px; font-size: 13px; font-weight: 600; background: #f0f0f0; color: #999; cursor: pointer; }
.fs-opt.picked { background: var(--primary); color: #fff; }
.settings-switch { font-size: 12px; font-weight: 700; padding: 3px 14px; border-radius: 12px; background: #f0f0f0; color: #999; }
.settings-switch.on { background: #E8F5E9; color: #4CAF50; }
.version { text-align: center; font-size: 12px; color: var(--text-muted); padding: 20px 0; }
.bottom-spacer { height: 16px; }

/* 主题面板 */
.theme-panel { margin-top: 10px; padding: 12px; background: var(--bg); border-radius: 12px; }
.theme-label { font-size: 13px; font-weight: 600; color: var(--text-light); margin-bottom: 6px; }
.color-grid { display: flex; gap: 8px; flex-wrap: wrap; }
.color-item { width: 32px; height: 32px; border-radius: 50%; cursor: pointer; border: 3px solid transparent; }
.color-item.picked { border-color: var(--text); transform: scale(1.2); }
.pattern-grid { display: flex; gap: 6px; flex-wrap: wrap; }
.pattern-item { padding: 6px 10px; background: #fff; border-radius: 10px; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 4px; border: 1.5px solid transparent; }
.pattern-item.picked { border-color: var(--primary); background: var(--primary-bg); }

/* 子面板（紧贴触发元素下方） */
.sub-panel { margin-top: 6px; margin-bottom: 4px; padding: 12px; background: var(--bg); border-radius: 12px; }
.member-row { display: flex; align-items: center; gap: 8px; padding: 8px 4px; font-size: 14px; color: var(--text); }
.member-relation { font-size: 12px; color: var(--text-muted); }
.member-phone { font-size: 12px; color: var(--text-muted); margin-left: auto; }
.add-member-btn { width: 100%; margin-top: 8px; background: #fff; border: 1px dashed var(--primary-light); border-radius: 8px; padding: 8px; font-size: 14px; color: var(--primary); cursor: pointer; }
.device-desc { font-size: 13px; color: var(--text-muted); margin-bottom: 8px; }
.device-input { width: 100%; border: 2px solid var(--border); border-radius: 10px; padding: 10px 14px; font-size: 15px; outline: none; font-family: inherit; }
.device-input:focus { border-color: var(--primary); }
.device-save { width: 100%; margin-top: 10px; background: var(--primary); color: #fff; border: none; border-radius: 10px; padding: 10px; font-size: 14px; font-weight: 600; cursor: pointer; }

/* 弹窗 */
.dialog-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; }
.dialog-box { width: 280px; background: #fff; border-radius: 16px; padding: 24px 20px; }
.dialog-title { font-size: 17px; font-weight: 700; color: var(--text); text-align: center; margin-bottom: 14px; }
.dialog-input { width: 100%; border: 2px solid var(--border); border-radius: 10px; padding: 10px 14px; font-size: 15px; outline: none; font-family: inherit; text-align: center; }
.dialog-input:focus { border-color: var(--primary); }
.dialog-actions { display: flex; gap: 10px; margin-top: 14px; }
.dialog-btn { flex: 1; padding: 10px; border-radius: 10px; border: none; font-size: 14px; font-weight: 600; cursor: pointer; }
.dialog-btn.cancel { background: var(--bg); color: var(--text-muted); }
.dialog-btn.save { background: var(--primary); color: #fff; }
</style>
