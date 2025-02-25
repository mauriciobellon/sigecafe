<script lang="ts" setup>
  import { ref, shallowRef, onMounted, computed, watch, nextTick } from 'vue'
  import type { Config, ConfigColumns } from 'datatables.net'
  import languageBR from 'datatables.net-plugins/i18n/pt-BR.mjs'
  import { Chart, registerables } from 'chart.js'
  import { useFilhosSelectorStore } from '@/stores/FilhosSelectorStore'
  import LineChart from '@/components/LineChart.vue'

  Chart.register(...registerables)

  const filhosStore = useFilhosSelectorStore()
  const loading = ref(true)
  const atividades = ref([])
  const disciplinas = ref([])
  const activeTab = ref('')
  const chartElements = ref<{ [key: string]: HTMLCanvasElement | null }>({})
  const charts = ref<{ [key: string]: Chart | null }>({})

  const defaultTab = computed(() => {
    if (!disciplinas.value.length) return ''
    const firstId = disciplinas.value[0].id
    if (!activeTab.value) {
      activeTab.value = firstId
    }
    return firstId
  })

  // DataTable configuration
  const options: Config = {
    dom: "<'border rounded-lg't><'flex flex-col lg:flex-row gap-5 items-center lg:justify-between w-full pt-3 p-5 m-auto'lp>",
    searching: true,
    language: languageBR,
    paging: true,
    ordering: true,
    responsive: true,
    autoWidth: true
  }

  const columns: ConfigColumns[] = [
    {
      data: "data",
      title: "Data",
      render: (data) => new Date(data).toLocaleDateString('pt-BR')
    },
    { data: "nome", title: "Atividade" },
    { data: "tipo", title: "Tipo" },
    {
      data: "nota",
      title: "Nota",
      render: (data) => `<span class="font-semibold">${data.toFixed(1)}</span>`
    }
  ]

  function getStats(data: any[]) {
    const totalAtividades = data.length
    const mediaIndividual = data.length > 0
      ? (data.reduce((acc, cur) => acc + cur.nota, 0) / data.length).toFixed(1)
      : '0.0'
    const mediaTurma = data.length > 0
      ? (data.reduce((acc, cur) => acc + cur.mediaTurma, 0) / data.length).toFixed(1)
      : '0.0'

    return {
      totalAtividades,
      mediaIndividual,
      mediaTurma
    }
  }

  function getAtividadesPorDisciplina(disciplinaId: string) {
    return atividades.value.filter(a => a.disciplinaId === disciplinaId)
  }

  function setChartRef(disciplinaId: string, el: HTMLCanvasElement | null) {
    if (!el) return

    // Armazena a referência do elemento
    chartElements.value[disciplinaId] = el

    // Aguarda o próximo ciclo de renderização e garante que o elemento está visível
    nextTick(async () => {
      // Espera um pequeno delay para garantir que o DOM está estável
      await new Promise(resolve => setTimeout(resolve, 100))

      // Verifica se a tab atual corresponde a esta disciplina
      if (disciplinaId === activeTab.value) {
        initializeChart(disciplinaId)
      }
    })
  }

  function initializeChart(disciplinaId: string) {
    const el = chartElements.value[disciplinaId]
    if (!el) return

    // Destrói o gráfico anterior se existir
    if (charts.value[disciplinaId]) {
      charts.value[disciplinaId]?.destroy()
      charts.value[disciplinaId] = null
    }

    const data = getAtividadesPorDisciplina(disciplinaId)
    if (data.length === 0) return

    // Configura o canvas com as dimensões corretas
    const parent = el.parentElement
    if (parent) {
      el.width = parent.clientWidth
      el.height = parent.clientHeight
    }

    const ctx = el.getContext('2d')
    if (!ctx) return

    try {
      charts.value[disciplinaId] = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.map(a => new Date(a.data).toLocaleDateString('pt-BR')),
          datasets: [
            {
              label: 'Nota Individual',
              data: data.map(a => a.nota),
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1,
              fill: false
            },
            {
              label: 'Média da Turma',
              data: data.map(a => a.mediaTurma),
              borderColor: 'rgb(255, 99, 132)',
              tension: 0.1,
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Evolução do Desempenho'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 10
            }
          }
        }
      })
    } catch (error) {
      console.error('Erro ao criar o gráfico:', error)
    }
  }

  // Mock API calls
  async function fetchAtividades() {
    await new Promise(resolve => setTimeout(resolve, 1))
    atividades.value = [
      {
        data: '2024-03-10',
        disciplinaId: '1',
        nome: 'Prova Bimestral',
        tipo: 'Avaliação',
        nota: 8.5,
        mediaTurma: 7.8
      },
      {
        data: '2024-03-08',
        disciplinaId: '1',
        nome: 'Trabalho em Grupo',
        tipo: 'Trabalho',
        nota: 9.0,
        mediaTurma: 8.2
      },
      {
        data: '2024-03-05',
        disciplinaId: '1',
        nome: 'Lista de Exercícios',
        tipo: 'Atividade',
        nota: 7.5,
        mediaTurma: 7.0
      },
      {
        data: '2024-03-01',
        disciplinaId: '1',
        nome: 'Seminário',
        tipo: 'Apresentação',
        nota: 8.0,
        mediaTurma: 7.5
      },
      {
        data: '2024-02-28',
        disciplinaId: '1',
        nome: 'Teste Surpresa',
        tipo: 'Avaliação',
        nota: 6.5,
        mediaTurma: 6.0
      },
      {
        data: '2024-03-10',
        disciplinaId: '2',
        nome: 'Redação',
        tipo: 'Trabalho',
        nota: 9.0,
        mediaTurma: 8.0
      },
      {
        data: '2024-03-07',
        disciplinaId: '2',
        nome: 'Interpretação de Texto',
        tipo: 'Atividade',
        nota: 8.5,
        mediaTurma: 7.8
      },
      {
        data: '2024-03-03',
        disciplinaId: '2',
        nome: 'Prova de Gramática',
        tipo: 'Avaliação',
        nota: 7.0,
        mediaTurma: 6.5
      },
      {
        data: '2024-02-29',
        disciplinaId: '2',
        nome: 'Apresentação Oral',
        tipo: 'Apresentação',
        nota: 8.5,
        mediaTurma: 8.0
      },
      {
        data: '2024-02-25',
        disciplinaId: '2',
        nome: 'Ditado',
        tipo: 'Atividade',
        nota: 9.5,
        mediaTurma: 8.8
      },
      {
        data: '2024-03-09',
        disciplinaId: '3',
        nome: 'Prova História Antiga',
        tipo: 'Avaliação',
        nota: 8.0,
        mediaTurma: 7.5
      },
      {
        data: '2024-03-06',
        disciplinaId: '3',
        nome: 'Trabalho sobre Revolução',
        tipo: 'Trabalho',
        nota: 9.5,
        mediaTurma: 8.7
      },
      {
        data: '2024-03-02',
        disciplinaId: '3',
        nome: 'Linha do Tempo',
        tipo: 'Atividade',
        nota: 8.5,
        mediaTurma: 8.0
      },
      {
        data: '2024-02-27',
        disciplinaId: '3',
        nome: 'Seminário História do Brasil',
        tipo: 'Apresentação',
        nota: 9.0,
        mediaTurma: 8.5
      },
      {
        data: '2024-02-23',
        disciplinaId: '3',
        nome: 'Teste Rápido',
        tipo: 'Avaliação',
        nota: 7.5,
        mediaTurma: 7.0
      },
      {
        data: '2024-02-20',
        disciplinaId: '1',
        nome: 'Prova de Álgebra',
        tipo: 'Avaliação',
        nota: 8.0,
        mediaTurma: 7.3
      }
    ]
  }

  async function fetchDisciplinas() {
    await new Promise(resolve => setTimeout(resolve, 1))
    disciplinas.value = [
      { id: '1', nome: 'Matemática' },
      { id: '2', nome: 'Português' },
      { id: '3', nome: 'História' }
    ]
  }

  function getChartData(disciplinaId: string) {
    const data = getAtividadesPorDisciplina(disciplinaId)

    return {
      labels: data.map(a => new Date(a.data).toLocaleDateString('pt-BR')),
      datasets: [
        {
          label: 'Nota Individual',
          data: data.map(a => a.nota),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
          fill: false
        },
        {
          label: 'Média da Turma',
          data: data.map(a => a.mediaTurma),
          borderColor: 'rgb(255, 99, 132)',
          tension: 0.1,
          fill: false
        }
      ]
    }
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Evolução do Desempenho'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10
      }
    }
  }

  // Lifecycle and watchers
  onMounted(async () => {
    try {
      await fetchDisciplinas()
      await fetchAtividades()
    } finally {
      loading.value = false
      if (defaultTab.value) {
        nextTick(() => {
          initializeChart(defaultTab.value)
        })
      }
    }
  })

  watch(() => activeTab.value, (newTab) => {
    if (newTab) {
      nextTick(() => {
        initializeChart(newTab)
      })
    }
  })

  watch(() => filhosStore.selectedChild, async (newChild) => {
    if (newChild) {
      loading.value = true
      try {
        await fetchAtividades()
      } finally {
        loading.value = false
        if (activeTab.value) {
          nextTick(() => {
            initializeChart(activeTab.value)
          })
        }
      }
    }
  })
