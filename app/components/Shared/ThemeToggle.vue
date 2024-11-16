<template>
  <ClientOnly>
    <Icon @click="themeStore.toggleTheme()" v-if="colorMode.value === 'dark'" name="lucide:moon" class="h-5 w-5"
      title="Alternar Tema Claro" />
    <Icon @click="themeStore.toggleTheme()" v-else name="lucide:sun" class="h-5 w-5" title="Alternar Tema Escuro" />
  </ClientOnly>
</template>

<script lang="ts" setup>
  const colorMode = useColorMode();
  const themeStore = useThemeStore();
</script>
