import { defineStore } from 'pinia'

export const useGlobalStore = defineStore('global', {
  state: () => ({
    lighter: 0
  })
})
