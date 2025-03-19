<template>
  <div>
    <div class="icon-container">
      <Icon name="solar:map-point-school-broken" class="icon" />
    </div>
    <UiCardHeader class="header">
      <UiCardTitle class="title">Faça seu Login</UiCardTitle>
      <UiCardDescription>
        <p v-if="auth.step === 'email'">Digite seu email para continuar.</p>
        <p v-if="auth.step === 'password'">Digite sua senha para Entrar.</p>
      </UiCardDescription>
    </UiCardHeader>
    <UiCardContent>
      <div v-if="auth.error" class="error-message">
        <p v-html="auth.error"></p>
      </div>
      <form @submit="auth.validateAndProceed">
        <div class="form-grid">


          <AuthInput v-if="auth.step === 'email'" :key="'email-input'" v-model="auth.email" model-name="email"
            placeholder="name@example.com" type="email" autocomplete="email" :disabled="auth.loading" />


          <AuthInput v-if="auth.step === 'password'" :key="'password-input'" v-model="auth.password"
            model-name="password" placeholder="********" type="password" :disabled="auth.loading" />
          <UiButton type="submit" :disabled="auth.loading" class="submit-button">
            <Icon name="lucide:loader-2" color="white" v-if="auth.loading" class="loading-icon" />
            <p v-if="auth.step === 'email'">Continuar</p>
            <p v-if="auth.step === 'password'">Entrar</p>
          </UiButton>
        </div>
      </form>
    </UiCardContent>
    <UiCardFooter class="footer">
      <p class="footer-text">
        <NuxtLink data-testid="signup-link" to="/auth/signup" class="register-link"> Cadastre-se </NuxtLink>
      </p>
    </UiCardFooter>
  </div>
</template>

<script setup lang="ts">
  import { useAuthStore } from "~/stores/AuthStore";

  const auth = useAuthStore();
  auth.setFormType("auth");
</script>

<style scoped>
  .icon-container {
    @apply flex items-center justify-center;
  }

  .icon {
    @apply h-16 w-16 text-green-600;
  }

  .header {
    @apply flex flex-col space-y-4 text-center;
  }

  .title {
    @apply text-2xl;
  }

  .error-message {
    @apply mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-600;
    @apply dark:bg-red-900/30 dark:text-red-400;
  }

  .form-grid {
    @apply grid w-full items-center gap-4;
  }

  .submit-button {
    @apply h-12;
  }

  .loading-icon {
    @apply mr-2 h-4 w-4 animate-spin;
  }

  .footer {
    @apply text-center text-sm text-muted-foreground;
  }

  .footer-text {
    @apply w-full;
  }

  .register-link {
    @apply underline underline-offset-4 hover:text-primary;
  }
</style>
