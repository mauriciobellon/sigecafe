<template>
  <div>
    <AppPage>
      <UiCard class="mt-10">
        <UiCardContent>
            <UiGenericDatatable
              model="Colaborador"
              :columns="columns"
              selectable
            />
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
    label: "Cargo",
    field: "colaborador.cargo",
    type: "text"
  }
];
</script>