</script>

<template>
  <div>
    <AppPage>
      <div class="space-y-6">
        <UiCard>
          <UiCardContent>
            <div v-if="loading" class="flex justify-center items-center p-4">
              <Icon name="lucide:loader-2" class="h-6 w-6 animate-spin" />
            </div>

            <UiTabs v-else :default-value="defaultTab" v-model="activeTab" class="w-full">
              <UiTabsList class="grid w-full grid-cols-3">
                <UiTabsTrigger v-for="disciplina in disciplinas" :key="disciplina.id" :value="disciplina.id">
                  {{ disciplina.nome }}
                </UiTabsTrigger>
              </UiTabsList>

              <UiTabsContent v-for="disciplina in disciplinas" :key="disciplina.id" :value="disciplina.id">
                <!-- Stats Cards -->
                <div class="grid gap-4 md:grid-cols-3 mb-6">
                  <UiCard>
                    <UiCardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                      <UiCardTitle class="text-sm font-medium">Média Individual</UiCardTitle>
                      <Icon name="lucide:bar-chart" class="h-4 w-4 text-primary" />
                    </UiCardHeader>
                    <UiCardContent>
                      <div class="text-2xl font-bold">
                        {{ getStats(getAtividadesPorDisciplina(disciplina.id)).mediaIndividual }}
                      </div>
                      <p class="text-xs text-muted-foreground">média na disciplina</p>
                    </UiCardContent>
                  </UiCard>

                  <UiCard>
                    <UiCardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                      <UiCardTitle class="text-sm font-medium">Atividades Realizadas</UiCardTitle>
                      <Icon name="lucide:check-circle" class="h-4 w-4 text-primary" />
                    </UiCardHeader>
                    <UiCardContent>
                      <div class="text-2xl font-bold">
                        {{ getStats(getAtividadesPorDisciplina(disciplina.id)).totalAtividades }}
                      </div>
                      <p class="text-xs text-muted-foreground">atividades concluídas</p>
                    </UiCardContent>
                  </UiCard>

                  <UiCard>
                    <UiCardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                      <UiCardTitle class="text-sm font-medium">Média da Turma</UiCardTitle>
                      <Icon name="lucide:users" class="h-4 w-4 text-primary" />
                    </UiCardHeader>
                    <UiCardContent>
                      <div class="text-2xl font-bold">
                        {{ getStats(getAtividadesPorDisciplina(disciplina.id)).mediaTurma }}
                      </div>
                      <p class="text-xs text-muted-foreground">média geral da turma</p>
                    </UiCardContent>
                  </UiCard>
                </div>

                <!-- Datatable -->
                <UiDatatable :options="options" :columns="columns" :data="getAtividadesPorDisciplina(disciplina.id)" />

                <!-- Chart -->
                <div class="chart-container mt-6">
                  <LineChart v-if="getAtividadesPorDisciplina(disciplina.id).length > 0"
                    :data="getChartData(disciplina.id)" :options="chartOptions" />
                </div>
              </UiTabsContent>
            </UiTabs>
          </UiCardContent>
        </UiCard>
      </div>
    </AppPage>
  </div>
</template>

<style scoped>
  .chart-container {
    width: 100%;
    max-width: 800px;
    margin: 2rem auto;
  }
</style>