# Desenvolvimento

## Padrões de Projeto

Durante o desenvolvimento do Portal de Acompanhamento do Desempenho Escolar, foi essencial adotar uma série de padrões de projeto para garantir a robustez, manutenibilidade e escalabilidade do sistema. Esses padrões foram escolhidos com base nas melhores práticas de engenharia de software e nas necessidades específicas do projeto. A seguir, detalhamos os principais padrões de projeto implementados:

### 1. Repository Pattern
Utilizado para abstrair a camada de acesso a dados, isolando a lógica de persistência do resto da aplicação. Este padrão permite maior flexibilidade na mudança do mecanismo de armazenamento e facilita os testes unitários.

### 2. DTO (Data Transfer Objects)
Implementado para encapsular a transferência de dados entre as camadas da aplicação, garantindo a tipagem segura e validação dos dados que trafegam pelo sistema.

### 3. Service Layer
Padrão aplicado para encapsular a lógica de negócio complexa, mantendo os controladores simples e focados apenas na coordenação das requisições e respostas.

### 4. Factory Pattern
Utilizado para criar instâncias de objetos complexos, principalmente em cenários de teste, permitindo maior flexibilidade na criação de objetos e facilitando a manutenção.

### 5. Middleware Pattern
Implementado para processar requisições HTTP, realizando validações, autenticação e transformações necessárias antes do processamento principal.

### 6. Strategy Pattern
Aplicado na implementação de diferentes estratégias de cálculo de métricas de desempenho, permitindo a fácil adição de novos métodos de cálculo sem modificar o código existente.

### 7. Observer Pattern
Utilizado no sistema de notificações, permitindo que diferentes partes do sistema sejam notificadas automaticamente quando eventos específicos ocorrem.

### 8. Singleton Pattern
Implementado para garantir instância única de serviços críticos do sistema, como conexões com banco de dados e serviços de cache.

A implementação destes padrões proporcionou:
- Maior manutenibilidade do código
- Melhor testabilidade
- Maior escalabilidade do sistema
- Maior segurança no controle de dados
- Reutilização eficiente de código

A escolha destes padrões foi baseada nas necessidades específicas do projeto, visando criar uma base sólida para o desenvolvimento e manutenção futura do sistema.

## Ambiente de Desenvolvimento

Criamos um roteiro para preparar o ambiente de desenvolvimento, garantindo que todas as dependências estejam configuradas corretamente e permitindo que o desenvolvedor foque no desenvolvimento da aplicação em vez de gastar tempo com a preparação manual do ambiente, também criamos alguns scripts que automatizam parte do trabalho de preparo do ambiente de desenvolvimento.

#### Exemplo de Script

 - **db-create:** Responsável por criar uma instância do banco de dados local para uso durante a etapa de desenvolvimento, garantindo que todas as tabelas e esquemas estejam preparados conforme necessário.

 - **db-destroy:** Esse script destrói a instância do banco de dados local utilizada durante o desenvolvimento, permitindo uma limpeza completa do ambiente.

 - **db-seed:** Popula o banco de dados com dados iniciais para testes, como usuários fictícios, atividades e notas de alunos, facilitando a validação de funcionalidades durante o desenvolvimento.

 - **env-create:** Cria o arquivo de variáveis de ambiente necessário para configurar o ambiente de desenvolvimento, incluindo credenciais, URLs e outras configurações importantes para a execução da aplicação.

 - **run-test:** Automatiza a execução dos testes definidos, tanto unitários quanto de ponta a ponta, garantindo que todas as funcionalidades estejam funcionando conforme o esperado antes de prosseguir para etapas subsequentes.

 - **server-destroy:** Responsável por finalizar e destruir a instância do servidor local, garantindo que não haja processos residuais em execução após os testes ou desenvolvimento.

## Rotina de Testes

Para garantir a qualidade e a funcionalidade do Portal de Acompanhamento do Desempenho Escolar, implementamos uma abordagem abrangente de testes, que incluiu **testes unitários** e **testes de ponta a ponta (E2E)**. Esses testes foram essenciais para validar a robustez, a segurança e a experiência do usuário, assegurando que a plataforma funcione como esperado em diferentes cenários de uso. Abaixo, detalhamos a metodologia utilizada, as ferramentas empregadas e um exemplo representativo dos testes implementados.

#### 1. **Testes Unitários**

Os testes unitários foram desenvolvidos para verificar o comportamento correto de funções e componentes individuais do sistema. Focamos em validar regras de negócio e a integração entre o frontend e o backend em pontos críticos, como o cálculo de métricas de desempenho dos alunos e a autenticação. Esses testes garantem que cada módulo do sistema esteja funcionando conforme o esperado antes de ser integrado com outros componentes, o que contribui para uma maior estabilidade e facilita a detecção precoce de erros.

