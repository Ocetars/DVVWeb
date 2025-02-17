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

      // 添加 userId 字段
      scene.userId = authStore.user.id;

      try {
        const savedScene = await saveScene(scene);
        // 使用当前时间戳作为 id 保证唯一
        savedScene.data.id = Date.now()
        this.scenes.push(savedScene.data);
      } catch (error) {
        console.error('Error saving scene:', error);
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
        console.warn('User not logged in. Cannot fetch scenes.');
        this.scenes = []; // 用户未登录时清空场景列表
        return;
      }

      try {
        const scenesData = await getScenes(authStore.user.id);
        this.scenes = scenesData.data;
      } catch (error) {
        console.error('Error fetching scenes:', error);
        this.scenes = []; // 获取失败时也清空
      }
    }
  }
})