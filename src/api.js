import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://drone-pilot-backend.vercel.app/api', // 根据你的后端API地址配置
  headers: {
    'Content-Type': 'application/json',
  },
});

// 添加请求拦截器
apiClient.interceptors.request.use(async (config) => {
  // 从 Clerk 获取 token
  const token = await window.Clerk.session?.getToken();
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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