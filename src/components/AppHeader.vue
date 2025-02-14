<script setup>
import { ref } from 'vue'
import { ElTooltip, ElButton } from 'element-plus'
import { Document, Setting, User, EditPen } from '@element-plus/icons-vue'

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

// 添加处理函数
const handleDocClick = () => {
  // 文档功能待实现
  console.log('文档功能待实现')
}

const handleSettingClick = () => {
  // 设置功能待实现
  console.log('设置功能待实现')
}

const handleLoginClick = () => {
  // 登录功能待实现
  console.log('登录功能待实现')
}

// 更新 drawerVisible 的值
const updateDrawerVisible = (value) => {
  emit('update:drawerVisible', value)
}
</script>

<template>
  <header class="header">
    <!-- Logo 区域 -->
    <div class="logo-container">
      <img :src="logoHeader" alt="DronePilot Logo" class="header-logo">
    </div>

    <!-- 代码编辑器触发器 -->
    <div class="floating-trigger">
      <el-tooltip content="打开代码编辑器" placement="bottom" effect="dark">
        <div class="trigger-button" @click="updateDrawerVisible(true)">
          <el-icon class="code-icon"><EditPen /></el-icon>
          <span class="trigger-text">编辑代码</span>
        </div>
      </el-tooltip>
    </div>

    <!-- 右侧图标按钮组 (文档、设置、登录) -->
    <div class="header-right">
      <el-tooltip content="文档" placement="bottom" effect="dark">
        <el-button class="header-icon-btn" :icon="Document" @click="handleDocClick" />
      </el-tooltip>

      <el-tooltip content="设置" placement="bottom" effect="dark">
        <el-button class="header-icon-btn" :icon="Setting" @click="handleSettingClick" />
      </el-tooltip>

      <el-tooltip content="登录" placement="bottom" effect="dark">
        <el-button class="header-icon-btn" :icon="User" @click="handleLoginClick" />
      </el-tooltip>
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
  font-size: 20px;
  color: white;
}

.trigger-text {
  color: white;
  font-size: 14px;
  font-weight: 500;
}

/* 添加右侧按钮组样式 */
.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon-btn {
  padding: 8px;
  border: none;
  background: transparent;
  font-size: 20px;
  color: #606266;
  transition: all 0.3s ease;
}

.header-icon-btn:hover {
  color: #409EFF;
  background-color: #f0f2f5;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .header-icon-btn {
    padding: 4px;
    font-size: 18px;
  }

  .header-right {
    gap: 4px;
  }
}
</style> 