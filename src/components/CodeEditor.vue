<script setup>
import { ref } from 'vue'

const code = ref('')

const emit = defineEmits(['execute-code'])

function execute() {
  emit('execute-code', code.value)
}
</script>

<template>
  <div class="code-editor-wrapper">
    <textarea v-model="code" class="code-editor" placeholder="在此输入控制代码..."></textarea>
    <button @click="execute" class="execute-button">执行代码</button>
  </div>
</template>

<style scoped>
.code-editor-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.code-editor {
  width: 100%;
  height: calc(30vh - 50px);
  padding: 10px;
  font-family: monospace;
  font-size: 14px;
  border: 2px solid #4eaed0;
  border-radius: 4px;
  resize: none;
}
.execute-button {
  padding: 10px 20px;
  background-color: #4eaed0;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}
.execute-button:hover {
  background-color: #3d8ca6;
}
</style> 