<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { ElMessage, ElButton, ElTooltip, ElButtonGroup, ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus'
import { VideoPlay, Delete, ArrowDown } from '@element-plus/icons-vue'
import * as monaco from 'monaco-editor'
import { editor as monacoEditor } from 'monaco-editor'
import loader from '@monaco-editor/loader'

const emit = defineEmits(['execute-code'])

const editorContainer = ref(null)
let codeEditor = null
const code = ref('')

// 从文件加载示例代码
async function loadExampleFromFile(filename) {
  try {
    const response = await fetch(`/userInput/${filename}`)
    if (!response.ok) {
      throw new Error('Failed to load example')
    }
    const content = await response.text()
    if (codeEditor) {
      codeEditor.setValue(content)
      code.value = content
    }
  } catch (error) {
    ElMessage.error('加载示例代码失败')
    console.error('Error loading example:', error)
  }
}

// 示例代码配置
const examples = [
  { label: '画正方形', value: 'square.js' },
  { label: '寻找红点右', value: 'REDorRight.js' },
  { label: '追踪红点', value: 'squareRED.js' }
]

async function loadTemplate(template) {
  await loadExampleFromFile(template)
}

function execute() {
  if (!code.value.trim()) {
    ElMessage.warning('请先输入代码')
    return
  }
  emit('execute-code', code.value)
}

function clearCode() {
  if (codeEditor) {
    codeEditor.setValue('')
    code.value = ''
  }
}

onMounted(() => {
  loader.init().then((monaco) => {
    codeEditor = monaco.editor.create(editorContainer.value, {
      value: code.value,
      language: 'javascript',
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: {
        enabled: false,
      },
      fontSize: 18,
      fontFamily: 'Fira Code, monospace',
      lineHeight: 24,
    })

    codeEditor.onDidChangeModelContent(() => {
      code.value = codeEditor.getValue()
    })
  })
})

onBeforeUnmount(() => {
  if (codeEditor) {
    codeEditor.dispose()
    codeEditor = null
  }
})

watch(code, (newValue) => {
  if (codeEditor && codeEditor.getValue() !== newValue) {
    codeEditor.setValue(newValue)
  }
})
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
            <el-dropdown-item 
              v-for="example in examples" 
              :key="example.value"
              :command="example.value"
            >
              {{ example.label }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <div ref="editorContainer" class="editor-container"></div>
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

.editor-container {
  flex: 1;
  border: 2px solid #4eaed0;
  border-radius: 4px;
}

:deep(.el-button) {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
</style> 