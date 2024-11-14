Pessoas
    id: autoincrement
    nome: string
    cpf: string
    email: string
    celular: string
    senha: string
    ativo: boolean

Escola
    id: autoincrement
    nome: string
    endereco: string
    telefone: string
    email: string
    site: string
    logo: string

PessoasEscola
    pessoa: Pessoa
    escola: Escola
    vinculo: enum (administrador, colaborador, professor, responsavel, aluno)

SessoesWhatsapp
    id: autoincrement
    numero: string
    escola: Escola
    token: string

