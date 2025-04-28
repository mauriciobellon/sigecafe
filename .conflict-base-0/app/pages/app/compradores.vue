<template>
  <div>
    <AppPage>
      <UiCard class="mt-10 mb-6">
        <UiCardHeader>
          <UiCardTitle>Compradores</UiCardTitle>
          <UiCardDescription>
            Gerencie os compradores de café associados à cooperativa.
          </UiCardDescription>
        </UiCardHeader>
        <UiCardContent>
          <ClientOnly>
            <UiDatatable @ready="initializeTable" :options="options" :columns="columns" :data="compradores">
              <template #actions="{ cellData }" class="m-0 flex items-center p-0">
                <UiButton variant="outline" @click="viewDetails(cellData, $event)" class="m-0 mr-2 h-8 px-2">
                  Detalhes
                </UiButton>
                <UiButton variant="outline" @click="editComprador(cellData, $event)" class="m-0 mr-2 h-8 px-2">
                  Editar
                </UiButton>
              </template>
            </UiDatatable>
          </ClientOnly>
        </UiCardContent>
      </UiCard>

      <!-- Modal para adicionar/editar comprador -->
      <UiDialog v-model:open="dialogOpen">
        <UiDialogContent class="sm:max-w-[500px]">
          <UiDialogHeader>
            <UiDialogTitle>{{ isEditing ? 'Editar Comprador' : 'Novo Comprador' }}</UiDialogTitle>
            <UiDialogDescription>
              {{ isEditing ? 'Atualize os dados do comprador' : 'Adicione um novo comprador ao sistema' }}
            </UiDialogDescription>
          </UiDialogHeader>
          <form @submit.prevent="saveComprador">
            <div class="grid gap-4 py-4">
              <div class="grid grid-cols-4 items-center gap-4">
                <UiLabel for="nome" class="text-right">Nome</UiLabel>
                <input id="nome" v-model="compradorForm.nome" class="col-span-3 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" required />
              </div>
              <div class="grid grid-cols-4 items-center gap-4">
                <UiLabel for="celular" class="text-right">Celular</UiLabel>
                <input id="celular" v-model="compradorForm.celular" class="col-span-3 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="(11) 98765-4321" />
              </div>
              <div class="grid grid-cols-4 items-center gap-4">
                <UiLabel for="documento" class="text-right">Documento</UiLabel>
                <input id="documento" v-model="compradorForm.documento" class="col-span-3 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="CPF ou CNPJ" />
              </div>
              <div class="grid grid-cols-4 items-center gap-4">
                <UiLabel for="endereco" class="text-right">Endereço</UiLabel>
                <input id="endereco" v-model="compradorForm.endereco" class="col-span-3 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
              </div>
              <div class="grid grid-cols-4 items-center gap-4">
                <UiLabel for="cidade" class="text-right">Cidade</UiLabel>
                <input id="cidade" v-model="compradorForm.cidade" class="col-span-3 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
              </div>
              <div class="grid grid-cols-4 items-center gap-4">
                <UiLabel for="estado" class="text-right">Estado</UiLabel>
                <select id="estado" v-model="compradorForm.estado" class="col-span-3 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <option value="">Selecione um estado</option>
                  <option v-for="estado in estados" :key="estado" :value="estado">{{ estado }}</option>
                </select>
              </div>
            </div>
            <UiDialogFooter>
              <UiButton type="button" variant="outline" @click="dialogOpen = false">Cancelar</UiButton>
              <UiButton type="submit">{{ isEditing ? 'Atualizar' : 'Salvar' }}</UiButton>
            </UiDialogFooter>
          </form>
        </UiDialogContent>
      </UiDialog>

      <!-- Modal de detalhes -->
      <UiDialog v-model:open="detailsDialogOpen">
        <UiDialogContent class="sm:max-w-[500px]">
          <UiDialogHeader>
            <UiDialogTitle>Detalhes do Comprador</UiDialogTitle>
          </UiDialogHeader>
          <div class="py-4" v-if="selectedComprador">
            <div class="grid grid-cols-3 gap-4">
              <div class="font-semibold">Nome:</div>
              <div class="col-span-2">{{ selectedComprador.nome }}</div>
              <div class="font-semibold">Celular:</div>
              <div class="col-span-2">{{ selectedComprador.celular || 'Não informado' }}</div>
              <div class="font-semibold">Documento:</div>
              <div class="col-span-2">{{ selectedComprador.documento || 'Não informado' }}</div>
              <div class="font-semibold">Endereço:</div>
              <div class="col-span-2">{{ selectedComprador.endereco || 'Não informado' }}</div>
              <div class="font-semibold">Cidade:</div>
              <div class="col-span-2">{{ selectedComprador.cidade || 'Não informado' }}</div>
              <div class="font-semibold">Estado:</div>
              <div class="col-span-2">{{ selectedComprador.estado || 'Não informado' }}</div>
              <div class="font-semibold">Cadastrado em:</div>
              <div class="col-span-2">{{ formatDate(selectedComprador.createdAt) }}</div>
            </div>
          </div>
          <UiDialogFooter>
            <UiButton @click="detailsDialogOpen = false">Fechar</UiButton>
          </UiDialogFooter>
        </UiDialogContent>
      </UiDialog>
    </AppPage>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useToast } from "~/composables/useToast";
