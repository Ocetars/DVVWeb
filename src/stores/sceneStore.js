import { defineStore } from 'pinia'
import { useAuthStore } from './authStore' // 引入 authStore
import { getScenes, saveScene, deleteScene } from '../api';

export const useSceneStore = defineStore('scene', {
  state: () => ({
    scenes: []
  }),
  actions: {
    async addScene(scene) {
      const authStore = useAuthStore();
      if (!authStore.isLoggedIn) {
        console.warn('User not logged in. Cannot save scene.');
        return;
      }

      // 确保 texture 已经是 base64 格式
      const sceneData = {
        ...scene,
        userId: authStore.user.id,
        texture: scene.texture // 此时 texture 应该已经是 base64 格式
      };

      try {
        const savedScene = await saveScene(sceneData);
        // savedScene.data.id = Date.now(); // 不需要手动设置id，数据库会自动生成_id
        this.scenes.push(savedScene.data);
        ElMessage.success({
          message: '场景保存成功',
          offset: 100
        });
      } catch (error) {
        console.error('Error saving scene:', error);
        ElMessage.error({
          message: '保存场景失败，请检查网络环境与图片格式',
          offset: 100
        });
      }
    },
    async removeScene(sceneId) {
      const authStore = useAuthStore();
      if (!authStore.isLoggedIn) {
        console.warn('User not logged in. Cannot remove scene.');
        return;
      }

      try {
        await deleteScene(sceneId);
        this.scenes = this.scenes.filter(scene => scene._id !== sceneId);
      } catch (error) {
        console.error('Error removing scene:', error);
        throw error; // 抛出错误以便上层组件处理
      }
    },
    async fetchScenes() {
      const authStore = useAuthStore();
      if (!authStore.isLoggedIn) {
        console.warn('用户未登录，无法获取场景数据。');
        this.scenes = []; // 用户未登录时清空场景列表
        return;
      }

      try {
        // console.log('userID:', authStore.user.id);
        const scenesResponse = await getScenes(authStore.user.id);
        // 添加数据格式检查，确保返回值符合预期格式
        if (!scenesResponse || !scenesResponse.data || !Array.isArray(scenesResponse.data)) {
          console.warn('数据库返回的数据格式错误:', scenesResponse);
          this.scenes = [];
          ElMessage.error('场景数据格式错误，请检查数据库接口');
          throw new Error('数据格式错误');
        }
        // 按照创建时间降序排序：最新的场景排在最前面
        this.scenes = scenesResponse.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        console.log('Scenes fetched:', this.scenes);
        ElMessage.success({
          message: '场景已同步',
          offset: 100
        })
      } catch (error) {
        console.error('Error fetching scenes:', error);
        this.scenes = []; // 获取失败时也清空
        // ElMessage.error('同步场景列表失败，请检查网络环境');
        throw error; // 确保错误被抛出
      }
    }
  }
})