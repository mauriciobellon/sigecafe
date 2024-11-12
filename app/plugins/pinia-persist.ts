import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import type { NuxtApp } from "nuxt/app";
import type { Pinia } from "pinia";

export default defineNuxtPlugin((nuxtApp: NuxtApp) => {
  if (import.meta.client) {
    (nuxtApp.$pinia as Pinia).use(piniaPluginPersistedstate);
  }
});
