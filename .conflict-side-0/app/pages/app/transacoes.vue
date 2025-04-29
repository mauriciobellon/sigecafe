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
              @click="saveTransacao"
            >
              {{ editingTransacao ? "Atualizar" : "Salvar" }}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialogRoot>
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