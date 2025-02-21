<!-- GroundControls 的工作只是收集用户的输入，然后通过事件传递给父组件或 ThreeScene，让 ThreeScene 根据最新的参数更新场景。 -->
<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { ElUpload, ElInput, ElButton,ElDivider, ElPopover} from 'element-plus'
import GSymbol from './GSymbol.vue'
import NetworkStatus from './NetworkStatus.vue'

const props = defineProps({
  groundWidth: {
    type: Number,
    default: 4
  },
  groundDepth: {
    type: Number,
    default: 4
  },
  isCustomPositionMode: {
    type: Boolean,
    default: false
  },
  timerRunning: {
    type: Boolean,
    default: false
  },
  elapsedTime: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits([
  'update:groundWidth', 
  'update:groundDepth', 
  'upload-image', 
  'update-ground', 
  'custom-position', 
  'update:isCustomPositionMode',
  'execute-code',
  'stop-code'  // 添加新的事件
])

const localGroundWidth = ref(props.groundWidth)
const localGroundDepth = ref(props.groundDepth)
const isPositioning = ref(false)

// 添加预设地面纹理数据
const presetGrounds = [
  { name: '比赛场地', image: '/textures/比赛场地.png' },
  { name: '无人机', image: '/textures/uavroom.jpg' },
]

watch(() => props.groundWidth, (newVal) => {
  localGroundWidth.value = newVal
})
watch(() => props.groundDepth, (newVal) => {
  localGroundDepth.value = newVal
})
watch(() => props.isCustomPositionMode, (newVal) => {
  isPositioning.value = newVal
})

function updateWidth() {
  emit('update:groundWidth', Number(localGroundWidth.value))
}

function updateDepth() {
  emit('update:groundDepth', Number(localGroundDepth.value))
}

function handleUpload(file) {
  emit('upload-image', file.raw)
  return false // 阻止自动上传
}

function handleCustomPosition() {
  emit('custom-position')
}

// 修改选择预设地面的方法
function selectPresetGround(imageUrl) {
  fetch(imageUrl)
    .then(response => response.blob())
    .then(blob => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Data = e.target.result;
        emit('upload-image', base64Data);
      };
      reader.readAsDataURL(blob);
    });
}

// 修改执行代码的方法
function handleExecuteCode() {
  if (props.timerRunning) {
    emit('stop-code')
    window.startTime = null
  } else {
    emit('execute-code')
  }
}

// 格式化时间函数
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

</script>

<template>
  <div class="ground-controls">
    <NetworkStatus />
    <el-divider direction="vertical" />

    <el-popover
      placement="top"
      :width="300"
      trigger="hover"
      popper-class="ground-presets-popover"
    >
      <template #reference>
        <el-upload
          class="upload-area"
          :auto-upload="false"
          :show-file-list="false"
          accept="image/*"
          :on-change="handleUpload"
        >
          <el-button type="primary" class="control-btn">
            <GSymbol family="rounded" size="20" weight="400">add_photo_alternate</GSymbol>
            <span class="label_black">&nbsp;上传地面纹理</span>
          </el-button>
        </el-upload>
      </template>
      
      <div class="preset-grounds-container">
        <div class="preset-grounds-title">预设地面纹理</div>
        <div class="preset-grounds">
          <div 
            v-for="ground in presetGrounds" 
            :key="ground.name"
            class="preset-ground-item"
            @click="selectPresetGround(ground.image)"
          >
            <img :src="ground.image" :alt="ground.name">
            <span>{{ ground.name }}</span>
          </div>
        </div>
      </div>
    </el-popover>

    <el-divider direction="vertical" />

    <div class="dimension-controls">
      <span class="label">地面尺寸：</span>
      <el-input
        v-model.number="localGroundWidth"
        type="number"
        :step="1"
        @change="updateWidth"
        :min="1"
        class="dimension-input"
      >
        <template #suffix>m</template>
      </el-input>
      <span class="multiply-symbol">×</span>
      <el-input
        v-model.number="localGroundDepth"
        type="number"
        :step="1"
        @change="updateDepth"
        :min="1"
        class="dimension-input"
      >
        <template #suffix>m</template>
      </el-input>
    </div>

    <el-divider direction="vertical" />

    <el-button
      type="primary" 
      class="position-btn control-btn"
      :class="{ 'positioning': isPositioning }"
      @click="handleCustomPosition"
    >
      <GSymbol family="rounded" size="20" weight="400">location_on</GSymbol>
      <span class="label_black">&nbsp;{{ isPositioning ? '请点击地面' : '摆放无人机' }}</span>
    </el-button>

    <el-divider direction="vertical" />

    <el-button 
      :type="timerRunning ? 'warning' : 'success'"
      round
      class="execute-btn control-btn"
      :class="{ 'running': timerRunning }"
      @click="handleExecuteCode"
      size="large"
    >
      <GSymbol 
        family="rounded" 
        size="24" 
        weight="400"
        :fill="timerRunning"
      >{{ timerRunning ? 'stop_circle' : 'play_circle' }}</GSymbol>
      <div v-if="!timerRunning">
        &nbsp;&nbsp;开始模拟
      </div>
      <div v-else class="timer">
        &nbsp;{{ formatTime(elapsedTime) }}
      </div>
    </el-button>
  </div>
