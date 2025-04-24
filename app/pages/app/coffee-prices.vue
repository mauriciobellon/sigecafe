<template>
  <div>
    <AppPage>
      <UiCard class="mt-10 mb-6">
        <UiCardContent class="p-6 [&+*]:pt-0">
          <h1 class="mb-4 text-3xl font-semibold">Preços do Café</h1>
          <p class="mb-6 text-gray-500">Acompanhe os preços de referência do mercado de café.</p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <!-- Arábica Card -->
            <UiCard>
              <UiCardHeader>
                <UiCardTitle>Café Arábica</UiCardTitle>
                <UiCardDescription>CEPEA/ESALQ - São Paulo</UiCardDescription>
              </UiCardHeader>
              <UiCardContent>
                <div class="flex flex-col items-center">
                  <p class="text-4xl font-bold text-primary mb-2">R$ 1.249,88</p>
                  <p class="text-sm text-gray-500">por saca de 60kg</p>
                </div>
              </UiCardContent>
            </UiCard>

            <!-- Robusta Card -->
            <UiCard>
              <UiCardHeader>
                <UiCardTitle>Café Robusta/Conilon</UiCardTitle>
                <UiCardDescription>CEPEA/ESALQ - São Paulo</UiCardDescription>
              </UiCardHeader>
              <UiCardContent>
                <div class="flex flex-col items-center">
                  <p class="text-4xl font-bold text-primary mb-2">R$ 779,25</p>
                  <p class="text-sm text-gray-500">por saca de 60kg</p>
                </div>
              </UiCardContent>
            </UiCard>
          </div>

          <UiCard class="mb-6">
            <UiCardHeader>
              <UiCardTitle>Histórico de Preços</UiCardTitle>
              <UiCardDescription>Variação dos últimos 30 dias</UiCardDescription>
            </UiCardHeader>
            <UiCardContent>
              <div class="h-80 flex items-center justify-center">
                <p class="text-gray-400">Gráfico de histórico de preços - em desenvolvimento</p>
              </div>
            </UiCardContent>
          </UiCard>

          <div class="text-sm text-gray-500">
            <p>Fonte: Centro de Estudos Avançados em Economia Aplicada (CEPEA/ESALQ/USP)</p>
            <p>Última atualização: {{ new Date().toLocaleDateString('pt-BR') }}</p>
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