Os testes unitários cobriram diversas funcionalidades, incluindo:

- Validação de entrada de dados nos formulários.
- Regras de negócio como o cálculo de notas dos alunos.
- Integração entre componentes do frontend e backend, validando se os dados eram processados e retornados conforme o esperado.

####  1.1 **Exemplo de Teste Unitário: Criptografia de Senhas**


Um exemplo de teste unitário que desenvolvemos está relacionado à validação de senhas, incluindo a criação de hash e a verificação de senhas. Esse teste é essencial para garantir que as senhas dos usuários sejam armazenadas de forma segura e que sejam verificadas corretamente durante o login. O teste abaixo ilustra a validação de uma senha, desde a criação do hash até a verificação de sua correspondência:


Na primeira parte, são realizados testes para garantir que o hash gerado para uma senha seja válido, que diferentes hashes sejam gerados para a mesma senha, e que o sistema lide corretamente com senhas vazias ou muito longas.

```typescript

import { describe, it, expect } from 'vitest';
import { hash, verify } from '@@/server/utils/crypto';

describe('Criptografia', () => {
    const SENHA_TESTE = 'senha123';
    const SENHA_INVALIDA = 'senhaerrada';
    const SENHA_VAZIA = '';
    const SENHA_LONGA = 'a'.repeat(72); 
    describe('hash', () => {
        it('deve gerar um hash bcrypt válido', async () => {
            const senhaCriptografada = await hash(SENHA_TESTE);
            expect(senhaCriptografada).not.toBe(SENHA_TESTE);
            expect(senhaCriptografada).toMatch(/^\$2[ayb]\$.{56}$/);
        });

        it('deve gerar hashes diferentes para a mesma senha', async () => {
            const [senhaCriptografada1, senhaCriptografada2] = await Promise.all([
                hash(SENHA_TESTE),
                hash(SENHA_TESTE)
            ]);
            expect(senhaCriptografada1).not.toBe(senhaCriptografada2);
        });

        it('deve lidar com senha vazia', async () => {
            await expect(hash(SENHA_VAZIA)).rejects.toThrow();
        });

        it('deve lidar com senha muito longa', async () => {
            const senhaCriptografada = await hash(SENHA_LONGA);
            expect(senhaCriptografada).toMatch(/^\$2[ayb]\$.{56}$/);
        });
    });

```

Na segunda parte, são realizados testes para verificar se uma senha correta é validada com sucesso, se uma senha incorreta é rejeitada, e se o sistema lida corretamente com hashes inválidos ou vazios. Esses testes são essenciais para garantir a segurança e a integridade do processo de autenticação no sistema.


```typescript

    describe('verify', () => {
        it('deve validar uma senha correta', async () => {
            const senhaCriptografada = await hash(SENHA_TESTE);
            const corresponde = await verify(SENHA_TESTE, senhaCriptografada);
            expect(corresponde).toBe(true);
        });

        it('deve rejeitar uma senha incorreta', async () => {
            const senhaCriptografada = await hash(SENHA_TESTE);
            const corresponde = await verify(SENHA_INVALIDA, senhaCriptografada);
            expect(corresponde).toBe(false);
        });

        it('deve rejeitar um hash inválido', async () => {
            await expect(verify(SENHA_TESTE, 'hash_invalido')).rejects.toThrow();
        });

        it('deve rejeitar um hash vazio', async () => {
            await expect(verify(SENHA_TESTE, '')).rejects.toThrow();
        });

        it('deve rejeitar uma senha vazia', async () => {
            const senhaCriptografada = await hash(SENHA_TESTE);
            await expect(verify(SENHA_VAZIA, senhaCriptografada)).rejects.toThrow();
        });

        it('deve lidar com senha muito longa corretamente', async () => {
            const senhaCriptografada = await hash(SENHA_LONGA);
            const corresponde = await verify(SENHA_LONGA, senhaCriptografada);
            expect(corresponde).toBe(true);
        });
    });
});

```

#### 1.2 **Exemplo de Teste Unitário: Repositório de Alunos**

O teste abaixo ilustra a validação de criação de um aluno, desde a criação do aluno até a verificação de sua correspondência.

O repositório de alunos é responsável por criar, atualizar, deletar e buscar alunos no banco de dados. Ele serve como uma camada de abstração entre a aplicação e o banco de dados, permitindo que as regras de negócio sejam implementadas de forma mais clara e fácil de manter.


**Setup** do teste:

