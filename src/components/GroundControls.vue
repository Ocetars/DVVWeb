<!-- GroundControls 的工作只是收集用户的输入，然后通过事件传递给父组件或 ThreeScene，让 ThreeScene 根据最新的参数更新场景。 -->
<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  groundWidth: {
    type: Number,
    default: 2
  },
  groundDepth: {
    type: Number,
    default: 2
  }
})

const emit = defineEmits(['update:groundWidth', 'update:groundDepth', 'upload-image', 'update-ground'])

const localGroundWidth = ref(props.groundWidth)
const localGroundDepth = ref(props.groundDepth)

watch(() => props.groundWidth, (newVal) => {
  localGroundWidth.value = newVal
})
watch(() => props.groundDepth, (newVal) => {
  localGroundDepth.value = newVal
})

function updateWidth() {
  emit('update:groundWidth', Number(localGroundWidth.value))
}
function updateDepth() {
  emit('update:groundDepth', Number(localGroundDepth.value))
}

function onFileChange(event) {
  const file = event.target.files[0]
  if (file) {
    emit('upload-image', file)
  }
}

function updateGround() {
  emit('update-ground')
}
</script>

<template>
  <div class="ground-controls">
    <label>
      上传地面纹理：
      <input type="file" @change="onFileChange" accept="image/*" />
    </label>
    <label>
      地面宽度：
      <input type="number" v-model.number="localGroundWidth" @change="updateWidth" step="0.1" style="width: 60px;" />
    </label>
    <label>
      地面深度：
      <input type="number" v-model.number="localGroundDepth" @change="updateDepth" step="0.1" style="width: 60px;" />
    </label>
    <button @click="updateGround">更新地面</button>
  </div>
</template>

<style scoped>
.ground-controls {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}
.ground-controls label {
  display: flex;

  align-items: center;
  gap: 5px;
}
</style> 