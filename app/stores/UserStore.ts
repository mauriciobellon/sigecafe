import { defineStore } from "pinia";
import type { UsuarioPreferencesDTO, AuthResponseDTO } from "~/types/api";

interface UserState {
  usuarioPreferences: UsuarioPreferencesDTO | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

export const useUsuarioStore = defineStore("usuario", {
  state: (): UserState => ({
    usuarioPreferences: null,
    loading: false,
    error: null,
    initialized: false
  }),
  actions: {
    async fetchUsuarioPreferences() {
      if (this.initialized && this.usuarioPreferences) {
        return this.usuarioPreferences;
      }

      try {
        this.loading = true;
        const response = await $fetch<AuthResponseDTO>("/api/usuario/perfil", {
          credentials: "include"
        });

        if (!response.success) {
          throw new Error(response.message);
        }

        this.usuarioPreferences = response.data;
        this.initialized = true;

        return response.data;
      } catch (err: any) {
        this.error = err.message || "Erro ao carregar dados do usuário";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deleteUsuario() {
      const response = await $fetch<AuthResponseDTO>("/api/usuario/perfil", {
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
