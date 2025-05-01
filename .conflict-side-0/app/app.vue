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
  import { useFontSizeStore } from '~/stores/FontSizeStore';

  const themeToggleStore = useThemeToggleStore();
  const fontSizeStore = useFontSizeStore();

  themeToggleStore.initTheme();
  fontSizeStore.initFontSize();
</script>
