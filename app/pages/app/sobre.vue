<template>
  <div>
    <UiCard class="mt-10 mb-6">
      <UiCardHeader>
        <UiCardTitle>O que é o Escola ON?</UiCardTitle>
        <UiCardDescription>
          Uma plataforma educacional que revoluciona a comunicação entre escolas e famílias
        </UiCardDescription>
      </UiCardHeader>
      <UiCardContent>
        <p class="mb-4">
          Nossa solução oferece um ecossistema digital completo que integra gestão acadêmica,
          comunicação instantânea e acompanhamento em tempo real do desempenho escolar.
        </p>

        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div class="flex flex-col gap-2 rounded-lg border p-4">
            <div class="flex items-center gap-2">
              <Icon name="lucide:message-square" class="h-5 w-5 text-primary" />
              <h3 class="font-semibold">Comunicação Instantânea</h3>
            </div>
            <p class="text-sm text-muted-foreground">
              Integração nativa com WhatsApp para notificações automáticas e personalizáveis
            </p>
          </div>

          <div class="flex flex-col gap-2 rounded-lg border p-4">
            <div class="flex items-center gap-2">
              <Icon name="lucide:users" class="h-5 w-5 text-primary" />
              <h3 class="font-semibold">Multi-perfil</h3>
            </div>
            <p class="text-sm text-muted-foreground">
              Interfaces específicas para coordenadores, professores e responsáveis
            </p>
          </div>

          <div class="flex flex-col gap-2 rounded-lg border p-4">
            <div class="flex items-center gap-2">
              <Icon name="lucide:shield-check" class="h-5 w-5 text-primary" />
              <h3 class="font-semibold">Segurança</h3>
            </div>
            <p class="text-sm text-muted-foreground">
              Autenticação robusta e controle granular de permissões
            </p>
          </div>
        </div>
      </UiCardContent>
    </UiCard>

    <UiCard>
      <UiCardHeader>
        <UiCardTitle>Tecnologias Utilizadas</UiCardTitle>
        <UiCardDescription>
          Stack moderna e robusta para garantir a melhor experiência
        </UiCardDescription>
      </UiCardHeader>
      <UiCardContent>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-1">
            <h4 class="font-medium">Frontend</h4>
            <p class="text-sm text-muted-foreground">Nuxt.js 4 com TailwindCSS</p>
          </div>
          <div class="space-y-1">
            <h4 class="font-medium">Backend</h4>
            <p class="text-sm text-muted-foreground">Node.js com Prisma ORM</p>
          </div>
          <div class="space-y-1">
            <h4 class="font-medium">Banco de Dados</h4>
            <p class="text-sm text-muted-foreground">PostgreSQL</p>
          </div>
          <div class="space-y-1">
            <h4 class="font-medium">Notificações</h4>
            <p class="text-sm text-muted-foreground">API WPPConnect para WhatsApp</p>
          </div>
        </div>
      </UiCardContent>
    </UiCard>
  </div>
</template>

<script lang="ts" setup></script>

<style scoped></style>
