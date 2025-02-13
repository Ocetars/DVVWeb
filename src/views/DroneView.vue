<script setup>
import { ref } from 'vue'
import { ElDrawer, ElTooltip, ElContainer, ElHeader, ElMain, ElFooter } from 'element-plus'
import ThreeScene from '@/components/ThreeScene.vue'
import GroundControls from '@/components/GroundControls.vue'
import CodeEditor from '@/components/CodeEditor.vue'

const groundWidth = ref(2)
const groundDepth = ref(2)
const threeScene = ref(null)
const cvOutputContainer = ref(null)

// 添加抽屉控制变量
const drawerVisible = ref(false)

function onUploadImage(file) {
  if(file){
    threeScene.value.handleImageUpload(file)
  }
}

function onExecuteCode(code) {
  threeScene.value.executeUserCode(code)
}

// 当 ThreeScene 组件内部因图片更新而需要调整地面宽度时，会通过事件通知父组件
const updateGroundDimensions = (payload) => {
  groundWidth.value = payload.groundWidth
}

// 修改：直接调用 ThreeScene 的 enterCustomPositionMode 方法
function enterCustomPositionMode() {
    if (threeScene.value) {
        threeScene.value.enterCustomPositionMode();
    }
}

function handleCVOutput(canvas) {
  const containerDom = cvOutputContainer.value
  if (!containerDom) return
  
  while (containerDom.firstChild) {
    containerDom.removeChild(containerDom.firstChild)
  }
  containerDom.appendChild(canvas)
}
</script>

<template>
  <el-container class="layout-container">
    <el-header height="48px" class="header">
      <div class="floating-trigger">
        <el-tooltip
          content="打开代码编辑器"
          placement="bottom"
          effect="dark"
        >
          <div class="trigger-button" @click="drawerVisible = true">
            <el-icon class="code-icon"><EditPen /></el-icon>
          </div>
        </el-tooltip>
      </div>
    </el-header>

    <el-main class="main-area">
      <div class="scene-container-wrapper">
        <ThreeScene 
          :groundWidth="groundWidth" 
          :groundDepth="groundDepth" 
          ref="threeScene"
          @update-ground-dimensions="updateGroundDimensions"
          @cv-output="handleCVOutput"
        />
        <div ref="cvOutputContainer" class="floating-camera"></div>
      </div>
    </el-main>

    <el-footer height="auto" class="footer">
      <div class="footer-content">
        <GroundControls 
          v-model:groundWidth="groundWidth" 
          v-model:groundDepth="groundDepth"
          @upload-image="onUploadImage" 
          @custom-position="enterCustomPositionMode"
        />
      </div>
    </el-footer>

    <!-- 代码编辑器抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      title="代码编辑器"
      size="80%"
      direction="ttb"
    >
      <CodeEditor @execute-code="onExecuteCode" />
    </el-drawer>
  </el-container>
</template>

<style scoped>
.layout-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
  position: relative;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-area {
  flex: 1;
  padding: 20px;
  overflow: hidden;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.footer {
  background-color: #fff;
  padding: 20px;
  border-top: 1px solid #dcdfe6;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.footer-content {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
}

.floating-trigger {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}

.trigger-button {
  display: flex;
  align-items: center;
  background: #333333;
  padding: 8px 16px;
  border-radius: 0 0 16px 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.trigger-button:hover {
  background: #666666;
  padding-top: 12px;
}

.code-icon {
  font-size: 20px;
  color: white;
}

.controls-container {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  margin-bottom: 20px;
}

.control-buttons {
  display: flex;
  gap: 10px;
  align-items: center;
}

/* 抽屉样式 */
:deep(.el-drawer) {
  background: #1e1e1e;
}

:deep(.el-drawer__header) {
  margin-bottom: 0;
  padding: 16px 70px;
  background: #333333;
  color: white;
  font-weight: 600;
  text-align: center;
}

:deep(.el-drawer__close-btn) {
  color: white;
}

/* 添加浮动摄像头样式 */
.floating-camera {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
  width: 20vw;
  height: auto;
  aspect-ratio: 1;
  min-width: 160px;
  max-width: 240px;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
  background-color: rgba(0, 0, 0, 0.7);
  border: 2px solid #e4e7ed;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 响应式样式统一管理 */
@media (max-width: 1200px) {
  .scene-container-wrapper {
    width: 80vw;
  }
}

@media (max-width: 768px) {
  .scene-container-wrapper {
    width: 90vw;
    height: 50vh;
  }
  
  .floating-camera {
    width: 30vw;
    min-width: 120px;
  }
  
  .footer-content {
    max-width: 100%;
    padding: 0 10px;
  }
}

@media (max-width: 480px) {
  .scene-container-wrapper {
    width: 95vw;
    height: 45vh;
  }
  
  .floating-camera {
    width: 40vw;
    min-width: 100px;
  }
  
  .main-area {
    padding: 10px;
  }
}

.scene-container-wrapper {
  position: relative;
  width: 90vw;
  height: 80vh;
  min-height: 400px;
}
</style> 