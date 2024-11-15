import { defineStore } from "pinia";
import type { User } from "@prisma/client";

export const useUserStore = defineStore("user", {
  state: () => ({
    userPreferences: null as User | null,
    isInitialized: false,
  }),
  actions: {
    async syncWithAuth() {
      const auth = useAuth();
      const session = await auth.getSession();

      this.userPreferences = session.user as User | null;
      this.isInitialized = true;
    },
    async deleteUser() {
      await $fetch("/api/perfil/excluir", {
        method: "POST",
        credentials: "include"
      });
      const router = useRouter();
      useAuth()
        .signOut()
        .then(() => {
          router.push("/auth");
        });
    },
  }
});
