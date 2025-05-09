<template>
  <div>
    <AppPage>
      <UiCard class="mt-10">
        <UiCardContent>
          <UiGenericDatatable model="Comprador" :columns="columns" />
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
    type: "text"
  },
  {
    label: "Nome",
    field: "name",
    type: "text"
  },
  {
    label: "Celular",
    field: "celular",
    type: "phone"
  },
  {
    label: "Documento",
    field: "comprador.documento",
    type: "text"
  },
  {
    label: "Endereço",
    field: "comprador.endereco",
    type: "text"
  },
  {
    label: "Cidade",
    field: "comprador.cidade",
    type: "text"
  },
  {
    label: "Estado",
    field: "comprador.estado",
    type: "select",
    options: [
      { label: "SP", value: "SP" },
      { label: "RJ", value: "RJ" },
      { label: "MG", value: "MG" },
      { label: "ES", value: "ES" },
      { label: "PR", value: "PR" },
      { label: "SC", value: "SC" },
      { label: "RS", value: "RS" },
      { label: "BA", value: "BA" },
      { label: "SE", value: "SE" },
      { label: "PE", value: "PE" },
      { label: "AL", value: "AL" },
      { label: "PB", value: "PB" },
      { label: "RN", value: "RN" },
      { label: "CE", value: "CE" },
      { label: "PI", value: "PI" },
      { label: "MA", value: "MA" },
      { label: "PA", value: "PA" },
      { label: "AP", value: "AP" },
      { label: "AM", value: "AM" },
      { label: "RO", value: "RO" }
    ]
  }
];
</script>