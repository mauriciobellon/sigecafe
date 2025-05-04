<template>
  <div>
    <UiTabsContent :value="fileName" class="mt-4">
      <UiDatatable @ready="initializeTable" :options="options" :columns="columns" :data="RootStore.permissions">
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

    <AlertDialogRoot v-model:open="RootStore.modalState">
      <AlertDialogPortal>
        <AlertDialogOverlay
          class="data-[state=open]:animate-overlayShow fixed inset-0 z-30 bg-background/80 backdrop-blur-sm">
          <div
            class="absolute h-full w-full bg-[radial-gradient(theme(colors.border)_1px,transparent_1px)] [background-size:15px_15px] [mask-image:radial-gradient(ellipse_600px_600px_at_50%_50%,#000_10%,transparent_100%)] dark:bg-[radial-gradient(theme(colors.border)_1px,transparent_1px)]" />
        </AlertDialogOverlay>
        <AlertDialogContent
          class="data-[state=open]:animate-contentShow fixed left-[50%] top-[50%] z-[100] max-h-[85vh] w-[90vw] max-w-[700px] translate-x-[-50%] translate-y-[-50%] rounded-lg border border-input bg-primary-foreground p-[25px] text-[15px] shadow-[0_0px_50px_-30px_rgba(0,0,0,0.5)] focus:outline-none dark:bg-black dark:shadow-[0_0px_80px_-50px_rgba(0,0,0,0.5)] dark:shadow-gray-500 sm:w-[700px]">
          <AlertDialogTitle class="mb-4 text-xl font-semibold">
            {{ RootStore.isEditing ? "Editar Permissão" : "Adicionar Nova Permissão" }}
          </AlertDialogTitle>
          <AlertDialogDescription class="text-mauve11 mb-5 mt-4 text-[15px] leading-normal">
            <form @submit.prevent="handleSave">
              <div class="grid w-full items-center gap-4">
                <div class="flex flex-col space-y-1.5">
                  <UiLabel for="path">Rota</UiLabel>
                  <input id="path" v-model="RootStore.newPermission.path" autocomplete="off" class="alert-input"
                    placeholder="/app/exemplo" />

                  <UiLabel for="title" class="mt-4">Título</UiLabel>
                  <input id="title" v-model="RootStore.newPermission.title" autocomplete="off" class="alert-input"
                    placeholder="Título da Rota" />

                  <UiLabel for="description" class="mt-4">Descrição</UiLabel>
                  <input id="description" v-model="RootStore.newPermission.description" autocomplete="off"
                    class="alert-input" placeholder="Descrição da funcionalidade" />

                  <UiLabel for="icon" class="mt-4">Ícone</UiLabel>
                  <input id="icon" v-model="RootStore.newPermission.icon" autocomplete="off" class="alert-input"
                    placeholder="ex: ph:lock-duotone" />

                  <UiLabel class="mt-4">Tipos de Menu</UiLabel>
                  <div class="grid grid-cols-2 gap-4">
                    <div v-for="option in menuTypeOptions" :key="option.value" class="flex items-center space-x-2">
                      <UiCheckbox :id="'menu-' + option.value"
                        :checked="RootStore.newPermission.menuType?.includes(option.value)"
                        @update:checked="toggleMenuType(option.value)" />
                      <label :for="'menu-' + option.value"
                        class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {{ option.label }}
                      </label>
                    </div>
                  </div>

                  <UiLabel class="mt-4">Tipos de Usuário</UiLabel>
                  <div class="grid grid-cols-2 gap-4">
                    <div v-for="option in userTypeOptions" :key="option.value" class="flex items-center space-x-2">
                      <UiCheckbox :id="'user-' + option.value"
                        :checked="RootStore.newPermission.usuarioType.includes(option.value)"
                        @update:checked="toggleUserType(option.value)" />
                      <label :for="'user-' + option.value"
                        class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {{ option.label }}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </AlertDialogDescription>
          <div class="flex justify-end gap-[25px]">
            <AlertDialogCancel
              class="text-mauve11 bg-mauve4 hover:bg-mauve5 focus:shadow-mauve7 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-semibold leading-none outline-none focus:shadow-[0_0_0_2px]">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              class="text-red11 bg-red4 hover:bg-red5 focus:shadow-red7 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-semibold leading-none outline-none focus:shadow-[0_0_0_2px]"
              @click="handleSave()">
              {{ RootStore.isEditing ? "Atualizar" : "Salvar" }}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialogRoot>
  </div>
