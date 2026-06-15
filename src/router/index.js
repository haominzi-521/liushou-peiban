import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Chat from '../views/Chat.vue'
import HappyRecord from '../views/HappyRecord.vue'
import Profile from '../views/Profile.vue'
import Settings from '../views/Settings.vue'

const routes = [
  { path: '/', name: 'home', component: Home, meta: { title: '首页' } },
  { path: '/chat', name: 'chat', component: Chat, meta: { title: '亲子交流' } },
  { path: '/record', name: 'record', component: HappyRecord, meta: { title: '快乐记录' } },
  { path: '/profile', name: 'profile', component: Profile, meta: { title: '我的' } },
  { path: '/settings', name: 'settings', component: Settings, meta: { title: '设置' } },
]

// 记录每个页面滚动位置
const scrollPositions = {}
let currentRoute = null

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (from && from.name) {
      scrollPositions[from.name] = window.scrollY || document.documentElement.scrollTop
    }
    if (to.name && scrollPositions[to.name] !== undefined) {
      return new Promise(resolve => {
        setTimeout(() => {
          window.scrollTo(0, scrollPositions[to.name])
          resolve(false)
        }, 10)
      })
    }
    return { top: 0 }
  },
})

router.afterEach((to) => {
  currentRoute = to.name
  if (!scrollPositions[to.name]) {
    window.scrollTo(0, 0)
  }
})

export default router
