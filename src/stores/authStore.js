import { defineStore } from 'pinia'
import { useUser } from '@clerk/vue'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoggedIn: false,
    user: null,
  }),
  actions: {
    setUser() {
      const { isLoaded, isSignedIn, user } = useUser();
      if (isLoaded && isSignedIn) {
        this.isLoggedIn = true;
        this.user = user;
      } else {
        this.isLoggedIn = false;
        this.user = null;
      }
    },
    clearUser() {
      this.isLoggedIn = false;
      this.user = null;
    }
  }
}) 