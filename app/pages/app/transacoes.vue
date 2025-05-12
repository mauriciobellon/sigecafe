<template>
  <div>
    <AppPage>
      <UiCard class="mt-10">
        <UiCardContent>
          <UiGenericDatatable model="transacao" :columns="columns" />
        </UiCardContent>
      </UiCard>
    </AppPage>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["auth"]
});

const columns = [
  {
    label: "ID",
    field: "id",
    type: "number"
  },
  {
    label: "Data",
    field: "data",
    type: "date"
  },
  {
    label: "Comprador",
    field: "comprador.name",
    type: "relation"
  },
  {
    label: "Vendedor",
    field: "vendedor.name",
    type: "relation"
  },
  {
    label: "Qtd",
    field: "quantidade",
    type: "number"
  },
  {
    label: "Unitário",
    field: "precoUnitario",
    type: "money"
  },
  {
    label: "Total",
    field: "valorTotal",
    type: "money"
  },
  {
    label: "Status",
    field: "status",
    type: "status",
    width: "80px",
    statusOptions: [
      { label: "Pendente", value: "PENDENTE" },
      { label: "Concluída", value: "CONCLUIDA" },
      { label: "Cancelada", value: "CANCELADA" }
    ],
    statusClasses: {
      'CONCLUIDA': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'PENDENTE': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'CANCELADA': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }
  }
];
</script>