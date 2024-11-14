import { defineStore } from "pinia";
import type { Aluno } from "@prisma/client";

export const useMyAlunoStoreStore = defineStore({
  id: "myAlunoStoreStore",
  state: () => ({
    alunos: null as Aluno[] | null,
  }),
  actions: {
    async getAlunos() {
      const alunos = await $fetch<Aluno[]>("/api/aluno", {
        credentials: "include",
      });
      this.alunos = alunos;
    },
  },
});
