<script setup>
// import { RouterLink, RouterView } from 'vue-router'
import SceneComponent from '@/components/SceneComponent.vue'
</script>

<template>
  <div class="app-container">
    <SceneComponent />
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
  padding: 50px;
  background-color: #928585; /* 可选：设置背景色 */
}
</style>
