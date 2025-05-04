<template>
  <div class="container mx-auto p-6 space-y-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold">Livro de Ofertas</h1>
    </div>

    <!-- Offer form -->
    <Card class="p-4">
      <div class="flex flex-col md:flex-row md:items-end gap-4">
        <div class="w-full md:w-1/4">
          <label class="block text-sm font-medium mb-1">Lado</label>
          <Select v-if="canChooseSide" v-model="side">
            <option value="BUY">Compra</option>
            <option value="SELL">Venda</option>
          </Select>
          <div v-else class="p-2 rounded border border-gray-300 flex items-center gap-2">
            <div :class="side === 'BUY' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'" class="font-medium px-3 py-1 rounded border text-sm w-full text-center">
              {{ side === 'BUY' ? 'Compra' : 'Venda' }}
            </div>
          </div>
        </div>
        <div class="w-full md:w-1/4">
          <label class="block text-sm font-medium mb-1">Preço</label>
          <Input
            v-model="price"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="R$"
            :class="{'border-red-300 focus:border-red-500': priceError}"
          />
          <p v-if="priceError" class="text-xs text-red-500 mt-1">
            {{ priceError }}
          </p>
        </div>
        <div class="w-full md:w-1/4">
          <label class="block text-sm font-medium mb-1">Quantidade (sacas)</label>
          <Input
            v-model="quantity"
            type="number"
            step="1"
            min="1"
            placeholder="0"
            :class="{'border-red-300 focus:border-red-500': quantityError}"
          />
          <p v-if="quantityError" class="text-xs text-red-500 mt-1">
            {{ quantityError }}
          </p>
        </div>
        <div class="w-full md:w-1/4 mt-4 md:mt-0">
          <Button
            @click="submit"
            variant="default"
            class="w-full"
            :disabled="isSubmitting || offerStore.loading"
          >
            {{ isSubmitting ? 'Enviando...' : 'Enviar Oferta' }}
          </Button>
        </div>
      </div>
    </Card>

    <!-- Error message -->
    <div v-if="offerStore.error" class="bg-red-50 border border-red-200 text-red-600 p-3 rounded">
      {{ offerStore.error }}
    </div>

    <!-- Combined offer table -->
    <Card class="p-4">

      <ScrollArea class="h-[400px] p-0 mx-[-16px] my-[-16px]">
        <table class="min-w-full">
          <thead class="bg-gray-50 sticky top-0">
            <tr>
              <th class="px-4 py-2 text-left text-sm font-semibold">Tipo</th>
              <th class="px-4 py-2 text-left text-sm font-semibold">Preço</th>
              <th class="px-4 py-2 text-left text-sm font-semibold">Qtd.</th>
              <th class="px-4 py-2 text-left text-sm font-semibold">Usuário</th>
              <th class="px-4 py-2 text-left text-sm font-semibold">Data</th>
              <th class="px-4 py-2 w-10"></th><!-- Column for cancel button -->
            </tr>
          </thead>
          <tbody>
            <!-- Empty state message -->
            <tr v-if="sortedAsks.length === 0 && sortedBids.length === 0">
              <td colspan="6" class="px-4 py-2 text-center text-gray-500">
                Nenhuma oferta disponível
              </td>
            </tr>

            <!-- Sell offers (sorted by price descending) -->
            <template v-for="offer in sortedAsks" :key="'sell-'+offer.id">
              <tr class="border-t">
                <td class="px-4 py-2">
                  <span class="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                    Venda
                  </span>
                </td>
                <td class="px-4 py-2 text-red-600 font-medium">
                  R$ {{ offer.price.toFixed(2) }}
                </td>
                <td class="px-4 py-2">{{ Math.round(offer.quantity) }}</td>
                <td class="px-4 py-2">{{ offer.user }}</td>
                <td class="px-4 py-2">{{ formatDate(offer.createdAt) }}</td>
                <td class="px-4 py-2">
                  <button
                    v-if="isCurrentUserOffer(offer)"
                    @click="cancelOffer(offer)"
                    class="text-gray-500 hover:text-red-600 transition-colors focus:outline-none"
                    title="Cancelar oferta"
                  >
                    <span class="font-bold">×</span>
                  </button>
                </td>
              </tr>
            </template>

            <!-- Buy offers (sorted by price descending) -->
            <template v-for="offer in sortedBids" :key="'buy-'+offer.id">
              <tr class="border-t">
                <td class="px-4 py-2">
                  <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                    Compra
                  </span>
                </td>
                <td class="px-4 py-2 text-green-600 font-medium">
                  R$ {{ offer.price.toFixed(2) }}
                </td>
                <td class="px-4 py-2">{{ Math.round(offer.quantity) }}</td>
                <td class="px-4 py-2">{{ offer.user }}</td>
                <td class="px-4 py-2">{{ formatDate(offer.createdAt) }}</td>
                <td class="px-4 py-2">
                  <button
                    v-if="isCurrentUserOffer(offer)"
                    @click="cancelOffer(offer)"
                    class="text-gray-500 hover:text-red-600 transition-colors focus:outline-none"
                    title="Cancelar oferta"
                  >
                    <span class="font-bold">×</span>
                  </button>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </ScrollArea>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useOfferStore } from '~/stores/OfferStore'
