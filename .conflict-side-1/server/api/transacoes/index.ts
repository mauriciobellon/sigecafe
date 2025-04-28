import { getServerSession } from '#auth'
import { PrismaClient, UsuarioType, TransacaoStatus } from '@prisma/client'
import type { TransacaoDTO, CreateTransacaoDTO } from '~/types/api'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // Verificar autenticação
  const session = await getServerSession(event)
  if (!session || !session.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Você precisa estar autenticado para acessar esta funcionalidade',
    })
  }

  // Buscar o usuário pelo email (considerando que o email é usado como login)
  const usuario = await prisma.usuario.findFirst({
    where: { email: session.user.email }
  })

  if (!usuario) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Usuário não encontrado',
    })
  }

  // Processar as requisições de acordo com o método
  switch (event.method) {
    case 'GET':
      return handleGetTransacoes(usuario.id)
    case 'POST':
      return handleCreateTransacao(event, usuario.id)
    default:
      throw createError({
        statusCode: 405,
        statusMessage: 'Método não permitido',
      })
  }
})

// Interface para tipagem das transações com informações de usuários
interface TransacaoWithUsers {
  id: string;
  data: Date;
  quantidade: number;
  precoUnitario: number;
  valorTotal: number;
  status: TransacaoStatus;
  observacoes: string | null;
  compradorId: number;
  vendedorId: number;
  comprador: {
    name: string;
  };
  vendedor: {
    name: string;
  };
}

// Função para obter as transações do usuário
async function handleGetTransacoes(usuarioId: number): Promise<TransacaoDTO[]> {
  try {
    // Buscar transações onde o usuário é comprador ou vendedor
    const transacoes = await prisma.transacao.findMany({
      where: {
        OR: [
          { compradorId: usuarioId },
          { vendedorId: usuarioId },
        ],
      },
      include: {
        comprador: true,
        vendedor: true,
      },
      orderBy: {
        data: 'desc',
      },
    }) as TransacaoWithUsers[]

    // Formatar as transações para o frontend
    return transacoes.map((t) => ({
      id: t.id,
      data: t.data,
      comprador: t.comprador.name,
      compradorId: t.compradorId,
      vendedor: t.vendedor.name,
      vendedorId: t.vendedorId,
      quantidade: t.quantidade,
      precoUnitario: t.precoUnitario,
      valorTotal: t.valorTotal,
      status: t.status,
      observacoes: t.observacoes || '',
    }))
  } catch (error) {
    console.error('Erro ao buscar transações:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao buscar transações',
    })
  }
}

// Função para criar uma nova transação
async function handleCreateTransacao(event: any, usuarioId: number): Promise<TransacaoDTO> {
  try {
    const body = await readBody(event) as CreateTransacaoDTO

    // Validar os dados necessários
    if (!body.quantidade || !body.precoUnitario || !body.data || !body.status) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Dados incompletos para criar transação',
      })
    }

    // Se o usuário é comprador ou vendedor na transação
    const isComprador = body.tipo === 'compra'

    // Verificar se a contraparte existe
    let contraparte
    if (isComprador) {
      // Buscar vendedor pelo nome
      contraparte = await prisma.usuario.findFirst({
        where: {
          name: { contains: body.contraparte },
          type: UsuarioType.PRODUTOR
        }
      })
    } else {
      // Buscar comprador pelo nome
      contraparte = await prisma.usuario.findFirst({
        where: {
          name: { contains: body.contraparte },
          type: UsuarioType.COMPRADOR
        }
      })
    }

    if (!contraparte) {
      throw createError({
        statusCode: 404,
        statusMessage: `${isComprador ? 'Vendedor' : 'Comprador'} não encontrado`,
      })
    }

    // Criar a transação
    const transacao = await prisma.transacao.create({
      data: {
        quantidade: body.quantidade,
        precoUnitario: body.precoUnitario,
        valorTotal: body.valorTotal,
        data: new Date(body.data),
        status: body.status as TransacaoStatus,
        observacoes: body.observacoes,
        comprador: {
          connect: {
            id: isComprador ? usuarioId : contraparte.id,
          },
        },
        vendedor: {
          connect: {
            id: isComprador ? contraparte.id : usuarioId,
          },
        },
      },
      include: {
        comprador: true,
        vendedor: true,
      },
    }) as TransacaoWithUsers

    // Retornar a transação formatada
    return {
      id: transacao.id,
      data: transacao.data,
      comprador: transacao.comprador.name,
      compradorId: transacao.compradorId,
      vendedor: transacao.vendedor.name,
      vendedorId: transacao.vendedorId,
      quantidade: transacao.quantidade,
      precoUnitario: transacao.precoUnitario,
      valorTotal: transacao.valorTotal,
      status: transacao.status,
      observacoes: transacao.observacoes || '',
    }
  } catch (error: unknown) {
    console.error('Erro ao criar transação:', error)
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao criar transação',
    })
  }
}