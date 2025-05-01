<template>
  <UiTabsContent :value="filename" class="mt-4">
    <slot />
  </UiTabsContent>
</template>

<script setup lang="ts">
  const props = defineProps<{
    filename: string;
  }>();
</script>
