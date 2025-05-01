<template>
  <div>
    <ClientOnly>
      <UiTabsContent :value="fileName" class="mt-4">
        <UiDatatable @ready="initializeTable" :options="options" :columns="columns" :data="colaboradores">
          <template #actions="{ cellData }" class="m-0 flex items-center p-0">
            <UiButton variant="outline" @click="edit(cellData, $event)" class="m-0 mr-2 h-8 px-2">
              Editar
            </UiButton>
            <UiButton variant="destructive" @click="remove(cellData, $event)" class="m-0 ml-2 h-8 px-2">
              Deletar
            </UiButton>
          </template>
        </UiDatatable>
      </UiTabsContent>
    </ClientOnly>

    <AlertDialogRoot v-model:open="modalState">
      <AlertDialogPortal>
        <AlertDialogOverlay
          class="data-[state=open]:animate-overlayShow fixed inset-0 z-30 bg-background/80 backdrop-blur-sm">
          <div
            class="absolute h-full w-full bg-[radial-gradient(theme(colors.border)_1px,transparent_1px)] [background-size:15px_15px] [mask-image:radial-gradient(ellipse_600px_600px_at_50%_50%,#000_10%,transparent_100%)] dark:bg-[radial-gradient(theme(colors.border)_1px,transparent_1px)]" />
        </AlertDialogOverlay>
        <AlertDialogContent
          class="data-[state=open]:animate-contentShow fixed left-[50%] top-[50%] z-[100] max-h-[85vh] w-[90vw] max-w-[700px] translate-x-[-50%] translate-y-[-50%] rounded-lg border border-input bg-primary-foreground p-[25px] text-[15px] shadow-[0_0px_50px_-30px_rgba(0,0,0,0.5)] focus:outline-none dark:bg-black dark:shadow-[0_0px_80px_-50px_rgba(0,0,0,0.5)] dark:shadow-gray-500 sm:w-[700px]">
          <AlertDialogTitle class="mb-4 text-xl font-semibold">
            {{ isEditing ? "Editar Colaborador" : "Adicionar Novo Colaborador" }}
          </AlertDialogTitle>
          <AlertDialogDescription class="text-mauve11 mb-5 mt-4 text-[15px] leading-normal">
            <form @submit.prevent="handleSave">
              <div class="grid w-full items-center gap-4">
                <div class="flex flex-col space-y-1.5">
                  <UiLabel for="nome" class=""> Nome </UiLabel>
                  <input id="nome" v-model="newColaborador.name" autocomplete="off"
                    class="alert-input" />
                  <UiLabel for="email"> Email </UiLabel>
                  <input id="email" v-model="newColaborador.email" autocomplete="off"
                    class="alert-input" />
                  <UiLabel for="celular"> Celular </UiLabel>
                  <input id="celular" v-model="newColaborador.celular" autocomplete="off"
                    class="alert-input" />
                  <UiLabel for="tipo"> Tipo </UiLabel>
                  <select id="tipo" v-model="newColaborador.type" class="alert-input">
                    <option value="COORDENADOR">Coordenador</option>
                    <option value="COLABORADOR">Colaborador</option>
                  </select>
                </div>
              </div>
            </form>
          </AlertDialogDescription>
          <div class="flex justify-end gap-[25px]">
            <AlertDialogCancel
              class="text-mauve11 bg-mauve4 hover:bg-mauve5 focus:shadow-mauve7 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-semibold leading-none outline-none focus:shadow-[0_0_0_2px]">
              Voltar
            </AlertDialogCancel>
            <AlertDialogAction
              class="text-red11 bg-red4 hover:bg-red5 focus:shadow-red7 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-semibold leading-none outline-none focus:shadow-[0_0_0_2px]"
              @click="handleSave()">
              {{ isEditing ? "Atualizar" : "Salvar" }}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialogRoot>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useToast } from "~/composables/useToast";
import { useColaboradorStore } from "~/stores/ColaboradorStore";
import { useTabName } from "~/composables/useTabName";
// @ts-ignore
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
import type { Usuario, UsuarioType } from "@prisma/client";

const toast = useToast();
const { fileName } = useTabName();
const tableRef = ref<any>(null);
const ColaboradorStore = useColaboradorStore();
const colaboradores = ref<Usuario[]>([]);
const selectedRows = ref(0);
const modalState = ref(false);
const isEditing = ref(false);
const newColaborador = ref<{
  id?: number | null;
  name: string;
  email: string | null;
  celular: string;
  type: UsuarioType;
}>({
  id: null,
  name: '',
  email: '',
  celular: '',
  type: 'COLABORADOR' as UsuarioType
});

onMounted(async () => {
  try {
    await ColaboradorStore.fetch();
    colaboradores.value = Array.isArray(ColaboradorStore.colaboradores)
      ? ColaboradorStore.colaboradores
      : [];
  } catch (error) {
    console.error("Error fetching colaboradores:", error);
    toast.toast({
      title: "Erro",
      description: "Não foi possível carregar os colaboradores.",
      variant: "destructive",
    });
  }
});

