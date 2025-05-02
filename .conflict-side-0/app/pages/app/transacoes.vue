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
              <div class="relative w-72">
                <label for="filter" class="sr-only">Filtrar</label>
                <input
                  id="filter"
                  v-model="filter"
                  placeholder="Buscar transações..."
                  class="h-12 w-full pl-10 pr-3 rounded-lg border border-input bg-background text-base shadow-md transition-colors file:border-0 file:bg-transparent file:text-base file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                />
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <Icon name="lucide:search" class="h-5 w-5" />
                </span>
              </div>
              <UiSelect v-model="statusFilter" class="w-72 h-12 text-base rounded-lg shadow-md">
                <option value="">Todos os status</option>
                <option value="PENDENTE">Pendente</option>
                <option value="CONCLUIDA">Concluída</option>
                <option value="CANCELADA">Cancelada</option>
              </UiSelect>
            </div>
          </div>

          <div class="rounded-md border dark:border-gray-700">
            <div class="overflow-x-auto w-full">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-black text-gray-900 dark:text-white">
                <thead class="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Data</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {{ usuario?.type === 'ADMINISTRADOR' ? 'Comprador' : (usuario?.type === 'COMPRADOR' ? 'Vendedor' : 'Comprador') }}
                    </th>
                    <th v-if="usuario?.type === 'ADMINISTRADOR'" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Vendedor
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantidade</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Preço Unitário</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody class="bg-white dark:bg-black divide-y divide-gray-200 dark:divide-gray-700">
                  <tr v-for="transacao in filteredTransacoes" :key="transacao.id">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ formatDate(transacao.data) }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {{ usuario?.type === 'ADMINISTRADOR' ? transacao.comprador : (usuario?.type === 'COMPRADOR' ? transacao.vendedor : transacao.comprador) }}
                    </td>
                    <td v-if="usuario?.type === 'ADMINISTRADOR'" class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {{ transacao.vendedor }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ transacao.quantidade }} sacas</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      R$ {{ transacao.precoUnitario.toFixed(2) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      R$ {{ (transacao.quantidade * transacao.precoUnitario).toFixed(2) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span
                        class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                        :class="{
                          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': transacao.status === 'CONCLUIDA',
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': transacao.status === 'PENDENTE',
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': transacao.status === 'CANCELADA'
                        }"
                      >
                        {{ transacao.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button @click="editTransacao(transacao)" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 mr-2">
                        <Icon name="lucide:edit-2" class="h-4 w-4" />
                      </button>
                      <button @click="deleteTransacao(transacao)" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200">
                        <Icon name="lucide:trash-2" class="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                  <tr v-if="filteredTransacoes.length === 0">
                    <td :colspan="usuario?.type === 'ADMINISTRADOR' ? 8 : 7" class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-300">
                      Nenhuma transação encontrada
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
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
              <div v-if="errorMessage" class="mb-4 p-2 rounded bg-red-100 text-red-800 border border-red-300">
                {{ errorMessage }}
              </div>
              <div class="grid w-full items-center gap-4">
                <div class="flex flex-col space-y-1.5">
                  <template v-if="usuario?.type === 'ADMINISTRADOR'">
                    <UiLabel for="comprador">Comprador</UiLabel>
                    <UiSelect v-model="transacaoForm.compradorId" id="comprador">
                      <option value="">Selecione o comprador</option>
                      <option v-for="contraparte in contrapartes.filter(c => c.type === 'COMPRADOR')" :key="contraparte.id" :value="String(contraparte.id)">
                        {{ contraparte.name }}
                      </option>
                    </UiSelect>

                    <UiLabel for="vendedor">Vendedor</UiLabel>
                    <UiSelect v-model="transacaoForm.vendedorId" id="vendedor">
                      <option value="">Selecione o vendedor</option>
                      <option v-for="contraparte in contrapartes.filter(c => c.type === 'PRODUTOR')" :key="contraparte.id" :value="String(contraparte.id)">
                        {{ contraparte.name }}
                      </option>
                    </UiSelect>
                  </template>
                  <template v-else-if="usuario?.type === 'COMPRADOR'">
                    <UiLabel for="comprador">Comprador</UiLabel>
                    <UiSelect v-model="transacaoForm.compradorId" id="comprador" disabled>
                      <option :value="usuario.id">{{ usuario.name }}</option>
                    </UiSelect>

                    <UiLabel for="vendedor">Vendedor</UiLabel>
                    <UiSelect v-model="transacaoForm.vendedorId" id="vendedor">
                      <option value="">Selecione o vendedor</option>
                      <option v-for="contraparte in contrapartes" :key="contraparte.id" :value="String(contraparte.id)">
                        {{ contraparte.name }}
                      </option>
                    </UiSelect>
                  </template>
                  <template v-else-if="usuario?.type === 'PRODUTOR'">
                    <UiLabel for="comprador">Comprador</UiLabel>
                    <UiSelect v-model="transacaoForm.compradorId" id="comprador">
                      <option value="">Selecione o comprador</option>
                      <option v-for="contraparte in contrapartes" :key="contraparte.id" :value="String(contraparte.id)">
                        {{ contraparte.name }}
                      </option>
                    </UiSelect>

                    <UiLabel for="vendedor">Vendedor</UiLabel>
                    <UiSelect v-model="transacaoForm.vendedorId" id="vendedor" disabled>
                      <option :value="usuario.id">{{ usuario.name }}</option>
                    </UiSelect>
                  </template>

                  <UiLabel for="quantidade">Quantidade (sacas)</UiLabel>
                  <UiInput id="quantidade" v-model.number="transacaoForm.quantidade" type="number" min="1" />

                  <UiLabel for="precoUnitario">Preço Unitário (R$)</UiLabel>
                  <UiInput id="precoUnitario" v-model.number="transacaoForm.precoUnitario" type="number" min="0.01" step="0.01" />

                  <UiLabel for="data">Data</UiLabel>
                  <UiInput id="data" v-model="transacaoForm.data" type="date" />

                  <UiLabel for="status">Status</UiLabel>
                  <UiSelect v-model="transacaoForm.status" id="status">
                    <option value="PENDENTE">Pendente</option>
                    <option value="CONCLUIDA">Concluída</option>
                    <option value="CANCELADA">Cancelada</option>
                  </UiSelect>

                  <UiLabel for="observacoes">Observações</UiLabel>
                  <textarea id="observacoes" v-model="transacaoForm.observacoes" rows="3" class="form-input h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus:border-input focus:ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:[color-scheme:dark] sm:text-sm" />
                </div>
              </div>
              <div class="flex justify-end gap-[25px] mt-6">
                <AlertDialogCancel
                  class="text-mauve11 bg-mauve4 hover:bg-mauve5 focus:shadow-mauve7 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-semibold leading-none outline-none focus:shadow-[0_0_0_2px]"
                >
                  Voltar
                </AlertDialogCancel>
                <button
                  class="text-red11 bg-red4 hover:bg-red5 focus:shadow-red7 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-semibold leading-none outline-none focus:shadow-[0_0_0_2px]"
                  type="submit"
                >
                  Salvar
                </button>
              </div>
            </form>
          </AlertDialogDescription>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialogRoot>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import UiSelect from '@/components/Ui/select.vue';
import UiSelectTrigger from '@/components/Ui/Select/Trigger.vue';
import UiSelectContent from '@/components/Ui/Select/Content.vue';
import UiSelectItem from '@/components/Ui/Select/Item.vue';

const filter = ref('');
const statusFilter = ref('');
const isNewTransactionOpen = ref(false);
const transacaoForm = ref({
  quantidade: 1,
  precoUnitario: 0,
  valorTotal: 0,
  data: '',
  status: 'PENDENTE',
  observacoes: '',
  compradorId: '',
  vendedorId: '',
});
const editingTransacao = ref(false);
const transacoes = ref([]);
const usuario = ref(null);
const contrapartes = ref([]);
const errorMessage = ref("");

const contraparteId = computed({
  get: () => usuario.value?.type === 'COMPRADOR' ? transacaoForm.value.vendedorId : transacaoForm.value.compradorId,
  set: (value) => {
    if (usuario.value?.type === 'COMPRADOR') {
      transacaoForm.value.vendedorId = value;
    } else {
      transacaoForm.value.compradorId = value;
    }
  }
});

// Buscar transações ao carregar a página
onMounted(async () => {
  await fetchUsuario();
  await fetchTransacoes();
});

// Buscar transações da API
async function fetchTransacoes() {
  try {
    const response = await fetch('/api/transacoes', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error('Erro ao buscar transações');
    }
    const data = await response.json();
    transacoes.value = data;
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
  }
}

// Buscar informações do usuário
async function fetchUsuario() {
  try {
    const response = await fetch('/api/auth/session');
    if (!response.ok) throw new Error('Erro ao buscar usuário');
    const data = await response.json();
    usuario.value = data.user;
    // Após buscar o usuário, buscar as contrapartes
    await fetchContrapartes();
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
  }
}

// Buscar contrapartes (compradores ou vendedores)
async function fetchContrapartes() {
  try {
    const response = await fetch('/api/transacoes/contrapartes');
    if (!response.ok) throw new Error('Erro ao buscar contrapartes');
    const data = await response.json();
    contrapartes.value = data;
  } catch (error) {
    console.error('Erro ao buscar contrapartes:', error);
  }
}

const filteredTransacoes = computed(() => {
  return transacoes.value.filter(transacao => {
    const statusMatch = statusFilter.value ? transacao.status === statusFilter.value : true;
    let filterMatch = true;
    if (filter.value.trim() !== '') {
      const comprador = (transacao.comprador || '').toLowerCase();
      const vendedor = (transacao.vendedor || '').toLowerCase();
      const quantidade = String(transacao.quantidade || '').toLowerCase();
      const precoUnitario = String(transacao.precoUnitario || '').toLowerCase();
      const filtro = filter.value.toLowerCase();
      filterMatch =
        comprador.includes(filtro) ||
        vendedor.includes(filtro) ||
        quantidade.includes(filtro) ||
        precoUnitario.includes(filtro);
    }
    return statusMatch && filterMatch;
  });
});

const openNewTransactionModal = () => {
  transacaoForm.value = {
    quantidade: 1,
    precoUnitario: 0,
    valorTotal: 0,
    data: new Date().toISOString().split('T')[0],
    status: 'PENDENTE',
    observacoes: '',
    compradorId: usuario.value?.type === 'COMPRADOR' ? String(usuario.value.id) : '',
    vendedorId: usuario.value?.type === 'PRODUTOR' ? String(usuario.value.id) : '',
  };
  editingTransacao.value = false;
  isNewTransactionOpen.value = true;
};

const saveTransacao = async () => {
  errorMessage.value = "";
  try {
    // Calcular valor total
    transacaoForm.value.valorTotal = transacaoForm.value.quantidade * transacaoForm.value.precoUnitario;

    // Converter IDs para número
    transacaoForm.value.compradorId = Number(transacaoForm.value.compradorId);
    transacaoForm.value.vendedorId = Number(transacaoForm.value.vendedorId);

    let response;
    if (editingTransacao.value && transacaoForm.value.id) {
      // Edição: PUT
      console.log('Enviando PUT para /api/transacoes/' + transacaoForm.value.id, transacaoForm.value);
      response = await fetch(`/api/transacoes/${transacaoForm.value.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transacaoForm.value),
      });
    } else {
      // Criação: POST
      console.log('Enviando POST para /api/transacoes', transacaoForm.value);
      response = await fetch('/api/transacoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transacaoForm.value),
      });
    }

    if (!response.ok) {
      let msg = 'Erro ao salvar transação';
      try {
        const data = await response.json();
        msg = data.statusMessage || data.message || msg;
      } catch {}
      errorMessage.value = msg;
      return;
    }

    await fetchTransacoes(); // Atualizar lista de transações
    isNewTransactionOpen.value = false;
  } catch (error) {
    console.error('Erro ao salvar transação:', error);
    errorMessage.value = error?.message || 'Erro desconhecido ao salvar transação';
  }
};

const editTransacao = (transacao) => {
  transacaoForm.value = { ...transacao };
  editingTransacao.value = true;
  isNewTransactionOpen.value = true;
};

const deleteTransacao = async (transacao) => {
  try {
    const response = await fetch(`/api/transacoes/${transacao.id}`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error('Erro ao deletar transação');

    await fetchTransacoes(); // Atualizar lista de transações
  } catch (error) {
    console.error('Erro ao deletar transação:', error);
  }
};

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', options);
};
</script>