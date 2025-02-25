<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator />
    <UiVueSonner />
  </div>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script lang="ts" setup>
  const themeToggleStore = useThemeToggleStore();
  themeToggleStore.initTheme();
</script>
