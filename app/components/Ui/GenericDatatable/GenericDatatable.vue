<template>
  <ClientOnly>
    <UiDatatable @ready="initializeTable" :options="tableOptions" :columns="datatableColumns" :data="storeData">
      <template v-for="(_, name) in $slots" :key="name" #[name]="slotData">
        <slot :name="name" v-bind="slotData" />
      </template>

      <template #actions="{ cellData }" v-if="!$slots.actions">
        <UiButton variant="ghost" @click="handleEdit(cellData)" class="h-8">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
            <path fill="none" stroke="green" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
          </svg>
        </UiButton>
        <UiButton variant="ghost" @click="handleDelete(cellData)" class="h-8">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
            <path fill="none" stroke="red" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2m-6 5v6m4-6v6" />
          </svg>
        </UiButton>
      </template>
    </UiDatatable>
  </ClientOnly>

  <AlertDialogRoot v-model:open="store.modalOpen">
    <AlertDialogPortal>
      <AlertDialogOverlay
        class="data-[state=open]:animate-overlayShow fixed inset-0 z-30 bg-background/80 backdrop-blur-sm">
        <div
          class="absolute h-full w-full bg-[radial-gradient(theme(colors.border)_1px,transparent_1px)] [background-size:15px_15px] [mask-image:radial-gradient(ellipse_600px_600px_at_50%_50%,#000_10%,transparent_100%)] dark:bg-[radial-gradient(theme(colors.border)_1px,transparent_1px)]" />
      </AlertDialogOverlay>
      <AlertDialogContent
        class="data-[state=open]:animate-contentShow fixed left-[50%] top-[50%] z-[100] max-h-[85vh] w-[90vw] max-w-[700px] translate-x-[-50%] translate-y-[-50%] rounded-lg border border-input bg-primary-foreground p-[25px] text-[15px] shadow-[0_0px_50px_-30px_rgba(0,0,0,0.5)] focus:outline-none dark:bg-black dark:shadow-[0_0px_80px_-50px_rgba(0,0,0,0.5)] dark:shadow-gray-500 sm:w-[700px]">
        <AlertDialogTitle class="mb-4 text-xl font-semibold">
          {{ store.isEditing ? props.editModalTitle : props.addModalTitle }}
        </AlertDialogTitle>
        <AlertDialogDescription class="text-mauve11 mb-5 mt-4 text-[15px] leading-normal">
          <slot name="modal-content" :item="store.currentItem" :is-editing="store.isEditing"></slot>

          <div v-if="!$slots['modal-content']">
            <form @submit.prevent>
              <div class="grid w-full items-center gap-4">
                <div v-for="col in processedColumns" :key="col.field" class="flex flex-col space-y-1.5">
                  <UiLabel :for="col.field" :class="{'readonly-label': col.readonly && store.isEditing}">
                    {{ col.label }}
                  </UiLabel>

                  <!-- Read-only text fields -->
                  <UiInput v-if="col.readonly && store.isEditing" :id="col.field"
                    :model-value="getFieldValue(store.currentItem, col.field)" class="readonly-field"
                    :disabled="col.readonly" />

                  <!-- Editable text field -->
                  <UiInput v-else-if="col.type === 'text'" :id="col.field"
                    :model-value="getFieldValue(store.currentItem, col.editField || col.field)"
                    @update:model-value="setFieldValue(store.currentItem, col.editField || col.field, $event)"
                    autocomplete="off" :disabled="col.readonly" />

                  <!-- Editable phone field -->
                  <UiInput v-else-if="col.type === 'phone'" :id="col.field"
                    :model-value="getFieldValue(store.currentItem, col.editField || col.field)"
                    @update:model-value="setFieldValue(store.currentItem, col.editField || col.field, $event)"
                    type="tel" autocomplete="off" :disabled="col.readonly" v-phone-mask maxlength="16"
                    @input="(event: Event) => sanitizePhoneValue(event, col.editField || col.field)" />

                  <!-- Editable integer field -->
                  <UiInput v-else-if="col.type === 'integer'" :id="col.field"
                    :model-value="getFieldValue(store.currentItem, col.editField || col.field)"
                    @update:model-value="setFieldValue(store.currentItem, col.editField || col.field, parseInt($event) || 0)"
                    type="number" min="0" step="1" autocomplete="off" :disabled="col.readonly" />

                  <!-- Editable money field -->
                  <UiInput v-else-if="col.type === 'money'" :id="col.field"
                    :model-value="getFieldValue(store.currentItem, col.editField || col.field)"
                    @update:model-value="setFieldValue(store.currentItem, col.editField || col.field, parseFloat($event) || 0)"
                    type="number" min="0" step="0.01" autocomplete="off" :disabled="col.readonly" />

                  <!-- Editable number field -->
                  <UiInput v-else-if="col.type === 'number'" :id="col.field"
                    :model-value="getFieldValue(store.currentItem, col.editField || col.field)"
                    @update:model-value="setFieldValue(store.currentItem, col.editField || col.field, $event)"
                    type="number" autocomplete="off" :disabled="col.readonly" />

                  <!-- Date picker field -->
                  <UiInput v-else-if="col.type === 'date'" :id="col.field"
                    :model-value="formatDateForInput(getFieldValue(store.currentItem, col.editField || col.field))"
                    @update:model-value="setFieldValue(store.currentItem, col.editField || col.field, $event)"
                    type="date" autocomplete="off" :disabled="col.readonly" />

                  <!-- Relation field (select from foreign table) -->
                  <UiSelect v-else-if="col.type === 'relation'" :id="col.field"
                    :model-value="getFieldValue(store.currentItem, col.editField || col.field)"
                    @update:model-value="setFieldValue(store.currentItem, col.editField || col.field, $event)"
                    :disabled="col.readonly">
                    <UiSelectTrigger class="w-full">
                      <UiSelectValue :placeholder="col.placeholder || `Selecione ${col.label}`" />
                    </UiSelectTrigger>
                    <UiSelectContent class="z-[200]">
                      <UiSelectGroup>
                        <UiSelectItem :value="''">{{ col.placeholder || `Selecione ${col.label}` }}</UiSelectItem>
                        <UiSelectItem v-for="option in col.relationOptions" :key="option.value"
                          :value="String(option.value)">
                          {{ option.label }}
                        </UiSelectItem>
                      </UiSelectGroup>
                    </UiSelectContent>
                  </UiSelect>

                  <!-- Status selector -->
                  <UiSelect v-else-if="col.type === 'status'" :id="col.field"
                    :model-value="getFieldValue(store.currentItem, col.editField || col.field)"
                    @update:model-value="setFieldValue(store.currentItem, col.editField || col.field, $event)"
                    :disabled="col.readonly">
                    <UiSelectTrigger class="w-full">
                      <UiSelectValue :placeholder="`Selecione ${col.label}`" />
                    </UiSelectTrigger>
                    <UiSelectContent class="z-[200]">
                      <UiSelectGroup>
                        <UiSelectItem v-for="status in col.statusOptions" :key="status.value" :value="status.value"
                          :class="getStatusClass(status.value, col.statusClasses || {})">
                          {{ status.label }}
                        </UiSelectItem>
                      </UiSelectGroup>
                    </UiSelectContent>
                  </UiSelect>

                  <!-- Editable select field -->
                  <UiSelect v-else-if="col.type === 'select' && col.options" :id="col.field"
                    :model-value="getFieldValue(store.currentItem, col.editField || col.field)"
                    @update:model-value="setFieldValue(store.currentItem, col.editField || col.field, $event)"
                    :disabled="col.readonly">
                    <UiSelectTrigger class="w-full">
                      <UiSelectValue :placeholder="`Selecione ${col.label}`" />
                    </UiSelectTrigger>
                    <UiSelectContent class="z-[200]">
                      <UiSelectGroup>
                        <UiSelectItem v-for="option in col.options" :key="option.value" :value="option.value">
                          {{ option.label }}
                        </UiSelectItem>
                      </UiSelectGroup>
                    </UiSelectContent>
                  </UiSelect>

                  <!-- Default editable field -->
                  <UiInput v-else :id="col.field"
                    :model-value="getFieldValue(store.currentItem, col.editField || col.field)"
                    @update:model-value="setFieldValue(store.currentItem, col.editField || col.field, $event)"
                    autocomplete="off" :disabled="col.readonly" />
                </div>
              </div>
            </form>
          </div>
        </AlertDialogDescription>
        <div class="flex justify-end gap-[25px]">
          <AlertDialogCancel
            class="text-mauve11 bg-mauve4 hover:bg-mauve5 focus:shadow-mauve7 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-semibold leading-none outline-none focus:shadow-[0_0_0_2px]">
            Voltar
          </AlertDialogCancel>
          <AlertDialogAction
            class="text-mauve11 bg-mauve4 hover:bg-mauve5 focus:shadow-mauve7 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-semibold leading-none outline-none focus:shadow-[0_0_0_2px]"
            @click="handleSave">
            {{ store.isEditing ? 'Atualizar' : 'Salvar' }}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialogPortal>
  </AlertDialogRoot>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from "vue";
