import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoggedIn: false,
    user: null,
  }),
  actions: {
    setUser(userData) {
      if (userData) {
        this.isLoggedIn = true
        this.user = userData
      } else {
        this.isLoggedIn = false
        this.user = null
      }
    },
    clearUser() {
      this.isLoggedIn = false
      this.user = null
    }
  }
}) 