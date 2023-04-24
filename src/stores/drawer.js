import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useDrawerStore = defineStore('drawer', () => {
  const drawer = ref(false)

  const updateDrawer = (isOpen) => {
    drawer.value = isOpen
  }

  return { drawer, updateDrawer }
})