// @ts-ignore
import languageBR from "datatables.net-plugins/i18n/pt-BR.mjs";
import type { Config, ConfigColumns } from "datatables.net";
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
import { useToast } from "~/composables/useToast";
import { createGenericDatabaseStore } from "~/stores/GenericDatabaseStore";
import { formatPhoneNumber, getPhoneDigits } from "~/utils/phoneUtils";

/**
 * Column definition for the GenericDatatable
 */
interface Column {
  label: string;
  field: string;
  editField?: string;
  type: 'text' | 'number' | 'phone' | 'date' | 'select' | 'relation' | 'money' | 'integer' | 'status' | string;
  options?: { label: string; value: any }[];
  relationOptions?: { label: string; value: any }[];
  statusOptions?: { label: string; value: any }[];
  statusClasses?: Record<string, string>;
  placeholder?: string;
  sortable?: boolean;
  hidden?: boolean;
  readonly?: boolean;
  unique?: boolean;
  width?: string;
}

const props = defineProps<{
  // Model name (used to create store and API endpoint)
  model: string;
  // Column definitions
  columns: Column[];
  // Optional title
  title?: string;
  // Optional additional datatable options
  options?: Partial<Config>;
  // Allow row selection
  selectable?: boolean;
  // Modal titles and button texts
  addModalTitle?: string;
  editModalTitle?: string;
  saveButtonText?: string;
  updateButtonText?: string;
  cancelButtonText?: string;
}>();