</template>

<script setup lang="ts">
  import { useRootStore } from "~/stores/RootStore";
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
  import { UsuarioType, MenuType } from "@prisma/client";

  const { fileName } = useTabName();
  const RootStore = useRootStore();
  const tableRef = shallowRef<InstanceType<typeof DataTableRef<any[]>> | null>(null);

  const userTypeOptions = [
    { label: 'Administrador', value: UsuarioType.ADMINISTRADOR },
    { label: 'Coordenador', value: UsuarioType.COORDENADOR },
    { label: 'Professor', value: UsuarioType.PROFESSOR },
    { label: 'Responsável', value: UsuarioType.RESPONSAVEL },
    { label: 'Autenticado', value: UsuarioType.AUTENTICADO }
  ];

  const menuTypeOptions = [
    { label: 'Root', value: MenuType.ROOT },
    { label: 'Dropdown', value: MenuType.DROPDOWN },
    { label: 'Perfil', value: MenuType.PERFIL }
  ];

  onMounted(async () => {
    await RootStore.fetch();
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
        text: RootStore.selectedRows > 0 ? "Desselecionar" : "Selecionar Todos",
        action: function (e, dt, node, config) {
          if (RootStore.selectedRows > 0) {
            dt.rows().deselect();
            RootStore.selectedRows = 0;
          } else {
            dt.rows().select();
            RootStore.selectedRows = dt.rows({ selected: true }).count();
          }
        },
      },
      {
        text: "Nova Permissão",
        action: function () {
          RootStore.resetForm();
          RootStore.modalState = true;
        },
      },
    ],
  };

  const columns: ConfigColumns[] = [
    { data: "id", title: "Id", width: "10%" },
    { data: "path", title: "Rota", width: "75%" },
    {
      data: null,
      title: "",
      width: "15%",
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
    RootStore.selectedRows = tableRef.value?.rows({ selected: true }).count() || 0;
  }

  async function handleSave() {
    try {
      if (RootStore.isEditing) {
        await RootStore.update();
      } else {
        await RootStore.create();
      }

      if (tableRef.value) {
        tableRef.value.clear();
        tableRef.value.rows.add(RootStore.permissions).draw();
      }
    } catch (error) {
      console.error('Erro ao salvar permissão:', error);
      // Adicione aqui tratamento de erro UI (toast, alert, etc)
    }
  }

  function edit(permission: any, event: Event) {
    event.stopPropagation();
    RootStore.setEditingPermission(permission);
  }

  async function remove(permission: any, event: Event) {
    event.stopPropagation();
    try {
      await RootStore.remove(permission);

      if (tableRef.value) {
        const row = tableRef.value.row((idx: number, data: any) => data.id === permission.id);
        if (row) {
          row.remove().draw(false);
        }
      }
    } catch (error) {
      console.error('Erro ao remover permissão:', error);
      // Adicione aqui tratamento de erro UI (toast, alert, etc)
    }
  }

  watch(
    () => RootStore.selectedRows,
    (newValue) => {
      const selectButton = tableRef.value?.button(0);
      if (selectButton) {
        selectButton.text(newValue > 0 ? "Selecionar Nenhum" : "Selecionar Todos");
      }
    }
  );

  function toggleUserType(value: UsuarioType) {
    const currentTypes = RootStore.newPermission.usuarioType
    const index = currentTypes.indexOf(value)

    if (index === -1) {
      currentTypes.push(value)
    } else {
      currentTypes.splice(index, 1)
    }
  }

  function toggleMenuType(value: MenuType) {
    const currentTypes = RootStore.newPermission.menuType || []
    const index = currentTypes.indexOf(value)

    if (index === -1) {
      currentTypes.push(value)
    } else {
      currentTypes.splice(index, 1)
    }
    RootStore.newPermission.menuType = currentTypes
  }
</script>

<style scoped>
  .alert-input {
    @apply h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-[16px] ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground file:hover:cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm;
  }
</style>