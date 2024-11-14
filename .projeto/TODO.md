
## Refatorar o código existente

## Refatorar auth
    usuairo deve receber um token de acesso que expira após X minutos de inatividade

## Implementar controle de acesso
    tipos de usuarios:
        admin, coordenador, professor, responsavel
    tipos de funcionalidades:
        cadastrar, editar, visualizar, excluir
    telas:


## Implementar api de notificações WhatsApp
    sempre depois do horario de aula do aluno o sistema manda para os responsáveis pelo WhatsApp uma notificação se o aluno teve alguma ocorrência
    sempre que o professor fechar alguma nota do  aluno o sistema manda para os responsáveis pelo WhatsApp uma notificação com a nota do aluno
    
## Implementar dashboard para cada tipo de usuário
    Responsável pode as informações do seu filho
    Coordenador pode ver as informações da escola toda
    Professor pode ver as informações da sua classe

## Implementar testes
    unitários
    integração

## Implementar banco de dados PostgreSQL 


# Entidades
Turma
    id: autoincrement
    escola: Escola

    professores
    disciplinas
    turmas
    alunos
    ocorrencias
    notificacoes

turmas
    escola
    alunos
    disciplinas

disciplinas
    usuario: professor
    turmas
    ocorrencias

alunos
    turma

    ocorrencias

ocorrencias
    disciplina
    aluno
    notificacoes

notificacoes
    ocorrencias
    aluno



# Relacionamentos
Administrador
    pode ter varias escolas
    pode cadastrar colaboradores
    pode cadastrar professores
    pode cadastrar responsáveis
    
Colaborador
    pertence a uma escola
    pode cadastrar responsáveis

Professor
    pertence a uma escola
    pode cadastrar notas

Responsavel
    pode participar de varias escolas atravez de alunos
    pode acessar as notas dos alunos vinculados

Alunos
    não são usuarios



# Tela inicial
    Sessões
        Para Escolas
            Login
            Cadastro
            Breve descrição do sistema
        Para Responsáveis
            Login
            Cadastro
            Breve descrição do sistema




# Rotina de Casdastro
## Administrador
    Por conta própria entra no App e se cadastra como Administrador em formulário específico
    Como não tem vinculo com nenhuma escola ele só pode acessar seu perfil e o cadastro de novas escolas
## Colaborador
    O Administrador cadastra o Colaborador
    Recebe um email e mensagem no WhatsApp com um link para ele acessar o App e finalizar o cadastro
## Professor
    O Administrador cadastra o Professor
    Recebe um email e mensagem no WhatsApp com um link para ele acessar o App e finalizar o cadastro
## Responsável
    O Administrador ou Colaborador cadastra o Responsável
    Recebe um email e mensagem no WhatsApp com um link para ele acessar o App e finalizar o cadastro
    Pode por conta própria entra no App e se cadastra como Responsável

# Rotina de Login
## Administrador
    Se não tem nenhuma escola ele somente ele só pode acessar seu perfil e o cadastro de novas escolas
    Se tem somente uma escola ele acessa diretamente a tela do painel da escola
    Se tem mais de uma escola ele acessa uma tela de escolha da escola
## Responsável
    Se não tem nenhum aluno vinculado ele só pode acessar seu perfil e será exibido um aviso pedindo para entrar em contato com a escola
    Se tem somente um aluno vinculado ele acessa diretamente as informações desse aluno
    Se tem mais de um aluno vinculado ele acessa uma tela de escolha do aluno
## Colaborador
    Se tem somente uma escola ele acessa diretamente a tela do painel da escola
    Se tem mais de uma escola ele acessa uma tela de escolha da escola
## Professor
    Se tem somente uma escola ele acessa diretamente a tela do painel da escola
    Se tem mais de uma escola ele acessa uma tela de escolha da escola
## Aluno
    Não tem acesso ao App

