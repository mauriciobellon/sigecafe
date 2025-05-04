<template>
  <div>
    <AppPage>
      <UiCard class="mt-10 mb-6">
        <UiCardHeader>
          <UiCardTitle>Compradores</UiCardTitle>
          <UiCardDescription>
            Gerencie seus compradores cadastrados.
          </UiCardDescription>
        </UiCardHeader>
        <UiCardContent>
          <div class="mb-4 flex justify-between">
            <UiButton @click="openNewCompradorModal">
              <Icon name="lucide:plus" class="mr-2 h-4 w-4" />
              Novo Comprador
            </UiButton>

            <div class="flex items-center space-x-2">
              <div class="relative w-72">
                <label for="filter" class="sr-only">Filtrar</label>
                <input
                  id="filter"
                  v-model="filter"
                  placeholder="Buscar compradores..."
                  class="h-12 w-full pl-10 pr-3 rounded-lg border border-input bg-background text-base shadow-md transition-colors file:border-0 file:bg-transparent file:text-base file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                />
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <Icon name="lucide:search" class="h-5 w-5" />
                </span>
              </div>
            </div>
          </div>

          <div class="rounded-md border dark:border-gray-700">
            <div class="overflow-x-auto w-full">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-black text-gray-900 dark:text-white">
                <thead class="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nome</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Celular</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Documento</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Endereço</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cidade</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody class="bg-white dark:bg-black divide-y divide-gray-200 dark:divide-gray-700">
                  <tr v-for="comprador in filteredCompradores" :key="comprador.id">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ comprador.nome }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ comprador.celular }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ comprador.documento }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ comprador.endereco }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ comprador.cidade }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ comprador.estado }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button @click="editComprador(comprador)" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 mr-2">
                        <Icon name="lucide:edit-2" class="h-4 w-4" />
                      </button>
                      <button @click="deleteComprador(comprador)" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200">
                        <Icon name="lucide:trash-2" class="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                  <tr v-if="filteredCompradores.length === 0">
                    <td colspan="7" class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-300">
                      Nenhum comprador encontrado
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </UiCardContent>
      </UiCard>
    </AppPage>

    <!-- Modal para novo/edição de comprador -->
    <AlertDialogRoot v-model:open="isNewCompradorOpen">
      <AlertDialogPortal>
        <AlertDialogOverlay
          class="data-[state=open]:animate-overlayShow fixed inset-0 z-30 bg-background/80 backdrop-blur-sm"
        >
          <div
            class="absolute h-full w-full bg-[radial-gradient(theme(colors.border)_1px,transparent_1px)] [background-size:15px_15px] [mask-image:radial-gradient(ellipse_600px_600px_at_50%_50%,#000_10%,transparent_100%)] dark:bg-[radial-gradient(theme(colors.border)_1px,transparent_1px)]"
          />
        </AlertDialogOverlay>

        <AlertDialogContent
          class="data-[state=open]:animate-contentShow fixed left-[50%] top-[50%] z-[100] max-h-[85vh] w-[90vw] max-w-[700px] translate-x-[-50%] translate-y-[-50%] rounded-lg border border-input bg-primary-foreground p-[25px] text-[15px] shadow-[0_0px_50px_-30px_rgba(0,0,0,0.5)] focus:outline-none dark:bg-black dark:shadow-[0_0px_80px_-50px_rgba(0,0,0,0.5)] dark:shadow-gray-500 sm:w-[700px]"
        >
          <AlertDialogTitle class="mb-4 text-xl font-semibold">
            {{ editingComprador ? "Editar Comprador" : "Novo Comprador" }}
          </AlertDialogTitle>

          <AlertDialogDescription class="mb-5 mt-4 text-[15px] leading-normal">
            <form @submit.prevent="saveComprador">
              <div v-if="errorMessage" class="mb-4 p-2 rounded bg-red-100 text-red-800 border border-red-300">
                {{ errorMessage }}
              </div>
              <div class="grid w-full items-center gap-4">
                <div class="flex flex-col space-y-1.5">
                  <UiLabel for="nome">Nome</UiLabel>
                  <UiInput id="nome" v-model="compradorForm.nome" required />
                  <UiLabel for="celular">Celular</UiLabel>
                  <UiInput id="celular" v-model="compradorForm.celular" required />
                  <UiLabel for="documento">Documento</UiLabel>
                  <UiInput id="documento" v-model="compradorForm.documento" required />
                  <UiLabel for="endereco">Endereço</UiLabel>
                  <UiInput id="endereco" v-model="compradorForm.endereco" />
                  <UiLabel for="cidade">Cidade</UiLabel>
                  <UiInput id="cidade" v-model="compradorForm.cidade" />
                  <UiLabel for="estado">Estado</UiLabel>
                  <UiSelect v-model="compradorForm.estado" id="estado" required>
                    <option value="">Selecione um estado</option>
                    <option v-for="estado in estados" :key="estado" :value="estado">{{ estado }}</option>
                  </UiSelect>
                </div>
              </div>
              <div class="flex justify-end gap-[25px] mt-6">
                <AlertDialogCancel
                  class="text-mauve11 bg-mauve4 hover:bg-mauve5 focus:shadow-mauve7 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-semibold leading-none outline-none focus:shadow-[0_0_0_2px]"
                >
                  Voltar
                </AlertDialogCancel>
                <button
                  class="text-red11 bg-red4 hover:bg-red5 focus:shadow-red7 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-semibold leading-none outline-none focus:shadow-[0_0_0_2px]"
                  type="submit"
                >
                  Salvar
                </button>
              </div>
            </form>
          </AlertDialogDescription>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialogRoot>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useToast } from "~/composables/useToast";