```typescript

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AlunoRepository } from '@@/server/repositories/AlunoRepository';
import prisma from '@@/lib/prisma';

// Mock do prisma
vi.mock('@@/lib/prisma', () => ({
  default: {
    aluno: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn()
    }
  }
}));

```

**Teste** do repositório de alunos: 

```typescript

describe('AlunoRepository', () => {
    let alunoRepository: AlunoRepository;

    beforeEach(() => {
        alunoRepository = new AlunoRepository();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

```

**Teste** para criar um aluno:

```typescript

    describe('create', () => {
        it('deve criar um novo aluno com sucesso', async () => {
            const mockAluno = {
                nome: 'Aluno Teste',
                escolaId: 1,
            };

            const mockResposta = {
                id: 1,
                ...mockAluno
            };

            (prisma.aluno.create as any).mockResolvedValue(mockResposta);

            const alunoCreated = await alunoRepository.create(mockAluno as any);

            expect(alunoCreated).toHaveProperty('id');
            expect(alunoCreated.nome).toBe(mockAluno.nome);
            expect(alunoCreated.escolaId).toBe(mockAluno.escolaId);
            expect(prisma.aluno.create).toHaveBeenCalledTimes(1);
        });

        it('deve lançar erro ao criar aluno sem nome', async () => {
            const mockAluno = {
                escolaId: 1,
            };

            await expect(alunoRepository.create(mockAluno as any)).rejects.toThrow();
        });
    });

```

**Teste** para atualizar um aluno:

```typescript

    describe('update', () => {
        it('deve atualizar um aluno existente', async () => {
            const mockAluno = {
                id: 1,
                nome: 'Aluno Atualizado',
            };

            (prisma.aluno.update as any).mockResolvedValue(mockAluno);

            const alunoAtualizado = await alunoRepository.update(mockAluno as any);

            expect(alunoAtualizado.nome).toBe(mockAluno.nome);
            expect(prisma.aluno.update).toHaveBeenCalledTimes(1);
        });
    });

```

**Teste** para deletar um aluno:

```typescript

    describe('delete', () => {
        it('deve deletar um aluno', async () => {
            const alunoId = 1;
            await alunoRepository.delete(alunoId);
            expect(prisma.aluno.delete).toHaveBeenCalledWith({
                where: { id: alunoId }
            });
        });
    });

```

**Teste** para buscar alunos por escola:


```typescript

    describe('getAlunosByEscola', () => {
        it('deve retornar alunos por escola', async () => {
            const escolaId = 1;
            const mockAlunos = [
                { id: 1, nome: 'Aluno 1', escolaId },
                { id: 2, nome: 'Aluno 2', escolaId }
            ];

            (prisma.aluno.findMany as any).mockResolvedValue(mockAlunos);

            const alunos = await alunoRepository.getAlunosByEscola(escolaId);

            expect(alunos).toHaveLength(2);
            expect(prisma.aluno.findMany).toHaveBeenCalledWith({
                where: { escolaId }
            });
        });
    });

```

**Teste** para buscar alunos por responsável:

```typescript

    describe('getAlunosByResponsavel', () => {
        it('deve retornar alunos por responsável', async () => {
            const responsavelId = 1;
            const mockAlunos = [
                { id: 1, nome: 'Aluno 1' },
                { id: 2, nome: 'Aluno 2' }
            ];

            (prisma.aluno.findMany as any).mockResolvedValue(mockAlunos);

            const alunos = await alunoRepository.getAlunosByResponsavel(responsavelId);

            expect(alunos).toHaveLength(2);
            expect(prisma.aluno.findMany).toHaveBeenCalledWith({
                where: {
                    responsaveis: { some: { id: responsavelId } }
                }
            });
        });
    });
});


```




#### 2. **Testes de Ponta a Ponta (E2E)**

Os testes E2E foram projetados para validar fluxos completos do sistema, assegurando que todas as funcionalidades funcionassem como esperado na interface do usuário. Diferente dos testes unitários, os testes E2E focam em simular a experiência real do usuário, verificando se todas as etapas de um processo funcionam em conjunto. Utilizamos **Nuxt Test Utils** e **Playwright** integrados com **Vitest** para criar e gerenciar esses testes, garantindo que todos os cenários relevantes fossem abrangidos.

Os testes de ponta a ponta foram utilizados para validar:

- O fluxo de autenticação, incluindo login, criação de conta, logout e exclusão de conta.
- O cadastro e edição de atividades e notas dos alunos.
- A interação dos usuários com as funcionalidades principais, como acesso ao painel de desempenho e relatórios comparativos.

##### Ferramentas Utilizadas:

