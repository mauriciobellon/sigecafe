<template>
  <div>
    <AppPage>
      <UiCard class="mt-10 mb-6">
        <UiCardHeader>
          <UiCardTitle>Relatórios</UiCardTitle>
          <UiCardDescription>
            Gere relatórios personalizados de transações e produtores.
          </UiCardDescription>
        </UiCardHeader>
        <UiCardContent>
          <!-- Report filters -->
          <div class="mb-6 rounded-lg border p-4">
            <h3 class="text-lg font-medium mb-4">Filtros do Relatório</h3>

            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div class="space-y-2">
                <label class="text-sm font-medium">Tipo de Relatório</label>
                <UiSelect v-model="reportType">
                  <option value="transactions">Transações</option>
                  <option value="producers">Produtores</option>
                  <option value="buyers">Compradores</option>
                </UiSelect>
              </div>

              <div class="space-y-2">
                <label class="text-sm font-medium">Data Inicial</label>
                <input 
                  type="date" 
                  v-model="filters.startDate" 
                  class="h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                >
              </div>

              <div class="space-y-2">
                <label class="text-sm font-medium">Data Final</label>
                <input 
                  type="date" 
                  v-model="filters.endDate" 
                  class="h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                >
              </div>

              <div v-if="reportType === 'transactions'" class="space-y-2">
                <label class="text-sm font-medium">Valor Mínimo</label>
                <input 
                  type="number" 
                  v-model="filters.minValue" 
                  placeholder="R$ 0,00" 
                  class="h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                >
              </div>

              <div v-if="reportType === 'transactions'" class="space-y-2">
                <label class="text-sm font-medium">Valor Máximo</label>
                <input 
                  type="number" 
                  v-model="filters.maxValue" 
                  placeholder="R$ 0,00" 
                  class="h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                >
              </div>

              <div v-if="reportType !== 'transactions'" class="space-y-2">
                <label class="text-sm font-medium">Cidade</label>
                <UiSelect v-model="filters.city">
                  <option value="">Todas as cidades</option>
                  <option v-for="city in availableCities" :key="city" :value="city">
                    {{ city }}
                  </option>
                </UiSelect>
              </div>

              <div v-if="reportType !== 'transactions'" class="space-y-2">
                <label class="text-sm font-medium">Estado</label>
                <UiSelect v-model="filters.state">
                  <option value="">Todos os estados</option>
                  <option v-for="state in availableStates" :key="state" :value="state">
                    {{ state }}
                  </option>
                </UiSelect>
              </div>
            </div>

            <div class="mt-4 flex justify-end">
              <UiButton @click="generateReport" :disabled="loading">
                <Icon v-if="loading" name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
                Gerar Relatório
              </UiButton>
            </div>
          </div>

          <!-- Loading state -->
          <div v-if="loading" class="flex justify-center py-8">
            <div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>

          <!-- Report results -->
          <div v-else-if="reportData.length > 0">
            <h3 class="text-lg font-medium mb-4">Resultados</h3>
            
            <!-- Transaction report -->
            <Datatable
              v-if="reportType === 'transactions'"
              :columns="transactionColumns"
              :data="reportData"
              :loading="loading"
            />

            <!-- Associados report -->
            <Datatable
              v-else
              :columns="associadoColumns"
              :data="reportData"
              :loading="loading"
            />
          </div>

          <!-- No results message -->
          <div v-else-if="hasSearched" class="text-center py-8">
            <Icon name="lucide:file-search" class="mx-auto h-12 w-12 text-muted-foreground" />
            <p class="mt-4 text-lg font-medium">Nenhum resultado encontrado</p>
            <p class="text-sm text-muted-foreground">Tente ajustar os filtros para encontrar o que procura.</p>
          </div>
        </UiCardContent>
      </UiCard>
    </AppPage>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import type { TransacaoDTO, AssociadoDTO } from '~/types/api';
import UiSelect from '~/components/Ui/select.vue';
import Datatable from '~/components/Ui/Datatable.client.vue';

// Report type
const reportType = ref('transactions');

// Filters
const filters = reactive({
  startDate: '',
  endDate: '',
  status: '',
  minValue: '',
  maxValue: '',
  city: '',
  state: ''
});

// State
const loading = ref(false);
const reportData = ref<any[]>([]);
const hasSearched = ref(false);

// Cidades e estados disponíveis
const availableCities = ref<string[]>([]);
const availableStates = ref<string[]>([]);