const emit = defineEmits<{
  (e: "selection-change", count: number): void;
  (e: "table-initialized", instance: any): void;
  (e: "item-saved", item: any, isNew: boolean): void;
  (e: "item-deleted", item: any): void;
}>();

// Process columns to automatically infer read-only and unique fields
const processedColumns = computed<Column[]>(() => {
  return props.columns.map(col => {
    const column = { ...col };

    // Automatically mark fields as readonly based on naming conventions
    const readonlyFields = ['id', 'uuid', 'created_at', 'createdAt', 'updated_at', 'updatedAt'];
    if (readonlyFields.includes(column.field) && column.readonly === undefined) {
      column.readonly = true;
    }

    // If a field is marked as unique, make it readonly when editing
    if (column.unique && column.readonly === undefined) {
      column.readonly = true;
    }

    return column;
  });
});

// Make column definitions available globally for the store to access
if (process.client) {
  // Initialize global object if it doesn't exist
  if (!(window as any).__columnDefinitions) {
    (window as any).__columnDefinitions = {};
  }

  // Store column definitions for this model
  (window as any).__columnDefinitions[props.model.toLowerCase()] = processedColumns.value;
}

// Initialize the toast
const toast = useToast();

// Create the store for this model
const store = createGenericDatabaseStore(props.model)();

