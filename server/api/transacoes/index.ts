import { getServerSession } from '#auth'
import { PrismaClient, UsuarioType, TransacaoStatus } from '@prisma/client'
import { TransacaoDTO, CreateTransacaoDTO } from '~/types/api'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  console.log('Método HTTP:', event.method)
  
  // Verificar autenticação
  const session = await getServerSession(event)
  if (!session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Você precisa estar autenticado para acessar esta funcionalidade',
    })
  }

  // Buscar o usuário atual
  const usuario = await prisma.usuario.findFirst({
    where: { email: session.user.email }
  })

  if (!usuario) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Usuário não encontrado',
    })
  }

  try {
    if (event.method === 'GET') {
      // Listar transações
      console.log('Buscando transações para usuário:', session.user.email)
      
      // Se o usuário é administrador, buscar todas as transações
      if (usuario.type === UsuarioType.ADMINISTRADOR) {
        console.log('Usuário é administrador, buscando todas as transações')
        
        const transacoes = await prisma.transacao.findMany({
          include: {
            comprador: {
              select: {
                name: true
              }
            },
            vendedor: {
              select: {
                name: true
              }
            }
          },
          orderBy: {
            data: 'desc'
          }
        })

        console.log('Transações encontradas:', transacoes)

        // Formatar as transações para o frontend
        const transacoesFormatadas = transacoes.map(transacao => ({
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
          observacoes: transacao.observacoes,
          createdAt: transacao.createdAt,
          updatedAt: transacao.updatedAt
        }))

        console.log('Transações formatadas:', transacoesFormatadas)
        return transacoesFormatadas
      }

      // Para outros usuários, buscar apenas suas transações
      console.log('Usuário não é administrador, buscando apenas suas transações')
      const transacoes = await prisma.transacao.findMany({
        where: {
          OR: [
            { compradorId: usuario.id },
            { vendedorId: usuario.id }
          ]
        },
        include: {
          comprador: {
            select: {
              name: true
            }
          },
          vendedor: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          data: 'desc'
        }
      })

      console.log('Transações encontradas:', transacoes)

      // Formatar as transações para o frontend
      const transacoesFormatadas = transacoes.map(transacao => ({
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
        observacoes: transacao.observacoes,
        createdAt: transacao.createdAt,
        updatedAt: transacao.updatedAt
      }))

      console.log('Transações formatadas:', transacoesFormatadas)
      return transacoesFormatadas
    } else if (event.method === 'POST') {
      // Criar nova transação
      return await handleCreateTransacao(event, usuario.id)
    } else {
      throw createError({
        statusCode: 405,
        statusMessage: 'Método não permitido',
      })
    }
  } catch (error) {
    console.error('Erro ao processar transações:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao processar transações',
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
  createdAt: Date;
  updatedAt: Date;
  comprador: {
    name: string;
  };
  vendedor: {
    name: string;
  };
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
    const isComprador = body.compradorId === usuarioId

    // Verificar se a contraparte existe
    let contraparte
    if (isComprador) {
      // Buscar vendedor pelo ID
      contraparte = await prisma.usuario.findFirst({
        where: {
          id: body.vendedorId,
          type: UsuarioType.PRODUTOR
        }
      })
    } else {
      // Buscar comprador pelo ID
      contraparte = await prisma.usuario.findFirst({
        where: {
          id: body.compradorId,
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
      createdAt: transacao.createdAt,
      updatedAt: transacao.updatedAt,
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