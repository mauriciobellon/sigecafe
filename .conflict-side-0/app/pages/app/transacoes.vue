<template>
  <div>
    <AppPage>
      <UiCard class="mt-10 mb-6">
        <UiCardHeader>
          <UiCardTitle>Transações</UiCardTitle>
          <UiCardDescription>
            Gerencie suas transações de compra e venda de café.
          </UiCardDescription>
        </UiCardHeader>
        <UiCardContent>
          <div class="mb-4 flex justify-between">
            <UiButton @click="openNewTransactionModal">
              <Icon name="lucide:plus" class="mr-2 h-4 w-4" />
              Nova Transação
            </UiButton>

            <div class="flex items-center space-x-2">
              <div>
                <label for="filter" class="sr-only">Filtrar</label>
                <input
                  id="filter"
                  v-model="filter"
                  placeholder="Filtrar transações..."
                  class="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <UiSelect v-model="statusFilter">
                <option value="">Todos os status</option>
                <option value="PENDENTE">Pendente</option>
                <option value="CONCLUIDA">Concluída</option>
                <option value="CANCELADA">Cancelada</option>
              </UiSelect>
            </div>
          </div>

          <div class="rounded-md border">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ usuario?.type === 'COMPRADOR' ? 'Vendedor' : 'Comprador' }}
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço Unitário</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="transacao in filteredTransacoes" :key="transacao.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatDate(transacao.data) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ usuario?.type === 'COMPRADOR' ? transacao.vendedor : transacao.comprador }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ transacao.quantidade }} sacas</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    R$ {{ transacao.precoUnitario.toFixed(2) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    R$ {{ (transacao.quantidade * transacao.precoUnitario).toFixed(2) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      :class="{
                        'bg-green-100 text-green-800': transacao.status === 'CONCLUIDA',
                        'bg-yellow-100 text-yellow-800': transacao.status === 'PENDENTE',
                        'bg-red-100 text-red-800': transacao.status === 'CANCELADA'
                      }"
                    >
                      {{ transacao.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button @click="editTransacao(transacao)" class="text-indigo-600 hover:text-indigo-900 mr-2">
                      <Icon name="lucide:edit-2" class="h-4 w-4" />
                    </button>
                    <button @click="deleteTransacao(transacao)" class="text-red-600 hover:text-red-900">
                      <Icon name="lucide:trash-2" class="h-4 w-4" />
                    </button>
                  </td>
                </tr>
                <tr v-if="filteredTransacoes.length === 0">
                  <td colspan="7" class="px-6 py-4 text-center text-sm text-gray-500">
                    Nenhuma transação encontrada
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </UiCardContent>
      </UiCard>
    </AppPage>

    <!-- Modal para nova/edição de transação -->
    <AlertDialogRoot v-model:open="isNewTransactionOpen">
      <AlertDialogPortal>
        <AlertDialogOverlay
          class="data-[state=open]:animate-overlayShow fixed inset-0 z-30 bg-background/80 backdrop-blur-sm"
        >
          <div
            class="absolute h-full w-full bg-[radial-gradient(theme(colors.border)_1px,transparent_1px)] [background-size:15px_15px] [mask-image:radial-gradient(ellipse_600px_600px_at_50%_50%,#000_10%,transparent_100%)] dark:bg-[radial-gradient(theme(colors.border)_1px,transparent_1px)]"
          />
        </AlertDialogOverlay>

        <AlertDialogContent
          class="data-[state=open]:animate-contentShow fixed left-[50%] top-[50%] z-[100] max-h-[85vh] w-[90vw] max-w-[700px] translate-x-[-50%] translate-y-[-50%] rounded-lg border border-input bg-primary-foreground p-[25px] text-[15px] shadow-[0_0px_50px_-30px_rgba(0,0,0,0.5)] focus:outline-none dark:bg-black dark:shadow-[0_0px_80px_-50px_rgba(0,0,0,0.5)] dark:shadow-gray-500 sm:w-[700px]"
        >
          <AlertDialogTitle class="mb-4 text-xl font-semibold">
            {{ editingTransacao ? "Editar Transação" : "Nova Transação" }}
          </AlertDialogTitle>

          <AlertDialogDescription class="mb-5 mt-4 text-[15px] leading-normal">
            <form @submit.prevent="saveTransacao">
              <div class="grid w-full items-center gap-4">
                <div class="flex flex-col space-y-1.5">
                  <UiLabel for="tipo">Tipo</UiLabel>
                  <select id="tipo" v-model="transacaoForm.tipo" class="alert-input">
                    <option value="compra">Compra</option>
                    <option value="venda">Venda</option>
                  </select>

                  <UiLabel for="contraparte">{{ transacaoForm.tipo === 'compra' ? 'Vendedor' : 'Comprador' }}</UiLabel>
                  <input id="contraparte" v-model="transacaoForm.contraparte" type="text" class="alert-input" />

                  <UiLabel for="quantidade">Quantidade (sacas)</UiLabel>
                  <input id="quantidade" v-model.number="transacaoForm.quantidade" type="number" min="1" class="alert-input" />

                  <UiLabel for="precoUnitario">Preço Unitário (R$)</UiLabel>
                  <input id="precoUnitario" v-model.number="transacaoForm.precoUnitario" type="number" min="0.01" step="0.01" class="alert-input" />

                  <UiLabel for="data">Data</UiLabel>
                  <input id="data" v-model="transacaoForm.data" type="date" class="alert-input" />

                  <UiLabel for="status">Status</UiLabel>
                  <select id="status" v-model="transacaoForm.status" class="alert-input">
                    <option value="PENDENTE">Pendente</option>
                    <option value="CONCLUIDA">Concluída</option>
                    <option value="CANCELADA">Cancelada</option>
                  </select>

                  <UiLabel for="observacoes">Observações</UiLabel>
                  <textarea id="observacoes" v-model="transacaoForm.observacoes" rows="3" class="alert-input"></textarea>
                </div>
              </div>
            </form>
          </AlertDialogDescription>

          <div class="flex justify-end gap-[25px]">
            <AlertDialogCancel
              class="text-mauve11 bg-mauve4 hover:bg-mauve5 focus:shadow-mauve7 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-semibold leading-none outline-none focus:shadow-[0_0_0_2px]"
            >
              Voltar
            </AlertDialogCancel>
            <AlertDialogAction
              class="text-red11 bg-red4 hover:bg-red5 focus:shadow-red7 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-semibold leading-none outline-none focus:shadow-[0_0_0_2px]"
              type="submit"
            >
              Salvar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialogRoot>
  </div>
</template>


<script setup>
import { ref, computed } from 'vue';

const filter = ref('');
const statusFilter = ref('');
const isNewTransactionOpen = ref(false);
const transacaoForm = ref({
  tipo: 'compra',
  contraparte: '',
  quantidade: 1,
  precoUnitario: 0,
  data: '',
  status: 'PENDENTE',
  observacoes: '',
});
const editingTransacao = ref(false);

const transacoes = ref([
  // Exemplo de transação
  { id: 1, data: '2025-04-27', comprador: 'Cafeicultor A', vendedor: 'Comerciante B', quantidade: 10, precoUnitario: 300, status: 'CONCLUIDA' },
  
  // Exemplo de outra transação
  { id: 2, data: '2025-04-25', comprador: 'Cafeicultor C', vendedor: 'Comerciante D', quantidade: 15, precoUnitario: 280, status: 'PENDENTE' },
  
  // Exemplo de transação com status "CANCELADA"
  { id: 3, data: '2025-04-22', comprador: 'Cafeicultor E', vendedor: 'Comerciante F', quantidade: 8, precoUnitario: 290, status: 'CANCELADA' },
  
  // Outra transação de compra
  { id: 4, data: '2025-04-20', comprador: 'Cafeicultor G', vendedor: 'Comerciante H', quantidade: 20, precoUnitario: 310, status: 'CONCLUIDA' },
  
  // Transação com quantidade maior e preço diferente
  { id: 5, data: '2025-04-18', comprador: 'Cafeicultor I', vendedor: 'Comerciante J', quantidade: 25, precoUnitario: 330, status: 'PENDENTE' }
]);


const filteredTransacoes = computed(() => {
  return transacoes.value.filter(transacao => {
    const statusMatch = statusFilter.value ? transacao.status === statusFilter.value : true;
    const filterMatch = transacao.comprador.toLowerCase().includes(filter.value.toLowerCase()) ||
      transacao.vendedor.toLowerCase().includes(filter.value.toLowerCase());
    return statusMatch && filterMatch;
  });
});

const openNewTransactionModal = () => {
  transacaoForm.value = {
    tipo: 'compra',
    contraparte: '',
    quantidade: 1,
    precoUnitario: 0,
    data: '',
    status: 'PENDENTE',
    observacoes: '',
  };
  editingTransacao.value = false;
  isNewTransactionOpen.value = true;
};

const saveTransacao = () => {
  if (editingTransacao.value) {
    // Atualizar a transação existente
  } else {
    // Adicionar nova transação
    transacoes.value.push({
      ...transacaoForm.value,
      id: Date.now(), // Gerar um ID único para a nova transação
    });
  }
  isNewTransactionOpen.value = false;
};

const editTransacao = (transacao) => {
  transacaoForm.value = { ...transacao };
  editingTransacao.value = true;
  isNewTransactionOpen.value = true;
};

const deleteTransacao = (transacao) => {
  transacoes.value = transacoes.value.filter(t => t.id !== transacao.id);
};

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', options);
};
</script>