import { definePageMeta } from "#imports";
import languageBR from "datatables.net-plugins/i18n/pt-BR.mjs";
import type { Config, ConfigColumns } from "datatables.net";
import type { AssociadoDTO, AssociadoCreateDTO, AssociadoUpdateDTO, UsuarioDTO } from "~/types/api";

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
const dialogOpen = ref(false);
const detailsDialogOpen = ref(false);
const isEditing = ref(false);
const selectedComprador = ref<AssociadoCompleteDTO | null>(null);

const compradorForm = ref<AssociadoCreateDTO & { id?: number }>({
  nome: "",
  celular: "",
  tipo: "COMPRADOR",
  documento: "",
  endereco: "",
  cidade: "",
  estado: "",
  cooperativaId: 0, // Isso será preenchido na função saveComprador
});

const estados = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

const options: Config = {
  dom: "<'flex flex-col lg:flex-row w-full lg:items-start lg:justify-between gap-5 mb-5 lg:pr-1'Bf><'border rounded-lg't><'flex flex-col lg:flex-row gap-5 items-center lg:justify-between w-full pt-3 p-5 m-auto'lp>",
  searching: true,
  language: languageBR,
  paging: true,
  ordering: true,
  responsive: true,
  autoWidth: true,
  select: {
    style: "single",
  },
  buttons: [
    {
      text: "Novo Comprador",
      action: function () {
        newComprador();
      },
    },
    {
      text: "Atualizar",
      action: async function () {
        await fetchCompradores();
      },
    },
  ],
};

const columns: ConfigColumns[] = [
  { data: "id", title: "Id" },
  { data: "nome", title: "Nome" },
  { data: "celular", title: "Celular", defaultContent: "-" },
  { data: "cidade", title: "Cidade", defaultContent: "-" },
  { data: "estado", title: "Estado", defaultContent: "-" },
  {
    data: null,
    title: "",
    className: "no-export",
    searchable: false,
    orderable: false,
    name: "actions",
    render: "#actions",
    responsivePriority: 3,
  },
];

onMounted(async () => {
  await fetchCompradores();
});

