# Relatório de Testes do Sigecafe

## Visão Geral

Este documento fornece uma visão abrangente da estratégia e implementação de testes para a plataforma de negociação de café Sigecafe. A aplicação Sigecafe é uma plataforma especializada projetada para facilitar operações de comércio de café entre produtores, cooperativas e compradores no Brasil. Construída com Nuxt.js para o frontend e PostgreSQL para persistência de dados, a plataforma requer testes completos para garantir que todas as transações e operações do usuário sejam confiáveis e seguras.

Nossa abordagem de testes segue uma estratégia em múltiplas camadas, com testes end-to-end para fluxos críticos de usuário e testes unitários para componentes de lógica de negócios. Esta abordagem abrangente ajuda a manter a estabilidade do sistema durante o desenvolvimento contínuo e adições de funcionalidades.

## Tecnologias de Teste

### Testes End-to-End
- **Playwright**: Selecionado por suas capacidades confiáveis de teste cross-browser e abordagem moderna de API
- **Executor de Testes**: Playwright Test fornece execução paralela, capacidades de retry e relatórios detalhados
- **Suporte a Navegadores**: Testes primários no Chromium com arquitetura preparada para Firefox e WebKit quando necessário
- **Screenshots e Traces**: Captura automática em pontos-chave dos testes e em falhas para auxiliar a depuração
- **Evidência Visual**: Os resultados dos testes incluem screenshots, vídeos e traces para depuração abrangente
- **Modelo de Objeto de Página**: Implementado para interações de página reutilizáveis e de fácil manutenção
- **Interceptação de Rede**: Capacidades para simular respostas de API em cenários de teste isolados

### Testes Unitários
- **Vitest**: Escolhido por sua abordagem de teste compatível com Vue e desempenho superior ao Jest
- **Simulação (Mocking)**: O sistema de mock do Vi fornece capacidades avançadas de simulação para dependências externas
- **Ambiente de Teste**: Node.js com happy-dom para simulação rápida do DOM sem sobrecarga do navegador
- **Suporte a ESM**: Suporte nativo a módulos ES sem configuração complexa
- **Modo de Observação**: Ciclo de feedback rápido durante o desenvolvimento com reexecução focada de testes
- **Relatórios de Cobertura**: Análise automática de cobertura de código para identificar caminhos de código não testados

### Integração com Banco de Dados
- **Prisma Client**: Usado para operações de banco de dados com segurança de tipos durante a configuração e verificação de testes
- **Isolamento de Testes**: Cada suíte de testes é executada com dados isolados usando identificadores únicos
- **Validação de Schema**: Validação automática de operações de banco de dados contra o schema do Prisma
- **Migrações**: Banco de dados de teste mantido sincronizado com o desenvolvimento através de migrações do Prisma
- **Seeding**: Dados de seed específicos para testes disponíveis para condições de teste consistentes

## Estrutura de Testes

### Testes End-to-End (`tests/e2e/`)

#### Testes de Autenticação (`Auth.test.ts`)
- **Status**: ✅ Passando
- **Descrição**: Validação abrangente de todos os fluxos de autenticação da perspectiva do usuário
- **Ambiente de Teste**: Executa contra um servidor de desenvolvimento ao vivo com banco de dados de teste
- **Casos de Teste**:
  1. **Redirecionamento para Página de Autenticação**: Verifica que usuários não autenticados são devidamente redirecionados para a página de login ao acessar recursos protegidos
     - Verifica parâmetros de URL para tratamento adequado de callback
     - Valida cabeçalhos de segurança e estado de autenticação

  2. **Processo Completo de Cadastro**: Testa o fluxo completo de registro de usuário
     - Validação de formulário para campos obrigatórios (nome, email, telefone, senha)
     - Formatação e validação de número de telefone
     - Requisitos de força de senha
     - Mensagens de sucesso e redirecionamento
     - Verificação no banco de dados do registro de usuário criado

  3. **Funcionalidade de Login**: Verifica a autenticação do usuário com credenciais
     - Validação de formulário e estados de erro para credenciais incorretas
     - Criação de sessão e configuração de cookies
     - Redirecionamento adequado para a página inicial/dashboard
     - Persistência do estado de autenticação

  4. **Processo de Logout**: Testa o encerramento completo da sessão
     - Logout baseado na interface através do menu dropdown
     - Limpeza de sessão e remoção de cookies
     - Redirecionamento para a página de login com mensagens apropriadas
     - Prevenção de acesso a rotas protegidas após o logout

  5. **Exclusão de Conta**: Valida o fluxo de auto-exclusão de conta
     - Diálogos de confirmação e validações
     - Exclusões em cascata no banco de dados (preferências, notificações, etc.)
     - Verificação do estado pós-exclusão
     - Prevenção de login com credenciais excluídas

