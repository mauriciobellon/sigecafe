<template>
  <div>
    <AppPage>
      <div class="space-y-6">
        <!-- Disciplinas Tabs -->
        <UiCard>
          <UiCardContent>
            <div v-if="loading" class="flex justify-center items-center p-4">
              <Icon name="lucide:loader-2" class="h-6 w-6 animate-spin" />
            </div>

            <UiTabs v-else :defaultValue="defaultTab" class="w-full">
              <UiTabsList class="grid w-full grid-cols-3">
                <UiTabsTrigger v-for="disciplina in disciplinas" :key="disciplina.id" :value="disciplina.id">
                  {{ disciplina.nome }}
                </UiTabsTrigger>
              </UiTabsList>

              <!-- Tab: Disciplinas Individuais -->
              <UiTabsContent v-for="disciplina in disciplinas" :key="disciplina.id" :value="disciplina.id">
                <!-- Stats Cards por Disciplina -->
                <div class="grid gap-4 md:grid-cols-3 mb-6">
                  <UiCard>
                    <UiCardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                      <UiCardTitle class="text-sm font-medium">
                        Total de Presenças
                      </UiCardTitle>
                      <Icon name="lucide:check-circle" class="h-4 w-4 text-primary" />
                    </UiCardHeader>
                    <UiCardContent>
                      <div class="text-2xl font-bold">
                        {{ getStats(getFrequenciasPorDisciplina(disciplina.id)).presencas }}
                      </div>
                      <p class="text-xs text-muted-foreground">
                        aulas registradas
                      </p>
                    </UiCardContent>
                  </UiCard>

                  <UiCard>
                    <UiCardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                      <UiCardTitle class="text-sm font-medium">
                        Total de Faltas
                      </UiCardTitle>
                      <Icon name="lucide:x-circle" class="h-4 w-4 text-destructive" />
                    </UiCardHeader>
                    <UiCardContent>
                      <div class="text-2xl font-bold">
                        {{ getStats(getFrequenciasPorDisciplina(disciplina.id)).faltas }}
                      </div>
                      <p class="text-xs text-muted-foreground">
                        aulas perdidas
                      </p>
                    </UiCardContent>
                  </UiCard>

                  <UiCard>
                    <UiCardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                      <UiCardTitle class="text-sm font-medium">
                        Percentual de Presença
                      </UiCardTitle>
                      <Icon name="lucide:percent" class="h-4 w-4 text-primary" />
                    </UiCardHeader>
                    <UiCardContent>
                      <div class="text-2xl font-bold">
                        {{ getStats(getFrequenciasPorDisciplina(disciplina.id)).percentual }}%
                      </div>
                      <p class="text-xs text-muted-foreground">
                        de frequência total
                      </p>
                    </UiCardContent>
                  </UiCard>
                </div>

                <UiDatatable :options="options" :columns="columns" :data="getFrequenciasPorDisciplina(disciplina.id)" />
              </UiTabsContent>
            </UiTabs>
          </UiCardContent>
        </UiCard>
      </div>
    </AppPage>
  </div>
</template>

