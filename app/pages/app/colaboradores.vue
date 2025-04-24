<template>
  <div>
    <AppPage>
      <UiCard class="mt-10 mb-6">
        <UiCardHeader>
          <UiCardTitle>Colaboradores</UiCardTitle>
          <UiCardDescription>
            Gerencie os colaboradores da plataforma.
          </UiCardDescription>
        </UiCardHeader>
        <UiCardContent>
          <AppDynamicTabs tabsFolder="Colaboradores" :order="['Todos', 'Coordenadores']" />
        </UiCardContent>
      </UiCard>
    </AppPage>
  </div>
</template>

<script setup lang="ts">
import { definePageMeta } from "#imports";

definePageMeta({
  middleware: ["auth"]
});
</script>