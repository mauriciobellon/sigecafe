import { defineStore } from "pinia";
import { ref } from "vue";

export const useHeaderStore = defineStore("header", () => {
  const mobileNav = ref(false);
  return {
    mobileNav,
  };
});