<script lang="ts" setup>
  import { ref, shallowRef, onMounted, computed } from 'vue';
  import type DataTableRef from 'datatables.net';
  import type { Config, ConfigColumns } from 'datatables.net';
  import languageBR from 'datatables.net-plugins/i18n/pt-BR.mjs';
  import { useFilhosSelectorStore } from '@/stores/FilhosSelectorStore';

  const filhosStore = useFilhosSelectorStore();
  const tableRef = shallowRef<InstanceType<typeof DataTableRef<any[]>> | null>(null);
  const frequencias = ref([]);
  const disciplinas = ref([]);
  const loading = ref(true);

  // Computed para garantir um valor padrão válido
  const defaultTab = computed(() => {
    return disciplinas.value[0]?.id || '';
  });

  // DataTable configuration
  const options: Config = {
    dom: "<'border rounded-lg't><'flex flex-col lg:flex-row gap-5 items-center lg:justify-between w-full pt-3 p-5 m-auto'lp>",
    searching: true,
    language: languageBR,
    paging: true,
    ordering: true,
    responsive: true,
    autoWidth: true
  };

  const columns: ConfigColumns[] = [
    {
      data: "data",
      title: "Data",
      render: (data) => new Date(data).toLocaleDateString('pt-BR')
    },
    { data: "disciplina", title: "Disciplina" },
    {
      data: "presente",
      title: "Status",
      render: (data) => data
        ? '<span class="text-green-600">Presente</span>'
        : '<span class="text-red-600">Falta</span>'
    },
    { data: "professor", title: "Professor" }
  ];

  function initializeTable(instance: any) {
    tableRef.value = instance;
  }

  // Stats computation
  function getStats(data: any[]) {
    const total = data.length;
    const faltas = data.filter(f => !f.presente).length;
    const presencas = total - faltas;
    const percentual = total > 0 ? Math.round((presencas / total) * 100) : 0;

    return {
      presencas,
      faltas,
      percentual
    };
  }

  // Filter frequências by disciplina
  function getFrequenciasPorDisciplina(disciplinaId: string) {
    return frequencias.value.filter(f => f.disciplinaId === disciplinaId);
  }

  // Mock API calls
  async function fetchFrequencias() {
    await new Promise(resolve => setTimeout(resolve, 1));

    frequencias.value = [
      {
        data: '2024-03-10',
        disciplinaId: '1',
        disciplina: 'Matemática',
        presente: true,
        professor: 'João Silva'
      },
      {
        data: '2024-03-10',
        disciplinaId: '2',
        disciplina: 'Português',
        presente: true,
        professor: 'Maria Santos'
      },
      {
        data: '2024-03-09',
        disciplinaId: '3',
        disciplina: 'História',
        presente: false,
        professor: 'Pedro Oliveira'
      },
      {
        data: '2024-03-08',
        disciplinaId: '1',
        disciplina: 'Matemática',
        presente: true,
        professor: 'João Silva'
      },
      {
        data: '2024-03-08',
        disciplinaId: '2',
        disciplina: 'Português',
        presente: false,
        professor: 'Maria Santos'
      },
      {
        data: '2024-03-07',
        disciplinaId: '3',
        disciplina: 'História',
        presente: true,
        professor: 'Pedro Oliveira'
      },
      {
        data: '2024-03-07',
        disciplinaId: '1',
        disciplina: 'Matemática',
        presente: true,
        professor: 'João Silva'
      },
      {
        data: '2024-03-06',
        disciplinaId: '2',
        disciplina: 'Português',
        presente: true,
        professor: 'Maria Santos'
      },
      {
        data: '2024-03-06',
        disciplinaId: '3',
        disciplina: 'História',
        presente: true,
        professor: 'Pedro Oliveira'
      },
      {
        data: '2024-03-05',
        disciplinaId: '1',
        disciplina: 'Matemática',
        presente: false,
        professor: 'João Silva'
      },
      {
        data: '2024-03-05',
        disciplinaId: '2',
        disciplina: 'Português',
        presente: true,
        professor: 'Maria Santos'
      },
      {
        data: '2024-03-04',
        disciplinaId: '3',
        disciplina: 'História',
        presente: true,
        professor: 'Pedro Oliveira'
      },
      {
        data: '2024-03-04',
        disciplinaId: '1',
        disciplina: 'Matemática',
        presente: true,
        professor: 'João Silva'
      },
      {
        data: '2024-03-03',
        disciplinaId: '2',
        disciplina: 'Português',
        presente: false,
        professor: 'Maria Santos'
      },
      {
        data: '2024-03-03',
        disciplinaId: '3',
        disciplina: 'História',
        presente: true,
        professor: 'Pedro Oliveira'
      },
      {
        data: '2024-03-02',
        disciplinaId: '1',
        disciplina: 'Matemática',
        presente: true,
        professor: 'João Silva'
      },
      {
        data: '2024-03-02',
        disciplinaId: '2',
        disciplina: 'Português',
        presente: true,
        professor: 'Maria Santos'
      },
      {
        data: '2024-03-01',
        disciplinaId: '3',
        disciplina: 'História',
        presente: false,
        professor: 'Pedro Oliveira'
      },
      {
        data: '2024-03-01',
        disciplinaId: '1',
        disciplina: 'Matemática',
        presente: true,
        professor: 'João Silva'
      },
      {
        data: '2024-02-29',
        disciplinaId: '2',
        disciplina: 'Português',
        presente: true,
        professor: 'Maria Santos'
      },
      {
        data: '2024-02-29',
        disciplinaId: '3',
        disciplina: 'História',
        presente: true,
        professor: 'Pedro Oliveira'
      },
      {
        data: '2024-02-28',
        disciplinaId: '1',
        disciplina: 'Matemática',
        presente: false,
        professor: 'João Silva'
      },
      {
        data: '2024-02-28',
        disciplinaId: '2',
        disciplina: 'Português',
        presente: true,
        professor: 'Maria Santos'
      }
    ];
  }

  // Modificar o fetchDisciplinas para atualizar o valor padrão
  async function fetchDisciplinas() {
    await new Promise(resolve => setTimeout(resolve, 1));

    disciplinas.value = [
      { id: '1', nome: 'Matemática' },
      { id: '2', nome: 'Português' },
      { id: '3', nome: 'História' }
    ];
  }

  // Modificar o onMounted para garantir que as disciplinas são carregadas primeiro
  onMounted(async () => {
    try {
      await fetchDisciplinas();
      await fetchFrequencias();
    } finally {
      loading.value = false;
    }
  });

  // Watch for selected child changes
  watch(() => filhosStore.selectedChild, async (newChild) => {
    if (newChild) {
      await fetchFrequencias();
    }
  });
</script>