<template>
  <div v-if="mounted && filhosStore.show">
    <UiButton
      v-for="filho in filhosStore.filhos"
      :key="filho.id"
      variant="outline"
      class="nav-link"
      :class="{ 'nav-link-active': filhosStore.selectedChild?.id === filho.id }"
      @click="filhosStore.setSelectedChild(filho)"
    >
      <UiAvatar
        class="nav-icon"
        :alt="filho.nome"
        :fallback="filhosStore.getIniciais(filho.nome)"
        :delay-ms="600"
      />

      <div class="flex flex-col space-y-1">
        <p class="text-left text-sm font-medium leading-none">{{ filho.nome }}</p>
        <p class="text-left text-xs leading-none text-muted-foreground">
          {{ filhosStore.modificarEscola(filho.escola) }}
        </p>
      </div>
    </UiButton>
    <UiDivider class="divider" />
  </div>
  <div v-else>
    <!-- Fallback -->
  </div>
</template>

<script lang="ts" setup>
  const filhosStore = useFilhosSelectorStore();

  const mounted = ref(false);
  onMounted(() => {
    mounted.value = true;
  });

  // Fetch children data when component mounts
  onMounted(async () => {
    await filhosStore.fetchFilhos();
  });

  // Select first child automatically when children list is loaded
  watch(
    () => filhosStore.filhos,
    (newFilhos) => {
      if (newFilhos?.length && !filhosStore.selectedChild) {
        filhosStore.setSelectedChild(newFilhos[0]);
      }
    },
    { immediate: true }
  );
</script>

<style scoped>
  .nav-link {
    @apply h-10;
    @apply rounded-md;
    @apply ps-3;
    @apply gap-2;
    @apply flex;
    @apply items-center;
    @apply text-ellipsis;
    @apply text-base;
    @apply text-muted-foreground;
    @apply sm:hover:font-bold;
    @apply sm:text-sm;
    @apply w-full;
    @apply justify-start;
    @apply transition-all;
    @apply duration-200;
    @apply my-1;
    @apply border-transparent;
    @apply border;
  }

  .nav-link-active {
    @apply text-primary;
    @apply font-bold;
    @apply bg-muted;
    @apply border-input;
  }

  .nav-icon {
    @apply h-7;
    @apply w-7;
  }

  .divider {
    @apply mt-4;
    @apply mb-4;
  }
</style>
