<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const code = ref('')
const emit = defineEmits(['execute-code'])

function execute() {
  if (!code.value.trim()) {
    ElMessage.warning('请先输入代码')
    return
  }
  emit('execute-code', code.value)
}

function clearCode() {
  code.value = ''
}

// 示例代码模板
const codeTemplates = {
  basic: `// 基础移动示例
drone.takeoff()
await drone.forward(1)
await drone.turnRight(90)
await drone.land()`,
  square: `// 画正方形示例
drone.takeoff()
for (let i = 0; i < 4; i++) {
  await drone.forward(1)
  await drone.turnRight(90)
}
await drone.land()`
}

function loadTemplate(template) {
  code.value = codeTemplates[template]
}
</script>

<template>
  <div class="code-editor-container">
    <div class="toolbar">
      <el-button-group>
        <el-tooltip content="执行代码" placement="top">
          <el-button type="primary" @click="execute">
            <el-icon><VideoPlay /></el-icon>
            执行
          </el-button>
        </el-tooltip>
        <el-tooltip content="清空代码" placement="top">
          <el-button @click="clearCode">
            <el-icon><Delete /></el-icon>
            清空
          </el-button>
        </el-tooltip>
      </el-button-group>

      <el-dropdown @command="loadTemplate">
        <el-button type="primary" plain>
          加载示例
          <el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="basic">基础移动</el-dropdown-item>
            <el-dropdown-item command="square">画正方形</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <el-input
      v-model="code"
      type="textarea"
      :rows="12"
      :autosize="{ minRows: 10, maxRows: 20 }"
      placeholder="在此输入控制代码..."
      class="code-input"
      resize="none"
    />
  </div>
</template>

<style scoped>
.code-editor-container {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.toolbar {
  display: flex;
  gap: 16px;
  align-items: center;
}

.code-input {
  flex: 1;
}

:deep(.el-textarea__inner) {
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 14px;
  line-height: 1.6;
  padding: 12px;
  background-color: #f8f9fa;
}

:deep(.el-button) {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
</style> 