#### Testes de Compradores (`compradores.spec.ts`)
- **Status**: ✅ Passando
- **Descrição**: Testes para a interface de gerenciamento de compradores, cobrindo operações CRUD
- **Ambiente de Teste**: Requer usuário autenticado com privilégios de administrador
- **Casos de Teste**:
  1. **Exibição da Página de Compradores com Datatable**: Valida a página principal de listagem de compradores
     - Carregamento adequado da tabela de dados com paginação
     - Capacidades de ordenação e filtragem de colunas
     - Formatação de dados para números de telefone, endereços, etc.
     - Tratamento de estado vazio quando não existem compradores

  2. **Criação de Novo Comprador via Formulário**: Testa o processo de criação de comprador
     - Validação de formulário para campos obrigatórios e opcionais
     - Submissão de formulário e tratamento de erros
     - Estado de sucesso e adição à tabela de dados
     - Verificação no banco de dados da criação do registro

  3. **Visualização de Detalhes do Comprador**: Verifica a funcionalidade de visualização detalhada
     - Aparecimento de modal/diálogo com informações completas do comprador
     - Formatação e apresentação de dados
     - Exibição de informações relacionadas (transações, histórico)
     - Fechamento do modal e gerenciamento de estado

### Testes Unitários (`tests/unit/`)

#### Testes de Repositório
- **Testes do UsuarioRepository** (`repositories/UsuarioRepository.test.ts`)
  - **Status**: ✅ Passando
  - **Descrição**: Valida operações da camada de acesso a dados para gerenciamento de usuários
  - **Estratégia de Simulação**: O cliente Prisma é simulado para evitar conexões com o banco de dados
  - **Validações Principais**:
    - **Criação de Usuário**: Testa a criação de novos usuários com validação adequada de dados
      - Validação de campos obrigatórios
      - Tratamento de restrição de unicidade (email, telefone)
      - Operações de hash de senha
      - Estrutura do valor de retorno

    - **Recuperação de Usuário**: Testa a busca de usuários por vários identificadores
      - Por ID com dados completos de perfil
      - Por email com medidas de segurança
      - Por número de telefone com tratamento de formatação
      - Tratamento de usuário inexistente

    - **Exclusão de Usuário**: Testa a remoção adequada do usuário com limpeza de registros relacionados
      - Remoção de registros de preferências
      - Limpeza de registros de notificações
      - Tratamento de registros de transações
      - Exclusão de tokens de redefinição de senha
      - Gerenciamento de restrições de chave estrangeira

#### Testes de Endpoints de API
- **Testes da API de Transações** (`api/transacoes.test.ts`)
  - **Status**: ✅ Passando
  - **Descrição**: Valida endpoints de API para operações de transação de café
  - **Abordagem de Simulação**: A camada de repositório é simulada para isolar a lógica da API
  - **Autenticação**: Os testes incluem simulação de estado de autenticação
  - **Validações Principais**:
    - **Criação de Transação**: Testa a API para criar novas transações de comércio de café
      - Validação de campos obrigatórios (quantidade, preço, participantes)
      - Aplicação de regras de negócio (quantidades mínimas, partes válidas)
      - Estrutura de resposta e códigos de status
      - Tratamento de erros para entradas inválidas

    - **Histórico de Transações**: Testa a recuperação de registros de transações
      - Filtragem por intervalos de data
      - Filtragem por partes da transação
      - Opções de paginação e ordenação
      - Formato de resposta e estrutura de dados

    - **Filtragem de Transações**: Testa capacidades de filtragem especializada
      - Por tipo de café (Robusta, Arábica)
      - Por faixas de preço
      - Por localização geográfica
      - Por status da transação

#### Testes de Utilitários
- **Testes de Utilitários de Criptografia** (`utils/crypto.test.ts`)
  - **Status**: ✅ Passando
  - **Descrição**: Valida utilitários criptográficos usados em toda a aplicação
  - **Abordagem de Teste**: Teste de função pura com entradas variadas
  - **Desempenho**: Inclui benchmarks para operações críticas
  - **Validações Principais**:
    - **Hash de Senha**: Testa recursos de segurança de senha baseados em bcrypt
      - Geração e aplicação de salt
      - Unicidade de hash para senhas idênticas
      - Desempenho dentro de limites aceitáveis
      - Compatibilidade com o sistema de autenticação

    - **Verificação de Senha**: Testa funcionalidade de comparação
      - Validação de senha correta
      - Rejeição de senha incorreta
      - Resistência a ataques de tempo
      - Tratamento de erros para entradas inválidas

    - **Geração de Token**: Testa a criação de token de segurança para fluxos de redefinição
      - Aleatoriedade e unicidade
      - Requisitos de comprimento e complexidade
      - Inclusão de timestamp de expiração
      - Validação de formato

## Padrões e Práticas de Teste

### Gerenciamento de Dados de Teste
- **Unicidade Baseada em Timestamp**: Cada execução de teste gera identificadores únicos usando timestamps
  - Emails de usuário seguem o padrão `teste2e_${timestamp}@teste.com`
  - Números de telefone usam sufixos únicos de timestamps
  - Nomes incluem timestamps para fácil identificação em logs
  - Previne interferência de teste quando executados em paralelo ou em sequência

