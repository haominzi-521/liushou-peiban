<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { useAppStore } from '../stores'
defineOptions({ name: 'PageHome' })
import WeatherHeader from '../components/WeatherHeader.vue'
import OutfitRecommend from '../components/OutfitRecommend.vue'
import OutfitDiary from '../components/OutfitDiary.vue'
import RoadReminder from '../components/RoadReminder.vue'
import DailyTasks from '../components/DailyTasks.vue'
import TaskIsland from './TaskIsland.vue'

const store = useAppStore()
const showTaskIsland = ref(false)

watch(showTaskIsland, v => { store.hideBottomNav = v })
onUnmounted(() => { store.hideBottomNav = false })
</script>

<template>
  <div class="home-page">
    <template v-if="!showTaskIsland">
      <WeatherHeader :weather="store.weather" />
      <OutfitRecommend :items="store.outfitRecommendations" :advice="store.outfitAdvice" />
      <OutfitDiary :diary="store.outfitDiary" />
      <RoadReminder
        :safety="store.roadSafety"
        :markers="store.safetyMarkers"
        :map-center="store.mapCenter"
      />
      <DailyTasks
        :tasks="store.todayTasks"
        :points="store.points"
        @complete="store.completeTask"
        @undo="store.undoTask"
        @go-task-island="showTaskIsland = true"
      />
    </template>

    <!-- 任务岛子页面 -->
    <div v-if="showTaskIsland" class="task-island-wrapper">
      <div class="task-island-topbar">
        <button class="back-btn" @click="showTaskIsland = false">
          ← 返回首页
        </button>
        <span class="topbar-title">🏝️ 我的任务岛</span>
      </div>
      <TaskIsland :embedded="true" />
    </div>
  </div>
</template>

<style scoped>
.home-page {
  padding-bottom: 16px;
}

.task-island-wrapper {
  position: relative;
}

.task-island-topbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: var(--bg);
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid var(--border);
}

.back-btn {
  background: var(--bg);
  border: none;
  border-radius: 10px;
  padding: 6px 14px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  cursor: pointer;
}

.back-btn:active { opacity: 0.6; }

.topbar-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--text);
}
</style>
