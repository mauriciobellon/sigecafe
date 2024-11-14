<template>
  <div>
    <UiTabsContent :value="fileName" class="mt-4 tabteste">
      <h1>Teste</h1>
    </UiTabsContent>
  </div>
</template>

<script setup lang="ts">
  const { fileName } = useTabName()
</script>