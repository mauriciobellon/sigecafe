import { defineStore } from "pinia";

interface UserPreferences {
  theme?: "light" | "dark" | "system";
  fontSize?: "small" | "medium" | "large";
}

export const useThemeToggleStore = defineStore("ThemeToggle", {
  state: () => ({
    preference: "system" as "light" | "dark" | "system",
    initialized: false
  }),

  actions: {
    async toggleTheme() {
      const colorMode = useColorMode();
      this.preference = colorMode.value === "dark" ? "light" : "dark";
      colorMode.preference = this.preference;

      // If user is authenticated, save preference to API
      if (this.initialized) {
        try {
          await $fetch<UserPreferences>('/api/preferences', {
            method: 'PUT',
            body: { theme: this.preference }
          });
        } catch (error) {
          console.error('Error saving theme preference:', error);
        }
      }
    },

    async initTheme() {
      const colorMode = useColorMode();

      try {
        // Try to fetch preferences from API
        const preferences = await $fetch<UserPreferences>('/api/preferences');
        if (preferences && preferences.theme) {
          this.preference = preferences.theme;
          colorMode.preference = preferences.theme;
        } else {
          // Fallback to browser preference
          this.preference = colorMode.preference as "light" | "dark" | "system";
          this.preference = ["light", "dark", "system"].includes(colorMode.preference)
            ? (colorMode.preference as "light" | "dark" | "system")
            : "system";
        }
      } catch (error) {
        // User not logged in or API error, use browser preference
        this.preference = colorMode.preference as "light" | "dark" | "system";
        this.preference = ["light", "dark", "system"].includes(colorMode.preference)
          ? (colorMode.preference as "light" | "dark" | "system")
          : "system";
      }

      this.initialized = true;
    },
  }
});
