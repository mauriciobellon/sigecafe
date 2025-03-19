<template>
  <div>
    <AppPage>
      <UiCard>
        <UiCardContent>
          <div class="space-y-4">
            <div v-for="notificacao in notificacoes" :key="notificacao.id"
              class="flex items-center gap-4 rounded-lg border p-4">
              <Icon :name="notificacao.icon" class="h-5 w-5 text-primary" />
              <div class="flex-1">
                <p class="font-medium">{{ notificacao.titulo }}</p>
                <p class="text-sm text-muted-foreground">{{ notificacao.descricao }}</p>
              </div>
              <time class="text-sm text-muted-foreground">{{ notificacao.data }}</time>
            </div>
          </div>
        </UiCardContent>
      </UiCard>
    </AppPage>
  </div>
</template>


<script lang="ts" setup>
  const notificacoes = ref([
    {
      id: 1,
      icon: 'lucide:book',
      titulo: 'Nova atividade registrada',
      descricao: 'Matemática - Turma A',
      data: 'Há 5 min'
    },
    {
      id: 2,
      icon: 'lucide:bell',
      titulo: 'Notificação enviada',
      descricao: 'Aviso sobre reunião de pais',
      data: 'Há 30 min'
    },
    {
      id: 3,
      icon: 'lucide:check-circle',
      titulo: 'Frequência registrada',
      descricao: 'Português - Turma B',
      data: 'Há 1h'
    },
    {
      id: 3,
      icon: 'lucide:alert-circle',
      titulo: 'Frequência registrada',
      descricao: 'Português - Turma B',
      data: 'Há 1h'
    },
    {
      id: 3,
      icon: 'lucide:check-circle',
      titulo: 'Frequência registrada',
      descricao: 'Português - Turma B',
      data: 'Há 1h'
    },
    {
      id: 3,
      icon: 'lucide:check-circle',
      titulo: 'Frequência registrada',
      descricao: 'Português - Turma B',
      data: 'Há 1h'
    }
  ]);
</script>