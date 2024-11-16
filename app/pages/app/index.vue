<template>
  <div>
    <div v-if="usuario?.type === 'AUTENTICADO'">
      <SharedMsgWarning title="Cadastro Pendente"
        description="Por favor, entre em contato com a administração da escola para finalizar seu cadastro e liberar o acesso completo ao sistema." />
    </div>
    <div v-else>
      <UiCard class="mt-10 mb-6">
        <UiCardHeader>
          <UiCardTitle>Bem-vindo ao Escola ON</UiCardTitle>
          <UiCardDescription>
            Acompanhe em tempo real todas as informações importantes
          </UiCardDescription>
        </UiCardHeader>
        <UiCardContent>
          <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <!-- Quick Stats -->
            <div class="rounded-lg border p-4">
              <div class="flex items-center gap-2">
                <Icon name="lucide:bell" class="h-5 w-5 text-primary" />
                <h3 class="font-semibold">Notificações</h3>
              </div>
              <p class="mt-2 text-2xl font-bold">{{ notificacoesPendentes }}</p>
              <p class="text-sm text-muted-foreground">notificações pendentes</p>
            </div>

            <div class="rounded-lg border p-4">
              <div class="flex items-center gap-2">
                <Icon name="lucide:book" class="h-5 w-5 text-primary" />
                <h3 class="font-semibold">Atividades</h3>
              </div>
              <p class="mt-2 text-2xl font-bold">{{ atividadesPendentes }}</p>
              <p class="text-sm text-muted-foreground">atividades pendentes</p>
            </div>

            <div class="rounded-lg border p-4">
              <div class="flex items-center gap-2">
                <Icon name="lucide:alert-circle" class="h-5 w-5 text-primary" />
                <h3 class="font-semibold">Ocorrências</h3>
              </div>
              <p class="mt-2 text-2xl font-bold">{{ ocorrenciasPendentes }}</p>
              <p class="text-sm text-muted-foreground">ocorrências pendentes</p>
            </div>
          </div>
        </UiCardContent>
      </UiCard>

      <!-- Ações Rápidas -->
      <div v-if="usuario?.type === 'ADMINISTRADOR' || usuario?.type === 'COORDENADOR' || usuario?.type === 'PROFESSOR'">
        <UiCard class="mb-6">
          <UiCardHeader>
            <UiCardTitle>Ações Rápidas</UiCardTitle>
          </UiCardHeader>
          <UiCardContent>
            <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <UiButton variant="outline" class="h-24 flex-col gap-2">
                <Icon name="lucide:users" class="h-6 w-6" />
                <span>Gerenciar Turmas</span>
              </UiButton>

              <UiButton variant="outline" class="h-24 flex-col gap-2">
                <Icon name="lucide:book-open" class="h-6 w-6" />
                <span>Ver Disciplinas</span>
              </UiButton>

              <UiButton variant="outline" class="h-24 flex-col gap-2">
                <Icon name="lucide:message-square" class="h-6 w-6" />
                <span>Enviar Notificação</span>
              </UiButton>

              <UiButton variant="outline" class="h-24 flex-col gap-2">
                <Icon name="lucide:file-text" class="h-6 w-6" />
                <span>Registrar Ocorrência</span>
              </UiButton>
            </div>
          </UiCardContent>
        </UiCard>
      </div>

      <!-- Atividades Recentes -->
      <UiCard>
        <UiCardHeader>
          <UiCardTitle>Atividades Recentes</UiCardTitle>
          <UiCardDescription>
            Últimas atualizações e eventos do sistema
          </UiCardDescription>
        </UiCardHeader>
        <UiCardContent>
          <div class="space-y-4">
            <div v-for="atividade in atividadesRecentes" :key="atividade.id"
              class="flex items-center gap-4 rounded-lg border p-4">
              <Icon :name="atividade.icon" class="h-5 w-5 text-primary" />
              <div class="flex-1">
                <p class="font-medium">{{ atividade.titulo }}</p>
                <p class="text-sm text-muted-foreground">{{ atividade.descricao }}</p>
              </div>
              <time class="text-sm text-muted-foreground">{{ atividade.data }}</time>
            </div>
          </div>
        </UiCardContent>
      </UiCard>
    </div>
  </div>
</template>

<script lang="ts" setup>
  const usuarioStore = useUsuarioStore();
  const usuario = computed(() => usuarioStore.usuarioPreferences);

  // Mock data - replace with real data from your API
  const notificacoesPendentes = ref(5);
  const atividadesPendentes = ref(3);
  const ocorrenciasPendentes = ref(2);

  const atividadesRecentes = ref([
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
    }
  ]);
</script>