import { definePageMeta } from "#imports";
import languageBR from "datatables.net-plugins/i18n/pt-BR.mjs";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogRoot,
  AlertDialogTitle,
} from "radix-vue";
import type { Config, ConfigColumns } from "datatables.net";
import UiSelect from '@/components/Ui/Select/Select.vue';
import UiInput from '@/components/Ui/Input.vue';

// Tipagem do comprador
interface Comprador {
  id?: number;
  nome: string;
  celular: string;
  documento: string;
  endereco: string;
  cidade: string;
  estado: string;
}

definePageMeta({
  middleware: ["auth"]
});

const toast = useToast();
const tableRef = ref<any>(null);
const compradores = ref<Comprador[]>([]);
const selectedRows = ref(0);
const isNewCompradorOpen = ref(false);
const editingComprador = ref(false);
const compradorForm = ref<Comprador>({
  id: undefined,
  nome: "",
  celular: "",
  documento: "",
  endereco: "",
  cidade: "",
  estado: ""
});
const errorMessage = ref("");
const filter = ref('');

const estados = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

onMounted(async () => {
  await fetchCompradores();
});

async function fetchCompradores() {
  try {
    const response = await fetch('/api/associado?tipo=COMPRADOR');
    if (!response.ok) throw new Error('Erro ao buscar compradores');
    const data = await response.json();
    compradores.value = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : (Array.isArray(data.results) ? data.results : []));
  } catch (error) {
    toast.toast({ title: 'Erro', description: 'Não foi possível carregar os compradores.', variant: 'destructive' });
  }
}

const filteredCompradores = computed(() => {
  return compradores.value.filter(comprador => {
    let filterMatch = true;
    if (filter.value.trim() !== '') {
      const nome = (comprador.nome || '').toLowerCase();
      const celular = (comprador.celular || '').toLowerCase();
      const documento = (comprador.documento || '').toLowerCase();
      const cidade = (comprador.cidade || '').toLowerCase();
      const estado = (comprador.estado || '').toLowerCase();
      const filtro = filter.value.toLowerCase();
      filterMatch =
        nome.includes(filtro) ||
        celular.includes(filtro) ||
        documento.includes(filtro) ||
        cidade.includes(filtro) ||
        estado.includes(filtro);
    }
    return filterMatch;
  });
});

const openNewCompradorModal = () => {
  compradorForm.value = {
    id: undefined,
    nome: '',
    celular: '',
    documento: '',
    endereco: '',
    cidade: '',
    estado: ''
  };
  editingComprador.value = false;
  isNewCompradorOpen.value = true;
};

const saveComprador = async () => {
  errorMessage.value = "";
  try {
    let response;
    if (editingComprador.value && compradorForm.value.id) {
      response = await fetch(`/api/associado/${compradorForm.value.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...compradorForm.value, tipo: 'COMPRADOR' }),
      });
    } else {
      response = await fetch('/api/associado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...compradorForm.value, tipo: 'COMPRADOR' }),
      });
    }
    if (!response.ok) {
      let msg = 'Erro ao salvar comprador';
      try {
        const data = await response.json();
        msg = data.statusMessage || data.message || msg;
      } catch {}
      errorMessage.value = msg;
      return;
    }
    await fetchCompradores();
    isNewCompradorOpen.value = false;
  } catch (error) {
    errorMessage.value = (error as any)?.message || 'Erro desconhecido ao salvar comprador';
    toast.toast({ title: "Erro", description: "Não foi possível salvar o comprador.", variant: "destructive" });
  }
};

const editComprador = (comprador: any) => {
  compradorForm.value = { ...comprador };
  editingComprador.value = true;
  isNewCompradorOpen.value = true;
};

const deleteComprador = async (comprador: any) => {
  try {
    const response = await fetch(`/api/associado/${comprador.id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Erro ao deletar comprador');
    toast.toast({ title: "Sucesso", description: "Comprador removido com sucesso." });
    await fetchCompradores();
    if (tableRef.value) {
      tableRef.value.clear();
      // @ts-ignore
      tableRef.value.rows.add(compradores.value).draw();
    }
  } catch (error) {
    toast.toast({ title: "Erro", description: "Não foi possível remover o comprador.", variant: "destructive" });
  }
};
</script>

<style scoped>
.alert-input {
  height: 2.5rem;
  width: 100%;
  border-radius: 0.375rem;
  border: 1px solid var(--input-border);
  background-color: var(--background);
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
}

.alert-input:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--ring);
  box-shadow: 0 0 0 2px var(--ring), 0 0 0 4px var(--background);
}

.alert-input:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>