import { defineStore } from 'pinia'

export const useSceneStore = defineStore('scene', {
  state: () => ({
    scenes: []
  }),
  actions: {
    addScene(scene) {
      // 使用当前时间戳作为 id 保证唯一
      scene.id = Date.now()
      this.scenes.push(scene)
    },
    removeScene(sceneId) {
      this.scenes = this.scenes.filter(scene => scene.id !== sceneId)
    }
  }
})