<template>
  <div>
    <AppPage>
      <!-- Tabela de Compradores -->
      <UiCard class="mt-10 mb-6">
        <UiCardHeader>
          <UiCardTitle>Compradores</UiCardTitle>
          <UiCardDescription>
            Gerencie os compradores para o controle de transações.
          </UiCardDescription>
        </UiCardHeader>
        <UiCardContent>
          <div class="mb-4 flex justify-between">
            <!-- Botão para abrir o modal de novo comprador -->
            <UiButton @click="newComprador">
              <Icon name="lucide:plus" class="mr-2 h-4 w-4" />
              Novo Comprador
            </UiButton>
          </div>

          <!-- Tabela de compradores -->
          <div class="rounded-md border">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Celular</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endereço</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cidade</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="comprador in compradores" :key="comprador.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ comprador.nome }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ comprador.celular }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ comprador.documento }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ comprador.endereco }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ comprador.cidade }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ comprador.estado }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button @click="editComprador(comprador)" class="text-indigo-600 hover:text-indigo-900 mr-2">
                      <Icon name="lucide:edit-2" class="h-4 w-4" />
                    </button>
                    <button @click="deleteComprador(comprador)" class="text-red-600 hover:text-red-900">
                      <Icon name="lucide:trash-2" class="h-4 w-4" />
                    </button>
                  </td>
                </tr>
                <tr v-if="compradores.length === 0">
                  <td colspan="7" class="px-6 py-4 text-center text-sm text-gray-500">
                    Nenhum comprador encontrado
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </UiCardContent>
      </UiCard>
    </AppPage>

    <!-- Modal de Cadastro de Comprador -->
    <AlertDialogRoot v-model:open="dialogOpen">
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
            {{ isEditing ? "Editar Comprador" : "Novo Comprador" }}
          </AlertDialogTitle>

          <AlertDialogDescription class="mb-5 mt-4 text-[15px] leading-normal">
            <form @submit.prevent="saveComprador">
              <div class="grid w-full items-center gap-4">
                <div class="flex flex-col space-y-1.5">
                  <UiLabel for="nome">Nome</UiLabel>
                  <input id="nome" v-model="compradorForm.nome" type="text" placeholder="Insira seu nome ou empresa"class="alert-input" required />

                  <UiLabel for="celular">Celular</UiLabel>
                  <input id="celular" v-model="compradorForm.celular" type="text" placeholder="(11) 98765-4321" class="alert-input" required />

                  <UiLabel for="documento">Documento</UiLabel>
                  <input id="documento" v-model="compradorForm.documento" type="text" placeholder="CPF ou CNPJ" class="alert-input" required />

                  <UiLabel for="endereco">Endereço</UiLabel>
                  <input id="endereco" v-model="compradorForm.endereco" type="text" placeholder="Insira o endereço" class="alert-input" />

                  <UiLabel for="cidade">Cidade</UiLabel>
                  <input id="cidade" v-model="compradorForm.cidade" type="text" placeholder="Insira sua cidade" class="alert-input" />

                  <UiLabel for="estado">Estado</UiLabel>
                  <select id="estado" v-model="compradorForm.estado" class="alert-input" required>
                    <option value="">Selecione um estado</option>
                    <!-- Loop para renderizar as siglas dos estados -->
                    <option v-for="estado in estados" :key="estado" :value="estado">{{ estado }}</option>
                  </select>
                </div>
              </div>
            </form>
          </AlertDialogDescription>

          <div class="flex justify-end gap-[25px]">
            <AlertDialogCancel
              class="text-mauve11 bg-mauve4 hover:bg-mauve5 focus:shadow-mauve7 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-semibold leading-none outline-none focus:shadow-[0_0_0_2px]"
            >
              Voltar
            </AlertDialogCancel>
            <AlertDialogAction
              class="text-red11 bg-red4 hover:bg-red5 focus:shadow-red7 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-semibold leading-none outline-none focus:shadow-[0_0_0_2px]"
              type="submit"
            >
              Salvar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialogRoot>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useToast } from "~/composables/useToast";
import { definePageMeta } from "#imports";
import languageBR from "datatables.net-plugins/i18n/pt-BR.mjs";
import type { Config } from "datatables.net";
import type { AssociadoDTO, AssociadoCreateDTO, AssociadoUpdateDTO, AssociadoCompleteDTO } from "~/types/api";

// Extended AssociadoDTO to include createdAt/updatedAt that are in the database
interface AssociadoCompleteDTO extends AssociadoDTO {
  createdAt?: Date;
  updatedAt?: Date;
}

definePageMeta({
  middleware: ["auth"]
});

const toast = useToast();
const tableRef = ref<any>(null);
const compradores = ref<AssociadoCompleteDTO[]>([]);
const loading = ref(false);
const dialogOpen = ref(false);  // Control modal state
const isEditing = ref(false);  // Control edit state
const selectedComprador = ref<AssociadoCompleteDTO | null>(null);

// Form data for creating or editing a comprador
const compradorForm = ref<AssociadoCreateDTO & { id?: number }>({
  nome: "",
  celular: "",
  tipo: "COMPRADOR", // Ensure 'tipo' is always present
  documento: "",
  endereco: "",
  cidade: "",
  estado: "",
  cooperativaId: 0, // Will be filled in the saveComprador function
});

const estados = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

const options: Config = {
  paging: true,
  ordering: true,
  info: false,
  language: languageBR,
};

onMounted(() => {
  // Simulate loading compradores
  compradores.value = [
    { id: 1, nome: "João da Silva", celular: "(11) 98765-4321", documento: "12345678900", endereco: "Rua A, 123", cidade: "São Paulo", estado: "SP", tipo: "COMPRADOR", cooperativaId: 1 },
    { id: 2, nome: "Empresa Cafeeira", celular: "(21) 98765-4321", documento: "6041.2353/5856-84", endereco: "Rua B, 456", cidade: "Rio de Janeiro", estado: "RJ", tipo: "COMPRADOR", cooperativaId: 2 },
  ];
});

const newComprador = () => {
  isEditing.value = false;
  compradorForm.value = {
    nome: "",
    celular: "",
    tipo: "COMPRADOR", // Ensure 'tipo' is always "COMPRADOR"
    documento: "",
    endereco: "",
    cidade: "",
    estado: "",
    cooperativaId: 0, // Ensure cooperativaId is set correctly
  };
  dialogOpen.value = true;
};

const saveComprador = () => {
  if (isEditing.value) {
    // Update comprador
    toast.success("Comprador atualizado com sucesso");
  } else {
    // Create new comprador
    toast.success("Novo comprador criado com sucesso");
  }
  dialogOpen.value = false;
};

const editComprador = (comprador: AssociadoCompleteDTO) => {
  isEditing.value = true;
  compradorForm.value = { ...comprador };
  dialogOpen.value = true;
};

const deleteComprador = (comprador: AssociadoCompleteDTO) => {
  compradores.value = compradores.value.filter(c => c.id !== comprador.id);
  toast.success("Comprador excluído com sucesso");
};
</script>