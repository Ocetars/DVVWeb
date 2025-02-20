<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ElTooltip, ElButton } from 'element-plus'
import GSymbol from './GSymbol.vue'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/vue'

// 添加 logo 路径
import logoHeader from '@/assets/Logo_header.png'

// 使用 defineProps 来接收父组件传递的属性
defineProps({
  drawerVisible: {
    type: Boolean,
    required: true
  }
})

// 使用 defineEmits 来声明自定义事件
const emit = defineEmits(['update:drawerVisible'])

// 添加加载进度相关的状态
const isLoading = ref(false)
const loadingProgress = ref(0)

// 监听加载进度事件
const handleLoadingProgress = (event) => {
  isLoading.value = true
  loadingProgress.value = event.detail.progress
}

const handleLoadingComplete = () => {
  isLoading.value = false
  loadingProgress.value = 100
}

const handleLoadingError = () => {
  isLoading.value = false
}

// 在组件挂载时添加事件监听
onMounted(() => {
  window.addEventListener('droneLoadingProgress', handleLoadingProgress)
  window.addEventListener('droneLoadingComplete', handleLoadingComplete)
  window.addEventListener('droneLoadingError', handleLoadingError)
})

// 在组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('droneLoadingProgress', handleLoadingProgress)
  window.removeEventListener('droneLoadingComplete', handleLoadingComplete)
  window.removeEventListener('droneLoadingError', handleLoadingError)
})

// 添加处理函数
const handleDocClick = () => {
  // 文档功能待实现
  console.log('文档功能待实现')
}

const handleSettingClick = () => {
  // 设置功能待实现
  console.log('设置功能待实现')
}

// 更新 drawerVisible 的值
const updateDrawerVisible = (value) => {
  emit('update:drawerVisible', value)
}

// 添加提示显示状态
const showTip = ref(true)

// 关闭提示的方法
const closeTip = () => {
  showTip.value = false
}
</script>

<template>
  <header class="header">
    <!-- Logo 区域 -->
    <div class="logo-section">
      <div class="logo-container">
        <img :src="logoHeader" alt="DronePilot Logo" class="header-logo">
      </div>
      
      <!-- 修改: 可关闭的快速开始提示 -->
      <SignedOut>
        <a v-if="showTip"
           href="https://dpw-docs.ocetars.top/guide/getting-started.html" 
           target="_blank" 
           class="quick-start-tip">
          <div class="tip-content">
            <GSymbol family="rounded" size="20" weight="400">tips_and_updates</GSymbol>
            <span>初次使用？查看快速开始</span>
          </div>
          <button class="close-btn" @click.prevent="closeTip">
            <GSymbol family="rounded" size="20" weight="300" class="close-icon">close</GSymbol>
          </button>
        </a>
      </SignedOut>
    </div>

    <!-- 代码编辑器触发器 -->
    <div class="floating-trigger">
        <div class="trigger-button" @click="updateDrawerVisible(true)">
          <GSymbol class="code-icon">code</GSymbol>
          <span class="trigger-text">编辑代码</span>
        </div>
    </div>

    <!-- 加载进度显示 -->
    <div v-if="isLoading" class="loading-progress-container">
      <div class="loading-progress-wrapper">
        <div class="loading-progress-bar">
          <div class="progress-fill" :style="{ width: loadingProgress + '%' }"></div>
        </div>
        <span class="progress-text">模型加载中 {{ Math.round(loadingProgress) }}%</span>
      </div>
    </div>

    <!-- 右侧图标按钮组 -->
    <div class="header-right">
      <!-- 用户头像区域 -->
      <div class="user-section">
        <SignedOut>
          <SignInButton>
            <el-button class="login-btn" type="primary">
              <GSymbol family="rounded" size="20" weight="400" class="login-icon">login</GSymbol>
              <span class="trigger-text">登录</span>
            </el-button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>

      <!-- 文档和GitHub链接 -->
      <div class="nav-links">
        <a href="https://dpw-docs.ocetars.top/" target="_blank" class="header-icon-btn">
            <GSymbol family="rounded" size="20" weight="400 ">description</GSymbol>
            <span class="btn-text">Docs</span>
        </a>
        <a href="https://github.com/Ocetars/DronePilotWeb" target="_blank" class="header-icon-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16" class="github-icon"><path fill="currentColor" d="M8 0c4.42 0 8 3.58 8 8a8.01 8.01 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38c0-.27.01-1.13.01-2.2c0-.75-.25-1.23-.54-1.48c1.78-.2 3.65-.88 3.65-3.95c0-.88-.31-1.59-.82-2.15c.08-.2.36-1.02-.08-2.12c0 0-.67-.22-2.2.82c-.64-.18-1.32-.27-2-.27s-1.36.09-2 .27c-1.53-1.03-2.2-.82-2.2-.82c-.44 1.1-.16 1.92-.08 2.12c-.51.56-.82 1.28-.82 2.15c0 3.06 1.86 3.75 3.64 3.95c-.23.2-.44.55-.51 1.07c-.46.21-1.61.55-2.33-.66c-.15-.24-.6-.83-1.23-.82c-.67.01-.27.38.01.53c.34.19.73.9.82 1.13c.16.45.68 1.31 2.69.94c0 .67.01 1.3.01 1.49c0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8"></path></svg>
            <span class="btn-text">GitHub</span>
          </a>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* 将原来 DroneView.vue 中 .header 相关的样式都移到这里 */
