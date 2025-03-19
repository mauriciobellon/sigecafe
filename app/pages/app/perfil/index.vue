<template>
  <div>
    <AppPage>
      <UiCard class="mt-10 mb-6">
        <UiCardContent>
          <div v-if="usuarioStore.loading" class="flex justify-center py-4">
            <Icon name="lucide:loader-2" class="h-6 w-6 animate-spin" />
          </div>

          <form v-else @submit.prevent="handleSubmit" class="space-y-4">
            <div v-if="error" class="rounded-lg border border-destructive p-3 text-destructive">
              <p>{{ error }}</p>
            </div>

            <div v-if="success" class="rounded-lg border border-success p-3 text-success">
              <p>Perfil atualizado com sucesso!</p>
            </div>

            <div class="space-y-2">
              <label for="name" class="text-sm font-medium">Nome Completo</label>
              <AuthInput id="name" v-model="form.name" type="text" placeholder="Digite seu nome completo"
                :disabled="loading" />
            </div>

            <div class="space-y-2">
              <label for="email" class="text-sm font-medium">Email</label>
              <AuthInput id="email" v-model="form.email" type="email" placeholder="Digite seu email"
                :disabled="loading" />
            </div>

            <div class="space-y-2">
              <label for="celular" class="text-sm font-medium">Celular</label>
              <AuthInput id="celular" v-model="form.celular" type="tel" placeholder="(99) 9 9999-9999"
                :disabled="loading" @input="maskPhoneNumber" maxlength="16" />
            </div>

            <div class="flex justify-between gap-4">
              <UiButton type="submit" :disabled="loading" class="flex-1">
                <Icon v-if="loading" name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
                {{ loading ? 'Salvando...' : 'Salvar Alterações' }}
              </UiButton>
            </div>
          </form>
        </UiCardContent>
      </UiCard>
    </AppPage>
  </div>
</template>

<script lang="ts" setup>
  const loading = ref(false)
  const error = ref('')
  const success = ref(false)

  const auth = useAuth()
  const usuarioStore = useUsuarioStore()

  const form = reactive({
    name: '',
    email: '',
    celular: ''
  })

  // Carrega os dados iniciais apenas se estiver autenticado
  onMounted(async () => {
    const usuario = await usuarioStore.fetchUsuarioPreferences()
    form.name = usuario.name
    form.email = usuario.email
    form.celular = usuario.celular || ''
  })

  function maskPhoneNumber(event: Event) {
    const input = event.target as HTMLInputElement
    let value = input.value.replace(/\D/g, '') // Remove non-digits

    if (value.length <= 11) {
      value = value.replace(/^(\d{2})(\d{1})(\d{4})(\d{4}).*/, '($1) $2 $3-$4')
      form.celular = value
    }
  }

  function isValidPhone(phone: string) {
    const digits = phone.replace(/\D/g, '')
    return digits.length === 11
  }

  async function handleSubmit() {
    error.value = ''
    success.value = false

    if (!form.name.trim() || !form.email.trim()) {
      error.value = 'Nome e email são obrigatórios'
      return
    }

    try {
      loading.value = true

      const response = await $fetch('/api/usuario/perfil', {
        method: 'PUT',
        credentials: 'include',
        body: {
          name: form.name,
          email: form.email,
          celular: form.celular
        }
      })

      if (!response.success) {
        throw new Error(response.message)
      } else {
        // Atualiza os dados no store
        usuarioStore.usuarioPreferences.name = form.name
        usuarioStore.usuarioPreferences.email = form.email
        usuarioStore.usuarioPreferences.celular = form.celular
        success.value = true
      }
    } catch (err: any) {
      error.value = err.data?.message || err.message || 'Erro ao atualizar perfil'
    } finally {
      loading.value = false
    }
  }
</script>