// Table instance reference
const tableRef = ref<any>(null);
const selectedRows = ref(0);

// Default values with fallbacks
const addModalTitle = computed(() => props.addModalTitle || `Adicionar ${humanizedModelName.value}`);
const editModalTitle = computed(() => props.editModalTitle || `Editar ${humanizedModelName.value}`);
const saveButtonText = computed(() => props.saveButtonText || "Salvar");
const updateButtonText = computed(() => props.updateButtonText || "Atualizar");
const cancelButtonText = computed(() => props.cancelButtonText || "Cancelar");

// Helper to humanize the model name for defaults
const humanizedModelName = computed(() => {
  const name = props.model;
  // Convert camelCase or snake_case to Title Case with spaces
  return name
    .replace(/([A-Z])/g, ' $1') // insert space before capital letters
    .replace(/_/g, ' ') // replace underscores with spaces
    .trim() // remove leading space
    .replace(/^\w/, c => c.toUpperCase()); // capitalize first letter
});

// Get data from the store
const storeData = computed(() => store.items);

// Convert the column definitions to DataTables format
const datatableColumns = computed<ConfigColumns[]>(() => {
  const columns: ConfigColumns[] = processedColumns.value
    .filter(col => !col.hidden)
    .map(col => ({
      data: col.field,
      title: col.label,
      defaultContent: "-",
      width: col.width,
      // Custom render functions for special types
      ...(col.type === 'phone' ? {
        render: function(data: any) {
          return data ? formatPhoneNumber(data) : '-';
        }
      } : {}),
      ...(col.type === 'money' ? {
        render: function(data: any) {
          return data ? `R$ ${parseFloat(data).toFixed(2)}` : 'R$ 0,00';
        }
      } : {}),
      ...(col.type === 'date' ? {
        render: function(data: any) {
          return data ? formatDateDisplay(data) : '-';
        }
      } : {}),
      ...(col.type === 'status' && col.statusOptions ? {
        render: function(data: any) {
          const status = col.statusOptions?.find(s => s.value === data);
          if (status) {
            const statusClass = getStatusClass(data, col.statusClasses || {});
            return `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">${status.label}</span>`;
          }
          return data || '-';
        }
      } : {}),
      ...(col.type === 'relation' && col.relationOptions ? {
        render: function(data: any) {
          const option = col.relationOptions?.find(o => String(o.value) === String(data));
          return option ? option.label : data || '-';
        }
      } : {})
    }));

  // Add actions column if not hidden
  columns.push({
    data: null,
    title: "Ações",
    className: "no-export actions-column",
    searchable: false,
    orderable: false,
    name: "actions",
    render: "#actions",
    responsivePriority: 3,
  });

  return columns;
});

// Computed table options that merges default options with user provided options
const tableOptions = computed<Config>(() => {
  // Default options
  const defaultOptions: Config = {
    dom: "<'w-full flex gap-5 items-center mb-5'<'flex-none mr-auto'B><'dt-search-container'f>> \
         <'border rounded-lg't> <'flex flex-row gap-5 items-center justify-end w-full pt-3 m-auto'lp>",
    searching: true,
    language: languageBR,
    paging: true,
    ordering: true,
    responsive: true,
    autoWidth: true,
    lengthChange: false,
    columnDefs: [
      {
        targets: '_all',
        className: 'dt-head-left dt-body-left',
      },
      {
        // For the ID column (typically first column)
        targets: 0,
        width: '40px'
      }
    ],
    select: props.selectable ? {
      style: "multi",
    } : undefined,
    // Additional initialization complete callback
    initComplete: function(settings: any, json: any) {
      // Force column width calculation
      if (tableRef.value) {
        tableRef.value.columns.adjust();
      }
    },
    buttons: [
      {
        text: "Novo",
        action: function () {
          store.openCreateModal();
        },
      }
    ],
  };

  // Merge with user provided options
  return { ...defaultOptions, ...props.options };
});

// Fetch data on mount
onMounted(async () => {
  await fetchData();
});

