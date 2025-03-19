import { defineStore } from 'pinia'
import type { Escola } from '@prisma/client'
export const useEscolaStore = defineStore({
  id: 'Escola',
  state: () => ({
    escola: null as Escola | null
  }),
  actions: {
    async fetchEscola() {
      const data = await $fetch<Escola>('/api/escola', {
        credentials: 'include'
      })

      this.escola = data || null
    },
    async updateEscola(escola: Escola) {
      await $fetch<Escola>('/api/escola', {
        method: 'PUT',
        body: escola,
        credentials: 'include'
      })
    }
  }
})