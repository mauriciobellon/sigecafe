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
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ usuario?.type === 'COMPRADOR' ? 'Vendedor' : 'Comprador' }}
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantidade
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço Unitário
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="transacao in filteredTransacoes" :key="transacao.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatDate(transacao.data) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ usuario?.type === 'COMPRADOR' ? transacao.vendedor : transacao.comprador }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ transacao.quantidade }} sacas
                  </td>
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
                      }">
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

    <!-- Modal para nova transação -->
    <UiSheet v-model:open="isNewTransactionOpen" side="right">
      <div class="flex flex-col h-full w-80 sm:w-96">
        <div class="p-4 border-b">
          <h2 class="text-lg font-medium">{{ editingTransacao ? 'Editar Transação' : 'Nova Transação' }}</h2>
        </div>
        <div class="p-4 flex-1 overflow-auto">
          <form @submit.prevent="saveTransacao" class="space-y-4">
            <div>
              <label for="tipo" class="block text-sm font-medium text-gray-700">Tipo</label>
              <select id="tipo" v-model="transacaoForm.tipo" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                <option value="compra">Compra</option>
                <option value="venda">Venda</option>
              </select>
            </div>

            <div>
              <label for="contraparte" class="block text-sm font-medium text-gray-700">
                {{ transacaoForm.tipo === 'compra' ? 'Vendedor' : 'Comprador' }}
              </label>
              <input id="contraparte" v-model="transacaoForm.contraparte" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
            </div>

            <div>
              <label for="quantidade" class="block text-sm font-medium text-gray-700">Quantidade (sacas)</label>
              <input id="quantidade" v-model.number="transacaoForm.quantidade" type="number" min="1" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
            </div>

            <div>
              <label for="precoUnitario" class="block text-sm font-medium text-gray-700">Preço Unitário (R$)</label>
              <input id="precoUnitario" v-model.number="transacaoForm.precoUnitario" type="number" min="0.01" step="0.01" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
            </div>

            <div>
              <label for="data" class="block text-sm font-medium text-gray-700">Data</label>
              <input id="data" v-model="transacaoForm.data" type="date" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
            </div>

            <div>
              <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
              <select id="status" v-model="transacaoForm.status" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                <option value="PENDENTE">Pendente</option>
                <option value="CONCLUIDA">Concluída</option>
                <option value="CANCELADA">Cancelada</option>
              </select>
            </div>

            <div>
              <label for="observacoes" class="block text-sm font-medium text-gray-700">Observações</label>
              <textarea id="observacoes" v-model="transacaoForm.observacoes" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"></textarea>
            </div>
          </form>
        </div>
        <div class="p-4 border-t flex justify-end space-x-2">
          <UiButton variant="outline" @click="isNewTransactionOpen = false">Cancelar</UiButton>
          <UiButton @click="saveTransacao">Salvar</UiButton>
        </div>
      </div>
    </UiSheet>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, reactive, onMounted } from 'vue';
  import { useUsuarioStore } from '~/stores/UserStore';
  import type { TransacaoDTO } from '~/types/api';

  const usuarioStore = useUsuarioStore();
  const usuario = computed(() => usuarioStore.usuarioPreferences);

  // Estado local
  const isNewTransactionOpen = ref(false);
  const filter = ref('');
  const statusFilter = ref('');
  const editingTransacao = ref<TransacaoDTO | null>(null);

  // Dados de transações
  const transacoes = ref<TransacaoDTO[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Formulário para nova transação
  const transacaoForm = reactive({
    id: null as string | null,
    tipo: 'compra',
    contraparte: '',
    quantidade: 1,
    precoUnitario: 900,
    data: new Date().toISOString().split('T')[0],
    status: 'PENDENTE' as 'PENDENTE' | 'CONCLUIDA' | 'CANCELADA',
    observacoes: ''
  });

  // Carregar transações ao montar o componente
  onMounted(async () => {
    await loadTransacoes();
  });

  // Carregar transações da API
  async function loadTransacoes() {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch('/api/transacoes', {
        credentials: 'include'
      });

      if (response && Array.isArray(response)) {
        // Convert string dates to Date objects
        transacoes.value = response.map(item => ({
          ...item,
          data: new Date(item.data),
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt)
        })) as TransacaoDTO[];
      } else {
        throw new Error('Resposta inválida da API');
      }
    } catch (e) {
      error.value = 'Erro ao carregar transações';
      console.error(e);

      // Fallback para mock data em caso de erro (desenvolvimento)
      transacoes.value = [
        {
          id: "1",
          data: new Date(),
          comprador: 'Empresa A',
          compradorId: 1,
          vendedor: 'Produtor B',
          vendedorId: 2,
          quantidade: 10,
          precoUnitario: 950.00,
          valorTotal: 9500.00,
          status: 'CONCLUIDA' as 'PENDENTE' | 'CONCLUIDA' | 'CANCELADA',
          observacoes: 'Café arábica de qualidade superior',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: "2",
          data: new Date(Date.now() - 86400000), // ontem
          comprador: 'Empresa C',
          compradorId: 3,
          vendedor: 'Produtor A',
          vendedorId: 4,
          quantidade: 5,
          precoUnitario: 920.50,
          valorTotal: 4602.50,
          status: 'PENDENTE' as 'PENDENTE' | 'CONCLUIDA' | 'CANCELADA',
          observacoes: '',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: "3",
          data: new Date(Date.now() - 172800000), // 2 dias atrás
          comprador: 'Empresa B',
          compradorId: 5,
          vendedor: 'Produtor C',
          vendedorId: 6,
          quantidade: 15,
          precoUnitario: 900.00,
          valorTotal: 13500.00,
          status: 'CANCELADA' as 'PENDENTE' | 'CONCLUIDA' | 'CANCELADA',
          observacoes: 'Cancelado por atraso na entrega',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
    } finally {
      loading.value = false;
    }
  }

  // Filtragem de transações
  const filteredTransacoes = computed(() => {
    return transacoes.value.filter(t => {
      const matchesFilter = filter.value === '' ||
        t.comprador.toLowerCase().includes(filter.value.toLowerCase()) ||
        t.vendedor.toLowerCase().includes(filter.value.toLowerCase()) ||
        (t.observacoes && t.observacoes.toLowerCase().includes(filter.value.toLowerCase()));

      const matchesStatus = statusFilter.value === '' || t.status === statusFilter.value.toUpperCase();

      return matchesFilter && matchesStatus;
    });
  });

  // Funções
  function formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  function openNewTransactionModal() {
    // Reset form
    Object.assign(transacaoForm, {
      id: null,
      tipo: 'compra',
      contraparte: '',
      quantidade: 1,
      precoUnitario: 900,
      data: new Date().toISOString().split('T')[0],
      status: 'PENDENTE' as 'PENDENTE' | 'CONCLUIDA' | 'CANCELADA',
      observacoes: ''
    });

    editingTransacao.value = null;
    isNewTransactionOpen.value = true;
  }

  function editTransacao(transacao: TransacaoDTO) {
    // Preencher formulário com dados da transação
    const tipo = usuario.value?.type === 'COMPRADOR' ? 'compra' : 'venda';
    const contraparte = tipo === 'compra' ? transacao.vendedor : transacao.comprador;

    Object.assign(transacaoForm, {
      id: transacao.id,
      tipo,
      contraparte,
      quantidade: transacao.quantidade,
      precoUnitario: transacao.precoUnitario,
      data: transacao.data instanceof Date
        ? transacao.data.toISOString().split('T')[0]
        : new Date(transacao.data).toISOString().split('T')[0],
      status: transacao.status,
      observacoes: transacao.observacoes || ''
    });

    editingTransacao.value = transacao;
    isNewTransactionOpen.value = true;
  }

  function deleteTransacao(transacao: TransacaoDTO) {
    // Confirmar antes de excluir
    if (confirm(`Tem certeza que deseja excluir esta transação?`)) {
      try {
        // Chamar a API para excluir no servidor
        $fetch(`/api/transacoes/${transacao.id}`, {
          method: 'DELETE',
          credentials: 'include'
        }).then(() => {
          // Remover da lista local após sucesso
          transacoes.value = transacoes.value.filter(t => t.id !== transacao.id);
        }).catch(error => {
          console.error('Erro ao excluir transação:', error);
          alert('Não foi possível excluir a transação. Tente novamente.');
        });
      } catch (error) {
        console.error('Erro ao excluir transação:', error);
        alert('Não foi possível excluir a transação. Tente novamente.');
      }
    }
  }

  async function saveTransacao() {
    // Validação básica do formulário
    if (!transacaoForm.contraparte || transacaoForm.quantidade <= 0 || transacaoForm.precoUnitario <= 0) {
      alert('Por favor, preencha todos os campos obrigatórios corretamente.');
      return;
    }

    // Calcular valor total
    const valorTotal = transacaoForm.quantidade * transacaoForm.precoUnitario;

    try {
      if (transacaoForm.id) {
        // Atualizar transação existente
        const response = await $fetch(`/api/transacoes/${transacaoForm.id}`, {
          method: 'PUT',
          body: {
            quantidade: transacaoForm.quantidade,
            precoUnitario: transacaoForm.precoUnitario,
            valorTotal: valorTotal,
            data: transacaoForm.data ? new Date(transacaoForm.data) : new Date(),
            status: transacaoForm.status,
            observacoes: transacaoForm.observacoes,
            tipo: transacaoForm.tipo,
            contraparte: transacaoForm.contraparte
          },
          credentials: 'include'
        });
      } else {
        // Criar nova transação
        const response = await $fetch('/api/transacoes', {
          method: 'POST',
          body: {
            quantidade: transacaoForm.quantidade,
            precoUnitario: transacaoForm.precoUnitario,
            valorTotal: valorTotal,
            data: transacaoForm.data ? new Date(transacaoForm.data) : new Date(),
            status: transacaoForm.status,
            observacoes: transacaoForm.observacoes,
            tipo: transacaoForm.tipo,
            contraparte: transacaoForm.contraparte
          },
          credentials: 'include'
        });
      }

      // Recarregar transações após sucesso
      await loadTransacoes();

      // Fechar modal após sucesso
      isNewTransactionOpen.value = false;
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
      alert('Não foi possível salvar a transação. Verifique os dados e tente novamente.');
    }
  }
</script>