.header {
  height: 60px;
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
  position: relative;
  padding: 0 20px; /* 添加左右内边距 */
  display: flex;
  align-items: center;
  justify-content: space-between; /* 确保 logo 和右侧按钮组分布在两端 */
}

/* 添加 logo 样式 */
.logo-container {
  height: 100%;
  display: flex;
  align-items: center;
}

.header-logo {
  height: 28px;
  width: auto;
  object-fit: contain;
}

/* 修改浮动触发器样式以保持居中 */
.floating-trigger {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
}

.trigger-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #333333;
  padding: 8px 16px; /* 增加左右内边距 */
  min-width: 100px; /* 添加最小宽度 */
  height: 32px;
  justify-content: center; /* 内容居中 */
  border-radius: 0 0 16px 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.trigger-button:hover {
  background: #666666;
  padding-top: 10px;
  min-width: 120px; /* hover 时略微增加宽度 */
}

.code-icon {
  color: white;
}

.trigger-text {
  color: white;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 2px;
  margin-right: 8px;
}

/* 右侧导航链接样式 */
.nav-links {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 12px;
  border-left: 1px solid #e4e7ed;
  padding-left: 12px;
  height: 32px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0;
}

.header-icon-btn {
  padding: 4px 8px;
  height: 32px;
  border: none;
  background: transparent;
  color: #333333;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
  text-decoration: none;
  border-radius: 4px;
  font-size: 14px;
}

.header-icon-btn:hover {
  color: #000000;
  background-color: #f5f5f5;
}

.btn-text {
  font-size: 18px;
  font-weight: 400;
  color: #333333;
}

.header-icon-btn:hover .btn-text {
  color: #000000;
}

/* 用户区域样式 */
.user-section {
  display: flex;
  align-items: center;
  height: 32px;
}

.login-btn {
  height: 38px;
  padding: 0 16px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(45deg, #1f7fbb, #671ab9);
  border: none;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
    background: linear-gradient(45deg, #238cce, #7c26d8);
  }
  
  &:active {
    transform: translateY(0);
  }
}

.login-icon {
  margin-right: 6px;
  margin-top: -2px;
}

/* Clerk 样式调整 */
:deep(.cl-userButtonBox) {
  height: 32px;
}

:deep(.cl-userButtonTrigger) {
  padding: 0;
  border-radius: 4px;
  height: 32px;
  
  &:focus {
    outline: none !important;
    box-shadow: none !important;
  }
  &:focus-visible {
    outline: none !important;
    box-shadow: none !important;
  }
}

:deep(.cl-userButtonAvatarBox) {
  width: 32px;
  height: 32px;
  margin: 6px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .nav-links {
    margin-left: 8px;
    padding-left: 8px;
  }

  .btn-text {
    display: none;
  }

  .header-icon-btn {
    padding: 4px;
  }

  .quick-start-tip {
    padding: 6px;
  }
  
  .quick-start-tip:hover {
    padding-right: 24px;
  }

  .quick-start-tip span {
    display: none;
  }
}

.github-icon {
  font-size: 20px;
  width: 20px;
  height: 20px;
}

/* 新增样式 */
.logo-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.quick-start-tip {
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background-color: #f0f9ff;
  border-radius: 6px;
  color: #1890ff;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.3s ease;
}

.tip-content {
  display: flex;
  align-items: center;
  gap: 4px;
}

.close-btn {
  opacity: 0;
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #1890ff;
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.5px;
}

.quick-start-tip:hover {
  background-color: #e6f4ff;
  padding-right: 18px;  /* 为关闭按钮留出空间 */
}

.quick-start-tip:hover .close-btn {
  opacity: 1;
}

.quick-start-tip:hover .tip-content {
  padding-right: 18px;  /* 为关闭按钮留出空间 */
}

.close-btn:hover {
  background-color: #e6f4ff;
  color: #0076e4;
}

/* 修改加载进度样式 */
.loading-progress-container {
  position: absolute;
  left: calc(50% + 120px); /* 向右偏移，远离编辑代码按钮 */
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-progress-wrapper {
  background: #f5f7fa;
  padding: 6px 12px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.loading-progress-bar {
  width: 120px; /* 稍微缩小进度条宽度 */
  height: 3px;
  background: #e4e7ed;
  border-radius: 1.5px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #409eff, #67c23a);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 11px;
  color: #606266;
  margin-top: 1px;
  white-space: nowrap;
}

/* 调整响应式布局 */
@media (max-width: 1024px) {
  .loading-progress-container {
    left: calc(50% + 80px);
  }
  
  .loading-progress-wrapper {
    padding: 4px 8px;
  }
  
  .loading-progress-bar {
    width: 100px;
  }
  
  .progress-text {
    font-size: 10px;
  }
}
</style> 