</template>

<style scoped>
.ground-controls {
  display: flex;
  gap: 15px;
  align-items: center;
  padding: 10px;
  /* background-color: #e6e6e6;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); */
}

.dimension-controls {
  height: 32px;
  display: flex;
  align-items: center;
  gap: 8px;
  /* background-color: #7575751a; */
  padding: 4px 12px;
  border-radius: 6px;
}

.multiply-symbol {
  color: #606266;
  font-size: 16px;
  font-weight: 500;
  margin: 0 2px;
}

.label {
  font-size: 16px;
  color: #606266;
  white-space: nowrap;
  font-weight: 500;
  margin-bottom: 2px;
}

.label_black {
  font-size: 15px;
  color: #ffffff;
  white-space: nowrap;
  font-weight: 500;
}

.dimension-input {
  width: 80px;
}

.dimension-input :deep(.el-input__wrapper) {
  background-color: white;
}

.position-btn {
  white-space: nowrap;
}

:deep(.el-input-number) {
  width: 120px;
}

:deep(.el-input__wrapper) {
  padding: 0 8px;
}

:deep(.el-input__inner) {
  text-align: center;
}

:deep(.el-divider--vertical) {
  height: 20px;
  margin: 0 5px;
}

:deep(.el-button--primary) {
  background-color: #454545;
  border-color: #454545;
}

:deep(.el-button--primary:hover) {
  background-color: #666666;
  border-color: #666666;
}

.position-btn.positioning {
  background-color: #e6a23c;
  border-color: #e6a23c;
  animation: pulse 2s infinite;
}

.position-btn.positioning:hover {
  background-color: #f0b959;
  border-color: #f0b959;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(230, 162, 60, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(230, 162, 60, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(230, 162, 60, 0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ground-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }

  :deep(.el-divider--vertical) {
    display: none;
  }

  .position-btn {
    width: 100%;
  }

  .execute-btn {
    width: 100%;
    height: 44px; /* 在移动端稍微增加高度 */
  }
}

@media (max-width: 480px) {
  .ground-controls {
    padding: 8px;
  }

  .dimension-controls {
    gap: 10px;
  }

  .input-group {
    flex: 1;
    min-width: 120px;
  }
}

.preset-grounds-container {
  padding: 0px;
}

.preset-grounds-title {
  font-size: 14px;
  color: #303133;
  margin-bottom: 12px;
  text-align: center;
  font-weight: 500;
}

.preset-grounds {
  display: grid;
  grid-template-columns: repeat(2, 1fr); 
  /* gap: 5px; */
}

.preset-ground-item {
  cursor: pointer;
  text-align: center;
}

.preset-ground-item img {
  width: 90px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 4px;
  transition: transform 0.2s ease;
}

.preset-ground-item:hover img {
  transform: scale(1.1);
}

.preset-ground-item span {
  display: block;
  font-size: 12px;
  color: #606266;
}

:deep(.ground-presets-popover) {
  padding: 12px;
}

.control-btn {
  height: 38px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  padding: 0 16px;
}

.control-btn :deep(.material-symbols) {
  margin-top: -2px;
  font-size: 20px;
}

.execute-btn {
  min-width: 120px;
  height: 40px;
  font-size: 15px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
}

.execute-btn :deep(.material-symbols) {
  font-size: 24px;
}

.execute-btn:not(.running) {
  background-color: #2b7d4d;
  border-color: #2b7d4d;
}

.execute-btn:not(.running):hover {
  background-color: #3a9463;
  border-color: #3a9463;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(43, 125, 77, 0.3);
}

.execute-btn.running {
  background-color: #e6a23c;
  border-color: #e6a23c;
  min-width: 140px;
  animation: gentle-pulse 2s infinite;
}

.execute-btn.running:hover {
  background-color: #cf9236;
  border-color: #cf9236;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(230, 162, 60, 0.3);
}

.timer {
  font-size: 18px;
  font-family: 'Roboto Mono', monospace;
  font-weight: 600;
  margin-bottom: 2px;
}

@keyframes gentle-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(230, 162, 60, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(230, 162, 60, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(230, 162, 60, 0);
  }
}

/* 修改图标过渡效果 */
:deep(.el-icon) {
  display: none;
}

/* 添加运行状态下的图标特效 */
.execute-btn.running :deep(.el-icon) {
  color: #fff;
  animation: icon-attention 2s infinite;
  filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.5));
}

@keyframes icon-attention {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1.3;
  }
}

/* 修改运行状态下的悬浮效果 */
.execute-btn.running:hover :deep(.el-icon) {
  animation: icon-attention-hover 2s infinite;
}

@keyframes icon-attention-hover {
  0% {
    transform: scale(1.1);
    opacity: 1;
  }
  50% {
    transform: scale(1.4);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.1);
    opacity: 1.3;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .control-btn {
    gap: 8px;
    padding: 0 12px;
  }
  
  .execute-btn {
    gap: 10px;
    padding: 0 16px;
  }
}
</style> 