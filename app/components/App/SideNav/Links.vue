<template>
  <template v-for="(page, i) in pages" :key="i">
    <UiTooltip disable-closing-trigger :delay-duration="1000" side="bottom">
      <template #trigger>
        <UiTooltipTrigger as-child>
          <NuxtLink class="nav-link" exact-active-class="nav-link-active" :to="page.path">
            <Icon v-if="page.icon" :name="page.icon" class="nav-icon" />
            {{ page.title }}
          </NuxtLink>
        </UiTooltipTrigger>
      </template>
      <template #content>
        <UiTooltipContent>
          <p>{{ page.description || page.title }}</p>
        </UiTooltipContent>
      </template>
    </UiTooltip>
    <UiDivider v-if="page.path === '/app'" class="divider" />
  </template>
</template>

<script lang="ts" setup>
  const navigationStore = useNavigationStore();
  const pages = computed(() => navigationStore.filterPages());
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
  }

  .nav-link-active {
    @apply text-primary;
    @apply font-bold;
    @apply bg-muted;
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
