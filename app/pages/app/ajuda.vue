<template>
  <div>
    <UiCard class="mt-10 mb-6">
      <UiCardHeader>
        <UiCardTitle>Respostas</UiCardTitle>
        <UiCardDescription>
          Encontre respostas para suas dúvidas e aprenda a utilizar todas as funcionalidades do sistema
        </UiCardDescription>
      </UiCardHeader>
      <UiCardContent>
        <UiTabs defaultValue="geral" class="w-full">
          <UiTabsList class="grid w-full grid-cols-2 lg:grid-cols-4">
            <UiTabsTrigger value="geral">Geral</UiTabsTrigger>
            <UiTabsTrigger value="acesso">Acesso</UiTabsTrigger>
            <UiTabsTrigger value="perfis">Perfis</UiTabsTrigger>
            <UiTabsTrigger value="suporte">Suporte</UiTabsTrigger>
          </UiTabsList>

          <UiTabsContent value="geral">
            <div class="space-y-4 mt-4">
              <UiAccordion type="single" collapsible>
                <UiAccordionItem value="item-1">
                  <UiAccordionTrigger>O que é o SigeCafe?</UiAccordionTrigger>
                  <UiAccordionContent>
                    Uma plataforma de gerenciamento para o mercado de café que conecta compradores e produtores,
                    oferecendo um ecossistema digital completo que integra controle de transações, acompanhamento
                    de preços do café e geração de relatórios.
                  </UiAccordionContent>
                </UiAccordionItem>

                <UiAccordionItem value="item-2">
                  <UiAccordionTrigger>Como funciona o sistema de notificações?</UiAccordionTrigger>
                  <UiAccordionContent>
                    O sistema envia notificações automáticas sobre novas transações, mudanças nos preços do café e
                    atividades relevantes para o seu perfil. As notificações são personalizáveis e podem ser
                    configuradas de acordo com as preferências de cada usuário.
                  </UiAccordionContent>
                </UiAccordionItem>
              </UiAccordion>
            </div>
          </UiTabsContent>

          <UiTabsContent value="acesso">
            <div class="space-y-4 mt-4">
              <UiAccordion type="single" collapsible>
                <UiAccordionItem value="item-1">
                  <UiAccordionTrigger>Como faço login no sistema?</UiAccordionTrigger>
                  <UiAccordionContent>
                    <ol class="list-decimal pl-4 space-y-2">
                      <li>Acesse a página de login</li>
                      <li>Digite seu número de celular cadastrado</li>
                      <li>Digite sua senha</li>
                      <li>Clique em "Entrar"</li>
                    </ol>
                  </UiAccordionContent>
                </UiAccordionItem>

                <UiAccordionItem value="item-2">
                  <UiAccordionTrigger>Como recuperar minha senha?</UiAccordionTrigger>
                  <UiAccordionContent>
                    Na página de login, clique em "Esqueci minha senha" e siga as instruções
                    enviadas para seu celular cadastrado.
                  </UiAccordionContent>
                </UiAccordionItem>
              </UiAccordion>
            </div>
          </UiTabsContent>

          <UiTabsContent value="perfis">
            <div class="space-y-4 mt-4">
              <UiAccordion type="single" collapsible>
                <UiAccordionItem value="item-1">
                  <UiAccordionTrigger>Quais são os tipos de perfis disponíveis?</UiAccordionTrigger>
                  <UiAccordionContent>
                    <ul class="list-disc pl-4 space-y-2">
                      <li>Administrador: Gerencia todas as configurações da plataforma</li>
                      <li>Cooperativa: Administra associados e transações</li>
                      <li>Produtor: Gerencia vendas e acompanha preços</li>
                      <li>Comprador: Realiza compras de café e gerencia transações</li>
                    </ul>
                  </UiAccordionContent>
                </UiAccordionItem>
              </UiAccordion>
            </div>
          </UiTabsContent>

          <UiTabsContent value="suporte">
            <div class="mt-4 space-y-6">
              <div class="rounded-lg border p-4">
                <h3 class="font-semibold mb-2">Precisa de ajuda adicional?</h3>
                <p class="text-sm text-muted-foreground mb-4">
                  Nossa equipe está disponível para ajudar com qualquer dúvida ou problema técnico.
                </p>
                <UiButton>
                  <Icon name="lucide:message-square" class="mr-2 h-4 w-4" />
                  Contatar Suporte
                </UiButton>
              </div>
            </div>
          </UiTabsContent>
        </UiTabs>
      </UiCardContent>
    </UiCard>
  </div>
</template>

<script lang="ts" setup></script>