import { defineStore } from "pinia";
import type { MenuType, Permission } from "@prisma/client";

export const useNavigationStore = defineStore("navigation", {
  state: () => ({
    pages: [] as Permission[],
  }),

  actions: {
    async fetchPages() {
      try {
        const allPagesFetched = await $fetch<Permission[]>("/api/navigation", {
          credentials: "include",
        });

        if (allPagesFetched) {
          const sortedPages = [...allPagesFetched];
          sortedPages.sort((a, b) => (a.title || "").localeCompare(b.title || ""));

          const dashboardIndex = sortedPages.findIndex((p) => p.path === "/app");
          if (dashboardIndex !== -1) {
            const [dashboardPage] = sortedPages.splice(dashboardIndex, 1);
            sortedPages.unshift(dashboardPage);
          }

          this.pages = sortedPages;
        } else {
          console.error("No pages found or data is null");
        }
      } catch (error) {
        console.error("Error fetching pages:", error);
      }
    },

    filterPages(menuType?: MenuType) {
      if (menuType) {
        return this.pages.filter((page) => page.menuType?.includes(menuType));
      } else {
        const route = useRoute();
        const hasPerfil = route.path.includes("/app/perfil");
        if (hasPerfil) {
          return this.pages.filter((page) => page.menuType?.includes("PERFIL"));
        } else {
          return this.pages.filter((page) => page.menuType?.includes("ROOT"));
        }
      }
    },

    navigateTo(path: string) {
      navigateTo(path);
    },
  },
});
