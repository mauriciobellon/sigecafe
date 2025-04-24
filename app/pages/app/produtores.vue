<template>
  <div>
    <AppPage>
      <UiCard class="mt-10 mb-6">
        <UiCardContent class="p-6 [&+*]:pt-0">
          <h1 class="mb-4 text-3xl font-semibold">Produtores</h1>

          <UiCard class="mb-6">
            <UiCardHeader>
              <UiCardTitle>Gerenciamento de Produtores</UiCardTitle>
              <UiCardDescription>Lista de produtores cadastrados na cooperativa</UiCardDescription>
            </UiCardHeader>
            <UiCardContent>
              <div class="flex justify-between mb-4">
                <UiInput placeholder="Buscar produtor..." class="max-w-sm" />
                <UiButton>
                  <Icon name="lucide:plus-circle" class="mr-2 h-4 w-4" />
                  Novo Produtor
                </UiButton>
              </div>

              <div class="relative w-full overflow-auto">
                <table class="w-full caption-bottom text-sm">
                  <thead class="[&_tr]:border-b">
                    <tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th class="h-12 px-4 text-left align-middle font-medium">ID</th>
                      <th class="h-12 px-4 text-left align-middle font-medium">Nome</th>
                      <th class="h-12 px-4 text-left align-middle font-medium">Telefone</th>
                      <th class="h-12 px-4 text-left align-middle font-medium">Cidade</th>
                      <th class="h-12 px-4 text-left align-middle font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody class="[&_tr:last-child]:border-0">
                    <tr v-for="i in 5" :key="i" class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <td class="p-4 align-middle">{{ i }}</td>
                      <td class="p-4 align-middle">Produtor {{ i }}</td>
                      <td class="p-4 align-middle">(11) 9999-888{{ i }}</td>
                      <td class="p-4 align-middle">São Paulo</td>
                      <td class="p-4 align-middle">
                        <div class="flex gap-2">
                          <UiButton variant="outline" size="sm">
                            <Icon name="lucide:pencil" class="h-4 w-4" />
                          </UiButton>
                          <UiButton variant="destructive" size="sm">
                            <Icon name="lucide:trash-2" class="h-4 w-4" />
                          </UiButton>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="flex items-center justify-end space-x-2 py-4">
                <UiButton variant="outline" size="sm">
                  Anterior
                </UiButton>
                <UiButton variant="outline" size="sm">
                  Próximo
                </UiButton>
              </div>
            </UiCardContent>
          </UiCard>

          <p class="text-sm text-gray-500">
            Total de produtores cadastrados: 5
          </p>
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