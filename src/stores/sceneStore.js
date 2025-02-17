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
        savedScene.data.id = Date.now();
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