// Buscar cidades e estados disponíveis
async function fetchLocations() {
  try {
    const response = await $fetch<any>('/api/associado/locations');
    availableCities.value = response.cidades || [];
    availableStates.value = response.estados || [];
  } catch (error) {
    console.error('Erro ao buscar localizações:', error);
  }
}

// Buscar dados ao montar o componente
onMounted(() => {
  fetchLocations();
});

// Columns for datatable
const transactionColumns = [
  { data: 'data', title: 'Data', orderable: true },
  { data: 'comprador', title: 'Comprador', orderable: true },
  { data: 'vendedor', title: 'Vendedor', orderable: true },
  { data: 'quantidade', title: 'Quantidade', orderable: true },
  { data: 'valorTotal', title: 'Valor Total', orderable: true },
  { data: 'status', title: 'Status', orderable: true }
];

const associadoColumns = [
  { data: 'nome', title: 'Nome', orderable: true },
  { data: 'celular', title: 'Contato', orderable: true },
  { data: 'documento', title: 'Documento', orderable: true },
  { data: 'cidade', title: 'Cidade', orderable: true },
  { data: 'estado', title: 'Estado', orderable: true },
  { data: 'transacoes', title: 'Transações', orderable: true },
  { data: 'volume', title: 'Volume', orderable: true }
];

// Format date for display
function formatDate(date: string | Date) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('pt-BR');
}

// Fetch transactions report
async function fetchTransactionsReport() {
  try {
    console.log('Iniciando busca de transações...');
    const queryParams = new URLSearchParams();

    if (filters.startDate) {
      queryParams.append('dataInicio', new Date(filters.startDate).toISOString());
    }

    if (filters.endDate) {
      queryParams.append('dataFim', new Date(filters.endDate).toISOString());
    }

    if (filters.status) {
      queryParams.append('status', filters.status);
    }

    console.log('Parâmetros da busca:', queryParams.toString());
    const response = await $fetch<any>(`/api/transacoes?${queryParams.toString()}`);
    console.log('Resposta da API:', response);

    let filteredData = response.data || [];
    console.log('Dados filtrados:', filteredData);

    if (filters.minValue) {
      filteredData = filteredData.filter((item: TransacaoDTO) =>
        item.valorTotal >= parseFloat(filters.minValue)
      );
    }

    if (filters.maxValue) {
      filteredData = filteredData.filter((item: TransacaoDTO) =>
        item.valorTotal <= parseFloat(filters.maxValue)
      );
    }

    // Mapear os dados para o formato esperado pela tabela
    reportData.value = filteredData.map((item: TransacaoDTO) => ({
      data: item.data,
      comprador: item.comprador,
      vendedor: item.vendedor,
      quantidade: item.quantidade,
      valorTotal: item.valorTotal,
      status: item.status
    }));

    console.log('Dados finais:', reportData.value);
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    throw error;
  }
}

// Fetch associados report
async function fetchAssociadosReport(tipo: 'PRODUTOR' | 'COMPRADOR') {
  try {
    console.log(`Buscando relatório de ${tipo}...`);
    const queryParams = new URLSearchParams();
    queryParams.append('tipo', tipo);

    if (filters.city) {
      queryParams.append('cidade', filters.city);
    }

    if (filters.state) {
      queryParams.append('estado', filters.state);
    }

    console.log('Parâmetros da busca:', queryParams.toString());
    const response = await $fetch<any>(`/api/associado?${queryParams.toString()}`);
    console.log('Resposta da API:', response);

    // Mapear os dados para o formato esperado pela tabela
    const data = (response.data || []).map((item: AssociadoDTO) => {
      return {
        nome: item.nome || '-',
        celular: item.celular || '-',
        documento: item.documento || '-',
        cidade: item.cidade || '-',
        estado: item.estado || '-',
        transacoes: item.transacoes || 0,
        volume: item.volume || 0
      };
    });

    reportData.value = data;
    console.log('Dados finais:', reportData.value);
  } catch (error) {
    console.error(`Erro ao buscar relatório de ${tipo}:`, error);
    throw error;
  }
}

// Generate report
async function generateReport() {
  loading.value = true;
  hasSearched.value = true;
  console.log('Iniciando geração de relatório...');
  console.log('Tipo de relatório:', reportType.value);
  console.log('Filtros:', filters);

  try {
    if (reportType.value === 'transactions') {
      await fetchTransactionsReport();
    } else if (reportType.value === 'producers') {
      await fetchAssociadosReport('PRODUTOR');
    } else if (reportType.value === 'buyers') {
      await fetchAssociadosReport('COMPRADOR');
    }
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    reportData.value = [];
  } finally {
    loading.value = false;
  }
}
</script>