- **Nuxt Test Utils**: Configuração de ambiente de teste otimizada para aplicações Nuxt.js, permitindo simular diferentes condições e configurações de ambiente para garantir a funcionalidade do sistema.
- **Playwright**: Testes de automação no navegador para validar a experiência do usuário em diferentes dispositivos e navegadores, garantindo a compatibilidade da aplicação.
- **Vitest**: Estrutura de testes leve e rápida para validar o código, garantindo que as funcionalidades básicas fossem implementadas sem erros.

#### 2.2 **Exemplo de Teste E2E**

Um exemplo de teste que desenvolvemos está relacionado ao fluxo de autenticação, incluindo a criação de conta, login, logout e exclusão de conta. Esse fluxo é essencial para garantir que os usuários possam acessar a plataforma de forma segura e que suas credenciais sejam devidamente gerenciadas. O teste abaixo ilustra a validação do fluxo de criação de conta, desde o preenchimento dos campos até a confirmação do redirecionamento para a página inicial do sistema:


**Setup** do teste:

```typescript
import { createPage, url } from "@nuxt/test-utils/e2e";
import type { Page } from "playwright-core";
import { describe, expect, test, beforeAll, afterAll } from "vitest";
import { UsuarioRepository } from "@@/server/repositories/UsuarioRepository";
import setup from "./__setup";

describe("Fluxo de Autenticação", () => {
    const usuarioTeste = {
        name: "Usuário Teste",
        email: "teste@teste.com",
        password: "senha123"
    };

    let page: Page;
    let usuarioRepository: UsuarioRepository;

    beforeAll(async () => {
        // Configuração
        setup();
        usuarioRepository = new UsuarioRepository();
        page = await createPage();

        // Limpa usuário de teste existente se houver
        try {
            await usuarioRepository.deleteUsuarioByEmail(usuarioTeste.email);
        } catch (error) {
            // Ignora se o usuário não existir
        }
    });

    afterAll(async () => {
        // Limpeza
        try {
            await usuarioRepository.deleteUsuarioByEmail(usuarioTeste.email);
        } catch (error) {
            // Ignora se o usuário não existir
        }
        await page.close();
    });

```

**Teste 1:** Confirma que o usuário não autenticado é redirecionado para a página de autenticação ao acessar a home:

```typescript

    describe("Acesso Restrito Não Autenticado", () => {
        test("deve redirecionar para página de autenticação ao acessar home", async () => {
            await page.goto(url("/"), { waitUntil: "networkidle" });
            const caminhoAtual = new URL(page.url()).pathname;
            expect(caminhoAtual).toBe("/auth");
        });
    });


```

**Teste 2:** Confirma que o usuário é redirecionado para a página de cadastro ao acessar a página de autenticação:

```typescript


    describe("Fluxo de Cadastro", () => {
        test("deve carregar página de cadastro", async () => {
            await page.goto(url("/auth/signup"), { waitUntil: "networkidle" });
            expect(page.url()).toContain("/auth/signup");
        });

        test("deve permitir inserir nome", async () => {
            await page.getByPlaceholder("Nome Completo").fill(usuarioTeste.name);
            await page.getByRole("button").click();
            // Adicione asserção para visibilidade do próximo passo se aplicável
        });

        test("deve permitir inserir email", async () => {
            await page.getByPlaceholder("nome@exemplo.com").fill(usuarioTeste.email);
            await page.getByRole("button").click();
            // Adicione asserção para visibilidade do próximo passo se aplicável
        });

        test("deve permitir inserir senha e completar cadastro", async () => {
            await page.getByPlaceholder("********").fill(usuarioTeste.password);
            await page.getByRole("button").click();

            await page.waitForURL(url("app"));
            const caminhoAtual = new URL(page.url()).pathname;
            expect(caminhoAtual).toBe("/app");
        });
    });


```

**Teste 3:** Confirma que o usuário é redirecionado para a página de logout ao acessar a página de autenticação:

```typescript


    describe("Fluxo de Logout", () => {
        test("deve mostrar opção de logout no menu dropdown", async () => {
            await page.getByTestId("dropdown-button").click();
            const botaoSair = page.getByTestId("dropdown-button-Sair");
            expect(await botaoSair.isVisible()).toBe(true);
        });

        test("deve fazer logout com sucesso e redirecionar para autenticação", async () => {
            await page.getByTestId("dropdown-button-Sair").click();
            await page.waitForURL(url("auth?callbackUrl=http://localhost:3000/app"));
            const caminhoAtual = new URL(page.url()).pathname;
            expect(caminhoAtual).toBe("/auth");
        });
    });


```

