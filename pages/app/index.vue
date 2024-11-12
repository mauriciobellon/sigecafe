<template>
  <div>
    <div v-if="user?.type === 'AUTENTICADO'">
      <AppWarning
        title="Cadastro Pendente"
        description="Por favor, entre em contato com a administração da escola para finalizar seu cadastro e liberar o acesso completo ao sistema."
      />
    </div>
    <div v-else>
      <AppPage> </AppPage>
    </div>
  </div>
</template>

<script lang="ts" setup>
  const userStore = useUserStore();
  const user = computed(() => userStore.userPreferences);
</script>
