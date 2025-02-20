<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ElPopover } from 'element-plus'
import GSymbol from './GSymbol.vue'
import { checkHealth } from '../api'

const networkStatus = ref('checking')
const lastCheckTime = ref(null)

// 添加健康检查函数
async function checkNetworkStatus() {
  try {
    const response = await checkHealth()
    networkStatus.value = response.status || 'error'
    lastCheckTime.value = response.timestamp
  } catch (error) {
    console.error('Health check failed:', error)
    networkStatus.value = 'error'
  }
}

// 设置定期检查
let healthCheckInterval
onMounted(() => {
  // 立即进行第一次检查
  checkNetworkStatus()
  // 每5秒检查一次
  healthCheckInterval = setInterval(checkNetworkStatus, 5000)
})

onUnmounted(() => {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval)
  }
})
</script>

<template>
  <div class="network-status" :class="networkStatus">
    <el-popover
      placement="top"
      trigger="hover"
      :width="200"
    >
      <template #reference>
        <div class="status-indicator">
          <GSymbol 
            family="rounded" 
            size="20" 
            weight="400"
          >{{ 
            networkStatus === 'checking' ? 'sync' : 
            networkStatus === 'ok' ? 'cloud_done' : 
            'cloud_off' 
          }}</GSymbol>
          <span class="status-text">{{ 
            networkStatus === 'checking' ? '正在检查网络...' :
            networkStatus === 'ok' ? '后端服务连接正常' : 
            '后端服务无法连接，请检查您的国际网络环境' 
          }}</span>
        </div>
      </template>
      <div class="status-details">
        <p>后端服务状态: {{ 
          networkStatus === 'checking' ? '检查中' :
          networkStatus === 'ok' ? '正常' : 
          '异常' 
        }}</p>
        <p v-if="lastCheckTime">最后{{ networkStatus === 'ok' ? '检查' : '连接' }}: {{ new Date(lastCheckTime).toLocaleTimeString() }}</p>
      </div>
    </el-popover>
  </div>
</template>

<style scoped>
.network-status {
  display: flex;
  align-items: center;
  padding: 0 12px;
  height: 32px;
  border-radius: 6px;
  transition: all 0.3s ease;
  min-width: fit-content;
}

.network-status.ok {
  color: #67C23A;
}

.network-status.error {
  color: #F56C6C;
}

.network-status.checking {
  color: #909399;
}

.network-status.checking :deep(.material-symbols) {
  animation: spin 2s infinite linear;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  white-space: nowrap;
}

.status-text {
  font-size: 14px;
  font-weight: 500;
  min-width: max-content;
}

.status-details {
  font-size: 14px;
  width: 100%;
}

.status-details p {
  margin: 8px 0;
  color: #606266;
  word-break: break-all;
  white-space: normal;
  line-height: 1.4;
}

/* 添加响应式布局支持 */
@media (max-width: 768px) {
  .network-status {
    width: 100%;
    justify-content: flex-start;
  }
  
  .status-indicator {
    width: 100%;
    justify-content: flex-start;
  }
}
</style> 