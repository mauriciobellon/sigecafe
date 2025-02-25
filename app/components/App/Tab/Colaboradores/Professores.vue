<template>
  <div>
    <UiTabsContent :value="fileName" class="mt-4">
      <UiDatatable @ready="initializeTable" :options="options" :columns="columns" :data="ProfessorStore.professores">
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

    <AlertDialogRoot v-model:open="ProfessorStore.modalState">
      <AlertDialogPortal>
        <AlertDialogOverlay
          class="data-[state=open]:animate-overlayShow fixed inset-0 z-30 bg-background/80 backdrop-blur-sm">
          <div
            class="absolute h-full w-full bg-[radial-gradient(theme(colors.border)_1px,transparent_1px)] [background-size:15px_15px] [mask-image:radial-gradient(ellipse_600px_600px_at_50%_50%,#000_10%,transparent_100%)] dark:bg-[radial-gradient(theme(colors.border)_1px,transparent_1px)]" />
        </AlertDialogOverlay>
        <AlertDialogContent
          class="data-[state=open]:animate-contentShow fixed left-[50%] top-[50%] z-[100] max-h-[85vh] w-[90vw] max-w-[700px] translate-x-[-50%] translate-y-[-50%] rounded-lg border border-input bg-primary-foreground p-[25px] text-[15px] shadow-[0_0px_50px_-30px_rgba(0,0,0,0.5)] focus:outline-none dark:bg-black dark:shadow-[0_0px_80px_-50px_rgba(0,0,0,0.5)] dark:shadow-gray-500 sm:w-[700px]">
          <AlertDialogTitle class="mb-4 text-xl font-semibold">
            {{ ProfessorStore.isEditing ? "Editar Coordenador" : "Adicionar Novo Coordenador" }}
          </AlertDialogTitle>
          <AlertDialogDescription class="text-mauve11 mb-5 mt-4 text-[15px] leading-normal">
            <form @submit.prevent="handleSave">
              <div class="grid w-full items-center gap-4">
                <div class="flex flex-col space-y-1.5">
                  <UiLabel for="nome" class=""> Nome </UiLabel>
                  <input id="nome" v-model="ProfessorStore.newProfessor.name" autocomplete="off" class="alert-input" />
                  <UiLabel for="email"> Email </UiLabel>
                  <input id="email" v-model="ProfessorStore.newProfessor.email" autocomplete="off"
                    class="alert-input" />
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
              {{ ProfessorStore.isEditing ? "Atualizar" : "Salvar" }}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialogRoot>
  </div>
</template>

<script setup lang="ts">
  import { useProfessorStore } from "~/stores/Tab/Colaboradores/ProfessorStore";
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
  import { computed, onMounted } from "vue";
  import type DataTableRef from "datatables.net";
  import type { Config, ConfigColumns } from "datatables.net";
  import { UsuarioType } from "@prisma/client";
  const { fileName } = useTabName()
  const ProfessorStore = useProfessorStore();
  const tableRef = shallowRef<InstanceType<typeof DataTableRef<any[]>> | null>(null);

  // Fetch professors on component mount
  onMounted(async () => {
    await ProfessorStore.fetch();
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
        text: ProfessorStore.selectedRows > 0 ? "Desselecionar" : "Selecionar Todos",
        action: function (e, dt, node, config) {
          if (ProfessorStore.selectedRows > 0) {
            dt.rows().deselect();
            ProfessorStore.selectedRows = 0;
          } else {
            dt.rows().select();
            ProfessorStore.selectedRows = dt.rows({ selected: true }).count();
          }
        },
      },
      {
        text: "Novo",
        action: function () {
          ProfessorStore.resetForm();
          ProfessorStore.modalState = true;
        },
      },
    ],
  };

  const columns: ConfigColumns[] = [
    { data: "id", title: "Id" },
    { data: "name", title: "Nome" },
    { data: "email", title: "Email" },
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
    ProfessorStore.selectedRows = tableRef.value?.rows({ selected: true }).count() || 0;
  }

  async function handleSave() {

    if (ProfessorStore.isEditing) {
      await ProfessorStore.update();
    } else {
      await ProfessorStore.create();
    }

    if (tableRef.value) {
      tableRef.value.clear();
      // @ts-ignore
      tableRef.value.rows.add(ProfesorStore.colaboradores).draw();
    }
  }

  function edit(colaborador: any, event: Event) {
    event.stopPropagation();
    ProfessorStore.setEditingColaborador(colaborador);
  }

  async function remove(professor: any, event: Event) {
    event.stopPropagation();
    await ProfessorStore.remove(professor);

    if (tableRef.value) {
      // @ts-ignore
      const row = tableRef.value.row((idx, data) => data.id === colaborador.id);
      if (row) {
        row.remove().draw(false);
      }
    }
  }

  watch(
    () => ProfessorStore.selectedRows,
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
    @apply h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-[16px] ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground file:hover:cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm;
  }
</style>