async function fetchCompradores() {
  loading.value = true;
  try {
    // Obter usuário atual para saber a cooperativa
    const usuarioResponse = await $fetch<UsuarioDTO>('/api/perfil');
    if (!usuarioResponse.cooperativaId) {
      toast.toast({
        title: "Erro",
        description: "Usuário não associado a uma cooperativa.",
        variant: "destructive",
      });
      return;
    }

    const cooperativaId = usuarioResponse.cooperativaId;

    // Obter compradores daquela cooperativa
    const response = await $fetch<AssociadoCompleteDTO[]>(`/api/associado/cooperativa/${cooperativaId}`, {
      params: {
        tipo: 'COMPRADOR'
      }
    });

    compradores.value = response;

    if (tableRef.value) {
      tableRef.value.clear();
      // @ts-ignore
      tableRef.value.rows.add(compradores.value).draw();
    }

  } catch (error) {
    console.error("Error fetching compradores:", error);
    toast.toast({
      title: "Erro",
      description: "Falha ao carregar compradores.",
      variant: "destructive",
    });
  } finally {
    loading.value = false;
  }
}

function initializeTable(instance: any) {
  tableRef.value = instance;
}

function newComprador() {
  isEditing.value = false;
  compradorForm.value = {
    nome: "",
    celular: "",
    tipo: "COMPRADOR",
    documento: "",
    endereco: "",
    cidade: "",
    estado: "",
    cooperativaId: 0,
  };
  dialogOpen.value = true;
}

function editComprador(comprador: AssociadoCompleteDTO, event: Event) {
  event.stopPropagation();
  isEditing.value = true;
  compradorForm.value = {
    id: comprador.id,
    nome: comprador.nome,
    celular: comprador.celular || "",
    tipo: "COMPRADOR",
    documento: comprador.documento || "",
    endereco: comprador.endereco || "",
    cidade: comprador.cidade || "",
    estado: comprador.estado || "",
    cooperativaId: 0, // Será preenchido na função saveComprador
  };
  dialogOpen.value = true;
}

async function saveComprador() {
  try {
    // Obter usuário atual para saber a cooperativa
    const usuarioResponse = await $fetch<UsuarioDTO>('/api/perfil');
    if (!usuarioResponse.cooperativaId) {
      toast.toast({
        title: "Erro",
        description: "Usuário não associado a uma cooperativa.",
        variant: "destructive",
      });
      return;
    }

    compradorForm.value.cooperativaId = usuarioResponse.cooperativaId;

    if (isEditing.value && compradorForm.value.id) {
      // Editar comprador existente
      const updateData: AssociadoUpdateDTO = {
        id: compradorForm.value.id,
        nome: compradorForm.value.nome,
        celular: compradorForm.value.celular,
        tipo: "COMPRADOR",
        documento: compradorForm.value.documento,
        endereco: compradorForm.value.endereco,
        cidade: compradorForm.value.cidade,
        estado: compradorForm.value.estado,
      };

      await $fetch(`/api/associado/${updateData.id}`, {
        method: 'PUT',
        body: updateData
      });

      toast.toast({
        title: "Sucesso",
        description: "Comprador atualizado com sucesso.",
      });
    } else {
      // Criar novo comprador
      const createData: AssociadoCreateDTO = {
        nome: compradorForm.value.nome,
        celular: compradorForm.value.celular,
        tipo: "COMPRADOR",
        documento: compradorForm.value.documento,
        endereco: compradorForm.value.endereco,
        cidade: compradorForm.value.cidade,
        estado: compradorForm.value.estado,
        cooperativaId: compradorForm.value.cooperativaId,
      };

      await $fetch('/api/associado', {
        method: 'POST',
        body: createData
      });

      toast.toast({
        title: "Sucesso",
        description: "Comprador criado com sucesso.",
      });
    }

    // Fechar modal e atualizar tabela
    dialogOpen.value = false;
    await fetchCompradores();
  } catch (error) {
    console.error("Error saving comprador:", error);
    toast.toast({
      title: "Erro",
      description: "Falha ao salvar comprador.",
      variant: "destructive",
    });
  }
}

function viewDetails(comprador: AssociadoCompleteDTO, event: Event) {
  event.stopPropagation();
  selectedComprador.value = comprador;
  detailsDialogOpen.value = true;
}

function formatDate(date: string | Date | undefined) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('pt-BR');
}
</script>