const options: Config = {
  dom: "<'flex flex-col lg:flex-row w-full lg:items-start lg:justify-between gap-5 mb-5 lg:pr-1'Bf><'border rounded-lg't><'flex flex-col lg:flex-row gap-5 items-center lg:justify-between w-full pt-3 p-5 m-auto'lp>",
  searching: true,
  language: languageBR,
  paging: true,
  ordering: true,
  responsive: true,
  autoWidth: true,
  select: {
    style: "multi",
  },
  buttons: [
    {
      text: selectedRows.value > 0 ? "Selecionar Nenhum" : "Selecionar Todos",
      action: function (e: any, dt: any, node: any, config: any) {
        if (selectedRows.value > 0) {
          dt.rows().deselect();
          selectedRows.value = 0;
        } else {
          dt.rows().select();
          selectedRows.value = dt.rows({ selected: true }).count();
        }
      },
    },
    {
      text: "Novo",
      action: function () {
        resetForm();
        modalState.value = true;
      },
    },
    {
      text: "Atualizar",
      action: async function () {
        try {
          await ColaboradorStore.fetch();
          // Ensure we're always working with an array
          colaboradores.value = Array.isArray(ColaboradorStore.colaboradores)
            ? ColaboradorStore.colaboradores
            : [];
          if (tableRef.value) {
            tableRef.value.clear();
            // @ts-ignore
            tableRef.value.rows.add(colaboradores.value).draw();
          }
          toast.toast({
            title: "Sucesso",
            description: "Lista de colaboradores atualizada.",
          });
        } catch (error) {
          console.error("Error refreshing data:", error);
          toast.toast({
            title: "Erro",
            description: "Não foi possível atualizar a lista de colaboradores.",
            variant: "destructive",
          });
        }
      },
    },
  ],
};

const columns: ConfigColumns[] = [
  { data: "id", title: "Id" },
  { data: "name", title: "Nome" },
  { data: "email", title: "Email" },
  {
    data: "celular",
    title: "Celular",
    defaultContent: "-"
  },
  {
    data: "type",
    title: "Tipo",
    defaultContent: "-",
    render: function(data: any) {
      if (!data) return "-";
      return data === 'COORDENADOR' ? 'Coordenador' :
             data === 'COLABORADOR' ? 'Colaborador' : data;
    }
  },
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

function initializeTable(instance: any) {
  tableRef.value = instance;
  tableRef.value?.on("select.dt deselect.dt", updateSelectedRowsCount);
}

function updateSelectedRowsCount() {
  selectedRows.value = tableRef.value?.rows({ selected: true }).count() || 0;
}

function resetForm() {
  newColaborador.value = {
    id: null,
    name: '',
    email: '',
    celular: '',
    type: 'COLABORADOR' as UsuarioType
  };
  isEditing.value = false;
}

function edit(colaborador: Usuario, event: Event) {
  event.stopPropagation();
  if (!colaborador) return;

  isEditing.value = true;
  newColaborador.value = {
    id: colaborador.id,
    name: colaborador.name,
    email: colaborador.email,
    celular: colaborador.celular,
    type: colaborador.type
  };
  modalState.value = true;
}

async function remove(colaborador: Usuario, event: Event) {
  event.stopPropagation();
  if (!colaborador) return;

  try {
    await ColaboradorStore.remove(colaborador);

    if (tableRef.value) {
      // @ts-ignore
      const row = tableRef.value.row((idx: any, data: any) => data.id === colaborador.id);
      if (row) {
        row.remove().draw(false);
      }
    }

    toast.toast({
      title: "Sucesso",
      description: "Colaborador removido com sucesso.",
    });
  } catch (error) {
    console.error("Error removing colaborador:", error);
    toast.toast({
      title: "Erro",
      description: "Não foi possível remover o colaborador.",
      variant: "destructive",
    });
  }
}

async function handleSave() {
  try {
    if (isEditing.value) {
      // Set the values in the store before updating
      ColaboradorStore.newColaborador = {
        id: newColaborador.value.id as number | null,
        name: newColaborador.value.name,
        email: newColaborador.value.email,
        celular: newColaborador.value.celular,
        type: newColaborador.value.type
      };
      await ColaboradorStore.update();
    } else {
      // Set the values in the store before creating
      ColaboradorStore.newColaborador = {
        id: null,
        name: newColaborador.value.name,
        email: newColaborador.value.email,
        celular: newColaborador.value.celular,
        type: newColaborador.value.type
      };
      await ColaboradorStore.create();
    }

    // Refresh data in the table
    await ColaboradorStore.fetch();
    // Ensure we're always working with an array
    colaboradores.value = Array.isArray(ColaboradorStore.colaboradores)
      ? ColaboradorStore.colaboradores
      : [];

    if (tableRef.value) {
      tableRef.value.clear();
      // @ts-ignore
      tableRef.value.rows.add(colaboradores.value).draw();
    }

    // Close modal and reset form
    modalState.value = false;
    resetForm();

    toast.toast({
      title: "Sucesso",
      description: isEditing.value
        ? "Colaborador atualizado com sucesso."
        : "Novo colaborador adicionado com sucesso.",
    });
  } catch (error) {
    console.error("Error saving colaborador:", error);
    toast.toast({
      title: "Erro",
      description: "Não foi possível salvar o colaborador.",
      variant: "destructive",
    });
  }
}

watch(
  () => selectedRows.value,
  (newValue) => {
    const selectButton = tableRef.value?.button(0);
    if (selectButton) {
      selectButton.text(newValue > 0 ? "Selecionar Nenhum" : "Selecionar Todos");
    }
  }
);
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