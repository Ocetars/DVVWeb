<!-- GroundControls 的工作只是收集用户的输入，然后通过事件传递给父组件或 ThreeScene，让 ThreeScene 根据最新的参数更新场景。 -->
<script setup>
import { ref, watch } from 'vue'
import { ElUpload, ElInput, ElButton, ElIcon, ElDivider, ElPopover } from 'element-plus'
import { Upload, Refresh, Pointer } from '@element-plus/icons-vue'

const props = defineProps({
  groundWidth: {
    type: Number,
    default: 2
  },
  groundDepth: {
    type: Number,
    default: 2
  },
  isCustomPositionMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:groundWidth', 'update:groundDepth', 'upload-image', 'update-ground', 'custom-position', 'update:isCustomPositionMode'])

const localGroundWidth = ref(props.groundWidth)
const localGroundDepth = ref(props.groundDepth)
const isPositioning = ref(false)

// 添加预设地面纹理数据
const presetGrounds = [
  { name: '草地', image: '/textures/grass.jpg' },
  { name: '水泥', image: '/textures/concrete.jpg' },
  { name: '木地板', image: '/textures/wood.jpg' },
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

// 添加选择预设地面的方法
function selectPresetGround(imageUrl) {
  // 创建一个 fetch 请求来获取图片
  fetch(imageUrl)
    .then(response => response.blob())
    .then(blob => {
      // 创建一个 File 对象
      const file = new File([blob], imageUrl.split('/').pop(), { type: 'image/*' })
      emit('upload-image', file)
    })
}
</script>

<template>
  <div class="ground-controls">
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
          <el-button type="primary" :icon="Upload">
            上传地面纹理
          </el-button>
        </el-upload>
      </template>
      
      <div class="preset-grounds-container">
        <div class="preset-grounds-title">预设地面</div>
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
      <div class="input-group">
        <span class="label">宽度</span>
        <el-input
          v-model.number="localGroundWidth"
          type="number"
          :step="0.1"
          @change="updateWidth"
          :min="0.1"
          class="dimension-input"
        >
          <template #suffix>m</template>
        </el-input>
      </div>

      <div class="input-group">
        <span class="label">深度</span>
        <el-input
          v-model.number="localGroundDepth"
          type="number"
          :step="0.1"
          @change="updateDepth"
          :min="0.1"
          class="dimension-input"
        >
          <template #suffix>m</template>
        </el-input>
      </div>
    </div>

    <el-divider direction="vertical" />

    <el-button 
      type="primary" 
      round
      :icon="Pointer"
      @click="handleCustomPosition"
      class="position-btn"
      :class="{ 'positioning': isPositioning }"
    >
      {{ isPositioning ? '请点击地面' : '摆放无人机' }}
    </el-button>
  </div>
</template>

<style scoped>
.ground-controls {
  display: flex;
  gap: 15px;
  align-items: center;
  padding: 10px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.dimension-controls {
  display: flex;
  gap: 15px;
  align-items: center;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.label {
  font-size: 15px;
  color: #606266;
  white-space: nowrap;
}

.dimension-input {
  width: 100px;
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
  padding: 5px;
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
  grid-template-columns: repeat(3, 1fr);  /* 改为3列 */
  gap: 10px;
}

.preset-ground-item {
  cursor: pointer;
  text-align: center;
}

.preset-ground-item img {
  width: 70px;
  height: 70px;
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
</style> 