- **Limpeza**: Os testes lidam com sua própria limpeza de dados em hooks afterEach/afterAll
  - Exclusão em ordem reversa para respeitar restrições de chave estrangeira
  - Verificação de exclusão bem-sucedida para evitar registros órfãos
  - Mecanismos de limpeza de fallback para casos de erro
  - Registro de operações de limpeza para depuração

- **Verificação**: O estado do banco de dados é explicitamente verificado após operações
  - Recuperação de registros criados para confirmar atributos
  - Consultas de contagem para verificar o número esperado de registros
  - Verificações de integridade relacional para registros associados
  - Isolamento de transação para evitar contaminação cruzada de teste

### Tratamento de Autenticação
- **Criação de Usuário de Teste**: Criado dinamicamente para cada suíte de testes
  - Usuários criados com privilégios mínimos necessários
  - Criação direta no banco de dados para confiabilidade
  - Cache de credenciais para reduzir overhead de criação
  - Pool de usuários de teste separado dos dados de desenvolvimento

- **Permissões**: Usuários de teste criados com permissões de função apropriadas
  - Criação de usuário de teste baseada em função (Admin, Comprador, Produtor)
  - Verificação de permissão antes da execução do teste
  - Simulação de diferentes níveis de privilégio
  - Teste de limites de permissão e restrições

- **Gerenciamento de Sessão**: Estado de login mantido dentro dos contextos de teste
  - Tratamento de cookies para tokens de autenticação
  - Atualização de sessão quando necessário para testes de longa duração
  - Logout adequado entre casos de teste
  - Isolamento do estado de autenticação entre execuções de teste

### Seletores Resilientes
- **Múltiplas Estratégias de Seletor**: Os testes usam múltiplas abordagens de seletor
  - Seletores baseados em função (getByRole) para compatibilidade de acessibilidade
  - Seletores baseados em texto para elementos específicos de idioma
  - Seletores de atributo para identificadores técnicos estáveis
  - Seletores CSS como fallback para casos complexos

- **Mecanismos de Fallback**: Se uma abordagem de seleção falhar, alternativas são tentadas
  - Tentativas de seletor em cascata com registro detalhado
  - Esperas dinâmicas baseadas no estado da aplicação
  - Recuperação de erro com caminhos alternativos
  - Condições de pulo para testes quando pré-requisitos não podem ser atendidos

- **Timeouts**: Timeouts generosos para operações de UI com tratamento de erro apropriado
  - Timeouts graduados baseados na complexidade da operação
  - Multiplicadores de timeout configuráveis para ambientes CI
  - Mensagens de erro claras indicando causas de timeout
  - Captura de screenshot em pontos de timeout

### Tratamento de Erros
- **Screenshots**: Captura automática em pontos-chave e em falhas
  - Nomes de arquivo com timestamp para fácil correlação com logs
  - Múltiplos screenshots durante fluxos complexos
  - Pares antes/depois para operações de mudança de estado
  - Capturas de página completa para preservação de contexto

- **Logging**: Saída detalhada no console para depuração
  - Logging estruturado com timestamps e categorias
  - Modo verboso para solução de problemas de desenvolvimento
  - Ruído reduzido em ambientes CI
  - Informações de contexto (nome do teste, navegador, etc.)

- **Degradação Graciosa**: Os testes pulam ou se adaptam quando pré-condições não são atendidas
  - Chamadas explícitas skip() com mensagens significativas
  - Execução condicional baseada em detecção de recursos
  - Fluxos alternativos para diferentes ambientes
  - Mecanismos de auto-cura para problemas menores

### Estratégia de Simulação
- **Simulação de Repositório**: Repositórios de banco de dados são simulados para testes unitários
  - Simulação em nível de função com vi.fn()
  - Simulação de valor de retorno para diferentes cenários
  - Simulação de estado de erro para teste de robustez
  - Redefinição de mock entre casos de teste

- **Simulação de API**: Dependências de API externa são simuladas
  - Interceptação de requisição de rede em testes e2e
  - Fixtures de resposta estática para testes consistentes
  - Geração dinâmica de resposta para cenários complexos
  - Simulação de latência para teste de timeout

- **Problemas de Hoisting**: Atenção especial ao comportamento de hoisting do vi.mock()
  - Definições de mock em nível de módulo
  - Sequenciamento de importação para respeitar limitações de hoisting
  - Atualização dinâmica de implementação de mock quando necessário
  - Separação clara de configuração e uso de mock

## Conclusão

A suíte de testes do Sigecafe fornece cobertura abrangente de caminhos críticos da aplicação com uma combinação robusta de testes end-to-end e unitários. O sistema de autenticação foi validado completamente, garantindo operações de usuário seguras e confiáveis. Os testes da camada de repositório confirmam a integridade das operações de dados, enquanto os testes de API verificam a implementação correta da lógica de negócios.

A arquitetura de teste segue as melhores práticas para teste de aplicações web, com atenção particular ao isolamento de teste, gerenciamento de dados e tratamento de erros. A implementação de seletores resilientes e tratamento completo de autenticação garante que os testes permaneçam estáveis durante mudanças de desenvolvimento.