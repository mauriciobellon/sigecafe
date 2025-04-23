<template>
  <div>
    <AppPage>
      <UiCard>
        <UiCardContent>
          <div v-if="isLoading" class="flex items-center justify-center py-8">
            <div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
          <div v-else class="space-y-4">
            <div v-if="notificacoes.length === 0" class="text-center py-8">
              <p class="text-muted-foreground">Nenhuma notificação encontrada</p>
            </div>
            <div v-for="notificacao in notificacoes" :key="notificacao.id"
              class="flex items-center gap-4 rounded-lg border p-4"
              :class="{'bg-primary/5': !notificacao.lida}"
              @click="marcarComoLida(notificacao)">
              <Icon :name="notificacao.icon || 'lucide:bell'" class="h-5 w-5 text-primary" />
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
  const notificacoes = ref([]);
  const isLoading = ref(true);

  // Função para buscar notificações
  async function fetchNotificacoes() {
    isLoading.value = true;
    try {
      const data = await $fetch('/api/notificacao');
      notificacoes.value = data;
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    } finally {
      isLoading.value = false;
    }
  }

  // Função para marcar notificação como lida
  async function marcarComoLida(notificacao: any) {
    if (notificacao.lida) return;

    try {
      await $fetch('/api/notificacao', {
        method: 'PUT',
        body: { id: notificacao.id }
      });

      // Atualizar o status de leitura localmente
      const index = notificacoes.value.findIndex((n: any) => n.id === notificacao.id);
      if (index !== -1) {
        notificacoes.value[index].lida = true;
      }
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  }

  // Buscar notificações ao montar o componente
  onMounted(fetchNotificacoes);
</script>