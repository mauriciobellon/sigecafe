import { defineStore } from 'pinia'
import type { Cooperativa } from '@prisma/client'

export const useCooperativaStore = defineStore({
  id: 'Cooperativa',
  state: () => ({
    cooperativa: null as Cooperativa | null
  }),
  actions: {
    async fetchCooperativa() {
      const data = await $fetch<Cooperativa>('/api/cooperativa', {
        credentials: 'include'
      })

      this.cooperativa = data || null
    },
    async updateCooperativa(cooperativa: Cooperativa) {
      await $fetch<Cooperativa>('/api/cooperativa', {
        method: 'PUT',
        body: cooperativa,
        credentials: 'include'
      })
    }
  }
})