**Teste 4:** Confirma que o usuário é redirecionado para a página de login ao acessar a página de autenticação:

```typescript


    describe("Fluxo de Login", () => {
        test("deve carregar página de login", async () => {
            await page.goto(url("/auth"), { waitUntil: "networkidle" });
            expect(page.url()).toContain("/auth");
        });

        test("deve permitir inserir email", async () => {
            await page.getByRole("textbox", { name: "email" }).fill(usuarioTeste.email);
            await page.getByRole("button").click();
            // Adicione asserção para visibilidade do campo de senha se aplicável
        });

        test("deve permitir inserir senha e completar login", async () => {
            await page.getByRole("textbox", { name: "password" }).fill(usuarioTeste.password);
            await page.getByRole("button").click();

            await page.waitForURL(url("app"));
            const caminhoAtual = new URL(page.url()).pathname;
            expect(caminhoAtual).toBe("/app");
        });
    });


```

**Teste 5:** Confirma que o usuário é redirecionado para a página de exclusão de conta ao acessar a página de perfil:

```typescript


    describe("Exclusão de Conta", () => {
        test("deve mostrar opção de conta no menu dropdown", async () => {
            await page.getByTestId("dropdown-button").click();
            const botaoConta = page.getByTestId("dropdown-button-Conta");
            expect(await botaoConta.isVisible()).toBe(true);
        });

        test("deve redirecionar com sucesso para página da conta", async () => {
            await page.getByTestId("dropdown-button-Conta").click();
            await page.waitForURL(url("app/perfil"));
            const caminhoAtual = new URL(page.url()).pathname;
            expect(caminhoAtual).toBe("/app/perfil");
        });

        test("deve mostrar opção de excluir conta na página da conta", async () => {
            await page.getByTestId("nav-link-Excluir Conta").click();
            await page.waitForURL(url("app/perfil/excluir"));
            const caminhoAtual = new URL(page.url()).pathname;
            expect(caminhoAtual).toBe("/app/perfil/excluir");
        });

        test("deve excluir conta com sucesso e redirecionar para autenticação", async () => {
            await page.getByTestId("delete-account-button").click();
            await page.waitForURL(url("auth?callbackUrl=http://localhost:3000/app/perfil/excluir"));
            const caminhoAtual = new URL(page.url()).pathname;
            expect(caminhoAtual).toBe("/auth");
        });
    });
});
```

Esse exemplo abrange um dos fluxos mais importantes para garantir a integridade e a segurança dos usuários, assegurando que o processo de cadastro esteja livre de erros e que o usuário seja redirecionado corretamente após a criação da conta.

#### 3. **Resultados dos Testes**

Os testes garantiram:

- **Funcionalidade Correta**: A funcionalidade correta dos principais fluxos do sistema, incluindo autenticação, cadastro de atividades, acesso às notas e métricas dos alunos. Esses testes permitiram validar se cada um dos componentes funcionava adequadamente e se os usuários conseguiam realizar todas as operações esperadas sem problemas.
- **Confiabilidade em Cenários Reais**: A confiabilidade do sistema em cenários reais, validando a interação entre o frontend, backend e banco de dados. Simulamos diferentes tipos de interações, como o uso em diferentes dispositivos e navegadores, para garantir que a plataforma fosse consistente e não apresentasse problemas inesperados.
- **Segurança e Validação de Acessos**: Testamos também a segurança dos acessos, garantindo que as informações dos usuários fossem tratadas de forma segura e que não houvesse vazamento ou acesso indevido a dados confidenciais. Isso foi essencial para garantir que apenas usuários autorizados pudessem acessar dados específicos e realizar determinadas ações.

Com essa abordagem estruturada de testes, conseguimos assegurar que o sistema atende aos requisitos e oferece uma experiência de usuário confiável e intuitiva. A implementação dos testes unitários e de ponta a ponta proporcionou maior segurança em relação à estabilidade da plataforma, permitindo que problemas fossem identificados e corrigidos antes de qualquer tipo de implantação. Esses testes também permitiram validar melhorias e novas funcionalidades ao longo do ciclo de desenvolvimento, mantendo a qualidade do software e garantindo que os usuários tivessem uma experiência segura e eficiente.

Os resultados obtidos até agora nos mostram que a plataforma é capaz de fornecer uma experiência integrada para todos os perfis de usuário, assegurando que tanto alunos, quanto professores, coordenadores e responsáveis possam acessar e gerenciar informações de forma intuitiva e sem dificuldades. Desta forma, conseguimos também contribuir para uma maior participação dos pais na vida escolar dos alunos e uma comunicação mais eficiente entre a escola e os responsáveis.
