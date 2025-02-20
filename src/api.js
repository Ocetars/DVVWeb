import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://dpw-backend.ocetars.top/api', 
  // baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 添加请求拦截器
apiClient.interceptors.request.use(async (config) => {
  try {
    // 检查 Clerk 是否已初始化
    if (window.Clerk?.session) {
      const token = await window.Clerk.session.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (error) {
    console.warn('Failed to get Clerk token:', error);
  }
  return config;
});

// 获取所有场景（根据用户过滤）
export const getScenes = async (userId) => {
  try {
    const response = await apiClient.get(`/scenes?userId=${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching scenes:', error);
    throw error;
  }
};

// 保存场景
export const saveScene = async (sceneData) => {
  try {
    const response = await apiClient.post('/scenes', sceneData);
    return response.data;
  } catch (error) {
    console.error('Error saving scene:', error);
    throw error;
  }
};

// 删除场景
export const deleteScene = async (sceneId) => {
  try {
    const response = await apiClient.delete(`/scenes/${sceneId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting scene:', error);
    throw error;
  }
};

// 健康检查接口
export const checkHealth = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
}; 