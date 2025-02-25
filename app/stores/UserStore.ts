import { defineStore } from "pinia";

interface UsuarioPreferences {
  name: string;
  email: string;
  celular?: string;
  type: string;
}

export const useUsuarioStore = defineStore("usuario", {
  state: () => ({
    usuarioPreferences: null as UsuarioPreferences | null,
    loading: false,
    error: null as string | null,
    initialized: false
  }),
  actions: {
    async fetchUsuarioPreferences() {
      if (this.initialized && this.usuarioPreferences) {
        return this.usuarioPreferences;
      }

      try {
        this.loading = true;
        const response = await $fetch("/api/usuario/perfil", {
          credentials: "include"
        });

        if (!response.success) {
          throw new Error(response.message);
        }

        this.usuarioPreferences = response.data;
        this.initialized = true;

        if (response.data.type === "RESPONSAVEL") {
          const filhosStore = useFilhosSelectorStore();
          filhosStore.fetchFilhos();
        }

        return response.data;
      } catch (err: any) {
        this.error = err.message || "Erro ao carregar dados do usuário";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deleteUsuario() {
      const response = await $fetch("/api/usuario/perfil", {
        method: "DELETE",
        credentials: "include"
      });

      if (!response.success) {
        throw new Error(response.message);
      }

    },

    clearStore() {
      this.usuarioPreferences = null;
      this.error = null;
      this.initialized = false;
    }
  }
});
