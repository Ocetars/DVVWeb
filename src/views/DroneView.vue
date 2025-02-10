<script setup>
import { ref } from 'vue'
import ThreeScene from '@/components/ThreeScene.vue'
import GroundControls from '@/components/GroundControls.vue'
import CodeEditor from '@/components/CodeEditor.vue'

const groundWidth = ref(2)
const groundDepth = ref(2)
const threeScene = ref(null)

function onUploadImage(file) {
  if(file){
    threeScene.value.handleImageUpload(file)
  }
}

function onUpdateGround() {
  threeScene.value.updateGroundGeometry()
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
</script>

<template>
  <div class="drone-view">
    <div class="main-content">
      <!-- ThreeScene 接收地面尺寸作为 props，并通过 ref 暴露内部方法 -->
      <ThreeScene 
        :groundWidth="groundWidth" 
        :groundDepth="groundDepth" 
        ref="threeScene"
        @update-ground-dimensions="updateGroundDimensions"
      />
      <!-- GroundControls 通过 v-model 与父组件进行双向绑定，并通过事件回传文件和更新操作 -->
      <GroundControls 
        v-model:groundWidth="groundWidth" 
        v-model:groundDepth="groundDepth"
        @upload-image="onUploadImage" 
        @update-ground="onUpdateGround" 
      />
    </div>
    <div class="code-editor-container">
      <!-- CodeEditor 执行代码时，通知 DroneView，再调用 ThreeScene 内部方法 -->
      <CodeEditor @execute-code="onExecuteCode" />
    </div>
    <!-- 修改：按钮文字和点击事件 -->
    <button @click="enterCustomPositionMode">
        自定义无人机位置
    </button>
  </div>
</template>

<style scoped>
.drone-view {
  display: flex;
  gap: 20px;
  padding: 20px;
}
.main-content {
  width: 70vw;
}
.code-editor-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style> 