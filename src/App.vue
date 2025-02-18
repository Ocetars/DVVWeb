<script setup>
// import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <router-view />
  <SpeedInsights />
</template>

<style scoped>
.app-container {
  display: flex;
  justify-content: center;
}
</style>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100vh;
  overflow: hidden;
}

#app {
  height: 100vh;
  overflow: hidden;
}
</style>
