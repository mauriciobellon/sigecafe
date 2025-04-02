import { defineStore } from "pinia";
import { ref } from "vue";
import type { Aluno } from "@prisma/client";

export const useMyAlunoStoreStore = defineStore("myAlunoStoreStore", () => {
  const alunos = ref<Aluno[] | null>(null);

  async function getAlunos() {
    const alunosData = await $fetch<Aluno[]>("/api/aluno", {
      credentials: "include",
    });
    alunos.value = alunosData;
  }

  return { alunos, getAlunos };
});