import { useUsuarioStore } from '~/stores/UserStore'
import type { AssociadoDTO, OfferDTO } from '~/types/api'
import Input from '~/components/Ui/Input.vue'
import Button from '~/components/Ui/Button.vue'
import Card from '~/components/Ui/Card/Card.vue'
import Select from '~/components/Ui/Select/Select.vue'
import ScrollArea from '~/components/Ui/ScrollArea/ScrollArea.vue'

const offerStore = useOfferStore()
const usuarioStore = useUsuarioStore()
const side = ref<'BUY' | 'SELL'>('BUY')
const price = ref<string>('')
const quantity = ref<string>('')
const priceError = ref<string>('')
const quantityError = ref<string>('')
const canChooseSide = ref(true)
const isSubmitting = ref(false)

// Sort asks (sell offers) by price descending (highest price first - same as bids)
const sortedAsks = computed(() =>
  [...offerStore.asks].sort((a, b) => b.price - a.price)
)

// Sort bids (buy offers) by price descending (highest price first)
const sortedBids = computed(() =>
  [...offerStore.bids].sort((a, b) => b.price - a.price)
)

function formatDate(input: Date | string) {
  const date = new Date(input)
  return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

// Check if an offer belongs to the current user by comparing with the same name
function isCurrentUserOffer(offer: OfferDTO): boolean {
  if (!usuarioStore.usuarioPreferences) return false

  // Compare names since we don't have direct access to ID
  return offer.user === usuarioStore.usuarioPreferences.name
}

// Cancel an offer
async function cancelOffer(offer: OfferDTO) {
  try {
    await offerStore.cancelOffer(offer.id)
    await offerStore.fetchOffers() // Refresh the list after cancellation
  } catch (error) {
    console.error('Erro ao cancelar oferta:', error)
  }
}

async function submit() {
  // Reset error messages
  priceError.value = ''
  quantityError.value = ''
  offerStore.error = null

  // Validate price
  const p = parseFloat(price.value)
  if (!p || p <= 0) {
    priceError.value = 'Informe um preço válido'
    return
  }

  // Validate quantity
  const q = parseInt(quantity.value)
  if (!q || q <= 0) {
    quantityError.value = 'Informe uma quantidade válida'
    return
  }

  try {
    isSubmitting.value = true
    await offerStore.createOffer({ side: side.value, price: p, quantity: q })

    // Reset form on success
    price.value = ''
    quantity.value = ''
  } catch (error) {
    console.error('Erro ao criar oferta:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Fetch user role and order book on mount
onMounted(async () => {
  await usuarioStore.fetchUsuarioPreferences()
  const assocId = usuarioStore.usuarioPreferences?.associadoId

  // Default to allowing both sides
  canChooseSide.value = true

  if (assocId) {
    try {
      const res = await $fetch<{ success: boolean; data: AssociadoDTO }>(`/api/associado/${assocId}`, { credentials: 'include' })
      if (res.success) {
        const tipo = res.data.tipo
        if (tipo === 'PRODUTOR') {
          // Produtores can only SELL
          side.value = 'SELL'
          canChooseSide.value = false
        } else if (tipo === 'COMPRADOR') {
          // Compradores can only BUY
          side.value = 'BUY'
          canChooseSide.value = false
        }
      }
    } catch (e) {
      console.error('Erro ao buscar tipo de associado:', e)
    }
  }

  await offerStore.fetchOffers()
})
</script>