<template>
  <div class="sticky-header">
    <div class="header-content">
      <SharedAppTitle />
      <UiSheetClose class="close-button">
        <Icon name="lucide:x" />
      </UiSheetClose>
    </div>
    <UiSeparator class="separator" />
  </div>
</template>

<script lang="ts" setup></script>

<style scoped>
  .sticky-header {
    @apply sticky;
    @apply top-0;
    @apply mb-3;
    @apply w-full;
    @apply bg-background;
  }

  .header-content {
    @apply flex;
    @apply items-center;
    @apply gap-3.5;
    @apply text-lg;
    @apply font-bold;
  }

  .close-button {
    @apply ml-auto;
  }

  .separator {
    @apply mt-4;
  }
</style>
