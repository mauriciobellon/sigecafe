<template>
  <div>
    <AppPage>
      <UiCard class="mt-10 mb-6">
        <UiCardContent class="p-6 [&+*]:pt-0">
          <h1 class="mb-4 text-3xl font-semibold">Dashboard</h1>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <!-- Card 1 -->
            <UiCard>
              <UiCardHeader>
                <UiCardTitle>Preços do Café</UiCardTitle>
                <UiCardDescription>Preços de referência do mercado</UiCardDescription>
              </UiCardHeader>
              <UiCardContent>
                <div class="text-center">
                  <p class="mb-2 text-sm">Arábica</p>
                  <p class="text-2xl font-bold">R$ 1.249,88</p>
                  <p class="mb-2 text-sm mt-4">Robusta</p>
                  <p class="text-2xl font-bold">R$ 779,25</p>
                </div>
              </UiCardContent>
              <UiCardFooter>
                <NuxtLink to="/app/coffee-prices" class="w-full">
                  <UiButton variant="outline" class="w-full">Ver detalhes</UiButton>
                </NuxtLink>
              </UiCardFooter>
            </UiCard>

            <!-- Card 2 -->
            <UiCard>
              <UiCardHeader>
                <UiCardTitle>Produtores</UiCardTitle>
                <UiCardDescription>Produtores cadastrados</UiCardDescription>
              </UiCardHeader>
              <UiCardContent>
                <div class="flex justify-center items-center h-20">
                  <p class="text-3xl font-bold">15</p>
                </div>
              </UiCardContent>
              <UiCardFooter>
                <NuxtLink to="/app/produtores" class="w-full">
                  <UiButton variant="outline" class="w-full">Gerenciar produtores</UiButton>
                </NuxtLink>
              </UiCardFooter>
            </UiCard>

            <!-- Card 3 -->
            <UiCard>
              <UiCardHeader>
                <UiCardTitle>Colaboradores</UiCardTitle>
                <UiCardDescription>Equipe da cooperativa</UiCardDescription>
              </UiCardHeader>
              <UiCardContent>
                <div class="flex justify-center items-center h-20">
                  <p class="text-3xl font-bold">8</p>
                </div>
              </UiCardContent>
              <UiCardFooter>
                <NuxtLink to="/app/colaboradores" class="w-full">
                  <UiButton variant="outline" class="w-full">Gerenciar equipe</UiButton>
                </NuxtLink>
              </UiCardFooter>
            </UiCard>
          </div>
        </UiCardContent>
      </UiCard>
    </AppPage>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'app',
  middleware: ['auth']
});
</script>