import { defineStore } from "pinia";

export const useThemeStore = defineStore("theme", {
  state: () => ({
    preference: "system" as "light" | "dark" | "system",
  }),

  actions: {
    toggleTheme() {
      const colorMode = useColorMode();
      this.preference = colorMode.value === "dark" ? "light" : "dark";
      colorMode.preference = this.preference;
    },

    initTheme() {
      const colorMode = useColorMode();
      this.preference = colorMode.preference as "light" | "dark" | "system";
      // ... or for safer runtime validation:
      this.preference = ["light", "dark", "system"].includes(colorMode.preference)
        ? (colorMode.preference as "light" | "dark" | "system")
        : "system";
    },
  },

  persist: true,
});
