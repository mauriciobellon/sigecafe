import { defineStore } from "pinia";
import type { Aluno } from "@prisma/client";

export const useFilhosSelectorStore = defineStore("filhosSelector", {
  state: () => ({
    selectedChild: null as Aluno | null,
    filhos: [] as Aluno[],
    show: false,
  }),

  actions: {
    async fetchFilhos() {
      const usuarioStore = useUsuarioStore();
      if (usuarioStore.usuarioPreferences?.type === "RESPONSAVEL") {
        try {
          this.filhos = await $fetch<Aluno[]>("/api/filhos", {
            credentials: "include",
          });
          this.show = usuarioStore.usuarioPreferences?.type === "RESPONSAVEL";
        } catch (error) {
          console.error(error);
        }
      } else {
        this.filhos = [];
        this.selectedChild = null;
        this.show = false;
      }
    },

    setSelectedChild(filho: Aluno) {
      this.selectedChild = filho;
    },

    getIniciais(nome: string) {
      const palavras = nome.split(" ");
      const primeira = palavras[0][0];
      const ultima = palavras[palavras.length - 1][0];
      return (primeira + ultima).toUpperCase();
    },

    modificarEscola(escola: string) {
      if (escola.length > 26) {
        const palavras = escola.split(" ");
        const palavrasComprimidas = palavras.map((palavra) =>
          palavra
            .toLowerCase()
            .replace("escola", "esc.")
            .replace("municipal", "mun.")
            .replace("estadual", "est.")
        );
        return palavrasComprimidas
          .map((palavra) => palavra[0].toUpperCase() + palavra.slice(1))
          .join(" ")
          .slice(0, 26);
      }
      return escola;
    },
  }
});
