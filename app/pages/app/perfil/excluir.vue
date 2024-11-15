<template>
  <div>
    <AppPage>
      <SharedMsgDanger title="Excluir Conta"
        description="Você tem certeza que deseja excluir sua conta? Essa ação é irreversível e todos os seus dados serão perdidos." />
      <UiButton data-testid="delete-account-button" variant="destructive" @click="userStore.deleteUser()">Excluir Conta
      </UiButton>
    </AppPage>
  </div>
</template>

<script lang="ts" setup>
  const userStore = useUserStore();
</script>