// Add a watcher to update the table when the store data changes
watch(
  () => store.items,
  (newItems) => {
    if (tableRef.value && newItems) {
      refreshTable();
    }
  },
  { deep: true }
);

// Watch for store's dataLoaded state to change
watch(
  () => store.dataLoaded,
  (isLoaded) => {
    if (isLoaded && tableRef.value) {
      // Refresh table when data is loaded
      nextTick(() => {
        refreshTable();
      });
    }
  }
);

// Format date for display in table
function formatDateDisplay(dateString: string): string {
  if (!dateString) return '-';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
}

// Format date for input field (YYYY-MM-DD)
function formatDateForInput(dateString: string): string {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0] || '';
  } catch (e) {
    return '';
  }
}

// Get CSS class for status based on value
function getStatusClass(value: string, statusClasses: Record<string, string>): string {
  if (statusClasses && statusClasses[value]) {
    return statusClasses[value];
  }

  // Default status classes if not specified
  const defaultClasses: Record<string, string> = {
    'CONCLUIDA': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'PENDENTE': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'CANCELADA': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'ATIVO': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'INATIVO': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  };

  return defaultClasses[value] || '';
}

// Initialize the table when ready
function initializeTable(instance: any) {
  tableRef.value = instance;

  if (props.selectable) {
    tableRef.value?.on("select.dt deselect.dt", updateSelectedRowsCount);
  }

  // Refresh the table immediately with current data if available
  if (store.items.length > 0) {
    refreshTable();
  }

  emit("table-initialized", instance);
}

// Update selected rows count
function updateSelectedRowsCount() {
  selectedRows.value = tableRef.value?.rows({ selected: true }).count() || 0;
  emit("selection-change", selectedRows.value);
}

// Fetch data from the API
async function fetchData() {
  try {
    await store.fetchAll();

    // Ensure we refresh the table with the new data immediately
    if (tableRef.value) {
      nextTick(() => {
        refreshTable();
      });
    }
  } catch (error) {
    console.error(`Error fetching ${props.model} data:`, error);
    toast.toast({
      title: "Erro",
      description: `Não foi possível carregar os dados de ${props.model}.`,
      variant: "destructive",
    });
  }
}

// Refresh the table data
function refreshTable() {
  if (tableRef.value) {
    try {
      console.log("Refreshing table with data:", storeData.value.length, "items");
      tableRef.value.clear();
      // @ts-ignore
      tableRef.value.rows.add(storeData.value).draw();

      // Adjust column widths
      tableRef.value.columns.adjust();

      // Sometimes the table needs a second draw to render properly, especially after modal operations
      setTimeout(() => {
        if (tableRef.value) {
          tableRef.value.columns.adjust();
          tableRef.value.draw();
        }
      }, 200);
    } catch (error) {
      console.error("Error refreshing table:", error);
    }
  }
}

// Handle edit button click
function handleEdit(item: any) {
  store.openEditModal(item);
}

// Handle delete button click
async function handleDelete(item: any) {
  try {
    if (confirm(`Tem certeza que deseja excluir este ${props.model}?`)) {
      await store.delete(item);

      emit("item-deleted", item);

      toast.toast({
        title: "Sucesso",
        description: `${props.model} excluído com sucesso.`,
      });

      refreshTable();
    }
  } catch (error) {
    console.error(`Error deleting ${props.model}:`, error);
    toast.toast({
      title: "Erro",
      description: `Não foi possível excluir o ${props.model}.`,
      variant: "destructive",
    });
  }
}

