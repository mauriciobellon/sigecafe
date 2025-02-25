<template>
  <div>
    <AppPage>
      <UiCard class="mt-10 mb-6">
        <UiCardContent>
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div v-if="error" class="rounded-lg border border-destructive p-3 text-destructive">
              <p>{{ error }}</p>
            </div>

            <div v-if="success" class="rounded-lg border border-success p-3 text-success">
              <p>Perfil atualizado com sucesso!</p>
            </div>

            <div class="space-y-2">
              <label for="name" class="text-sm font-medium">Nome</label>
              <AuthInput id="name" v-model="form.nome" type="text" placeholder="Digite seu nome completo"
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

  const form = reactive({
    nome: '',
    celular: ''
  })

  const escolaStore = useEscolaStore()

  onMounted(async () => {
    await escolaStore.fetchEscola()
    form.nome = escolaStore.escola?.nome || ''
    form.celular = escolaStore.escola?.celular || ''
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

    if (!form.nome.trim() || !form.celular.trim()) {
      error.value = 'Nome e celular são obrigatórios'
      return
    }

    if (!escolaStore.escola) {
      error.value = 'Dados da escola não encontrados'
      return
    }

    await escolaStore.updateEscola({
      ...escolaStore.escola,
      nome: form.nome,
      celular: form.celular
    })
    success.value = true
  }
</script>