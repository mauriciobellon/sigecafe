<template>
  <UiTabsContent :value="fileName" class="mt-4">
    <h1>Teste</h1>
  </UiTabsContent>
</template>

<script setup lang="ts">
  import { computed } from "vue";

  const fileName = computed(() => {
    return import.meta.url.split("/").pop()?.split(".")[0] || "Todos";
  });
</script>