// Handle save button click
async function handleSave() {
  try {
    let response;

    // Show loading toast
    toast.toast({
      title: "Processando",
      description: `Aguarde enquanto processamos sua requisição...`,
    });

    if (store.isEditing) {
      response = await store.update(store.currentItem);
      toast.toast({
        title: "Sucesso",
        description: `${props.model} atualizado com sucesso.`,
      });
    } else {
      response = await store.create(store.currentItem);
      toast.toast({
        title: "Sucesso",
        description: `${props.model} criado com sucesso.`,
      });
    }

    emit("item-saved", response || store.currentItem, !store.isEditing);

    // Wait a moment for the store to finish updating
    setTimeout(async () => {
      // First refresh the data from the API
      await fetchData();

      // Then make sure the table refreshes with the new data
      setTimeout(() => {
        refreshTable();
      }, 100);
    }, 100);

  } catch (error) {
    console.error(`Error saving ${props.model}:`, error);
    toast.toast({
      title: "Erro",
      description: `Não foi possível salvar o ${props.model}.`,
      variant: "destructive",
    });
  }
}

// Watch selected rows count for button text update
watch(
  () => selectedRows.value,
  (newValue) => {
    if (props.selectable) {
      const selectButton = tableRef.value?.button(0);
      if (selectButton) {
        selectButton.text(newValue > 0 ? "Selecionar Nenhum" : "Selecionar Todos");
      }
    }
  }
);

// Helper function to get nested values
function getFieldValue(obj: any, path: string): any {
  if (!obj || !path) return '';
  return path.split('.').reduce((o, i) => {
    return o && typeof o === 'object' ? o[i] : undefined;
  }, obj) ?? '';
}

// Helper function to set nested values
function setFieldValue(obj: any, path: string, value: any): void {
  if (!obj || !path) return;

  const parts = path.split('.');
  const last = parts.pop();
  if (!last) return;

  // Create the nested object structure if it doesn't exist
  const target = parts.reduce((o, i) => {
    if (!o[i]) o[i] = {};
    return o[i];
  }, obj);

  // Set the value
  target[last] = value;
}

// Update the sanitizePhoneValue function to work with nested fields
function sanitizePhoneValue(event: Event, fieldPath: string) {
  const input = event.target as HTMLInputElement;
  if (input && store.currentItem && fieldPath) {
    // Get clean digits and limit to 11
    const digits = getPhoneDigits(input.value);
    const limitedDigits = digits.substring(0, 11);

    // Update the store with formatted value
    setFieldValue(store.currentItem, fieldPath, formatPhoneNumber(limitedDigits));
  }
}

// Expose methods
defineExpose({
  getTableInstance: () => tableRef.value,
  getSelectedRows: () => tableRef.value?.rows({ selected: true }).data().toArray() || [],
  refresh: fetchData,
  getStore: () => store
});
</script>

<style scoped>
/* Make sure the table uses proper layout algorithm for column widths */
:deep(table.dataTable) {
  width: 100% !important;
  table-layout: auto;
  border-collapse: collapse;
}

/* Custom search container styling */
:deep(.dt-search-container) {
  min-width: 300px;
  flex-grow: 1;
  display: flex;
  justify-content: flex-end;
}
:deep(.dt-search) {
  min-width: 300px;
  flex-grow: 1;
  display: flex;
  justify-content: flex-end;
}

/* Make the search input wider */
:deep(.dataTables_filter) {
  width: 100%;
  max-width: 400px;
  display: flex;
  justify-content: flex-end;
}

:deep(.dataTables_filter input) {
  width: 100% !important;
  min-width: 250px;
}

/* Allow content-based sizing while respecting minimums */
:deep(table.dataTable th),
:deep(table.dataTable td) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px; /* Prevent any column from getting too wide */
  padding: 8px 10px;
}

/* Ensure action column stays compact */
:deep(.actions-column) {
  width: 80px !important;
  min-width: 80px;
  max-width: 80px;
  text-align: center;
}

/* Make ID column compact */
:deep(table.dataTable th:first-child),
:deep(table.dataTable td:first-child) {
  width: 40px !important;
  min-width: 40px;
  max-width: 40px;
}

/* Allow text content to wrap if needed in cell */
:deep(table.dataTable td:not(:first-child):not(.actions-column)) {
  white-space: normal;
  word-break: break-word;
}

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

.readonly-field {
  background-color: var(--muted);
  color: var(--muted-foreground);
  cursor: default;
  user-select: text;
}

.readonly-label {
  color: var(--muted-foreground);
}
</style>