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
    field: "associado.documento",
    type: "text"
  },
  {
    label: "Endereço",
    field: "associado.endereco",
    type: "text",
    collapsible: true
  },
  {
    label: "Cidade",
    field: "associado.cidade",
    type: "text"
  },
  {
    label: "Estado",
    field: "associado.estado",
    type: "select",
    options: [
      { label: "Acre", value: "AC" },
      { label: "Alagoas", value: "AL" },
      { label: "Amapá", value: "AP" },
      { label: "Amazonas", value: "AM" },
      { label: "Bahia", value: "BA" },
      { label: "Ceará", value: "CE" },
      { label: "Espírito Santo", value: "ES" },
      { label: "Goiás", value: "GO" },
      { label: "Maranhão", value: "MA" },
      { label: "Mato Grosso", value: "MT" },
      { label: "Mato Grosso do Sul", value: "MS" },
      { label: "Minas Gerais", value: "MG" },
      { label: "Pará", value: "PA" },
      { label: "Paraíba", value: "PB" },
      { label: "Paraná", value: "PR" },
      { label: "Pernambuco", value: "PE" },
      { label: "Piauí", value: "PI" },
      { label: "Rio de Janeiro", value: "RJ" },
      { label: "Rio Grande do Norte", value: "RN" },
      { label: "Rio Grande do Sul", value: "RS" },
      { label: "Rondônia", value: "RO" },
      { label: "Roraima", value: "RR" },
      { label: "Santa Catarina", value: "SC" },
      { label: "São Paulo", value: "SP" },
      { label: "Sergipe", value: "SE" },
      { label: "Tocantins", value: "TO" },
      { label: "Distrito Federal", value: "DF" }
    ]
  }
];
</script>