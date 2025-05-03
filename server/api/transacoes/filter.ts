import { getServerSession } from '#auth'
import { PrismaClient, UsuarioType, TransacaoStatus } from '@prisma/client'
import type { TransacaoDTO } from '~/types/api'

const prisma = new PrismaClient()

interface TransacaoFilterParams {
  page?: number;
  limit?: number;
  compradorId?: number;
  vendedorId?: number;
  status?: TransacaoStatus;
  dataInicio?: Date;
  dataFim?: Date;
}

export default defineEventHandler(async (event) => {
  // Verificar autenticação
  const session = await getServerSession(event)
  if (!session || !session.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Você precisa estar autenticado para acessar esta funcionalidade',
    })
  }

  // Buscar o usuário pelo email
  const usuario = await prisma.usuario.findFirst({
    where: { email: session.user.email }
  })

  if (!usuario) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Usuário não encontrado',
    })
  }

  if (event.method !== 'GET') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Método não permitido',
    })
  }

  // Extrair os parâmetros de consulta
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 10

  // Parâmetros de filtro
  const filterParams: TransacaoFilterParams = {
    page,
    limit,
  }

  // Adicionar filtro por status se fornecido
  if (query.status) {
    filterParams.status = query.status as TransacaoStatus
  }

  // Adicionar filtros de data se fornecidos
  if (query.dataInicio) {
    filterParams.dataInicio = new Date(query.dataInicio as string)
  }

  if (query.dataFim) {
    filterParams.dataFim = new Date(query.dataFim as string)
  }

  // Aplicar filtros específicos baseados no tipo de usuário
  const isAdmin = usuario.type === UsuarioType.ADMINISTRADOR

  if (isAdmin) {
    // Administradores podem filtrar por comprador e vendedor específicos
    if (query.compradorId) {
      filterParams.compradorId = Number(query.compradorId)
    }

    if (query.vendedorId) {
      filterParams.vendedorId = Number(query.vendedorId)
    }
  } else {
    // Usuários não-admin só podem ver suas próprias transações
    if (usuario.type === UsuarioType.COMPRADOR) {
      filterParams.compradorId = usuario.id
    } else if (usuario.type === UsuarioType.PRODUTOR) {
      filterParams.vendedorId = usuario.id
    } else {
      // Para outros tipos (ex: COOPERATIVA), mostra transações onde são comprador ou vendedor
      // Será tratado na construção da query
    }
  }

  return handleFilterTransacoes(filterParams, usuario.id, usuario.type)
})

async function handleFilterTransacoes(
  params: TransacaoFilterParams,
  usuarioId: number,
  usuarioType: UsuarioType
): Promise<{ data: TransacaoDTO[], meta: { total: number; page: number; limit: number; totalPages: number } }> {
  try {
    const {
      page = 1,
      limit = 10,
      compradorId,
      vendedorId,
      status,
      dataInicio,
      dataFim
    } = params;

    const skip = (page - 1) * limit;

    // Construir a cláusula WHERE
    const where: any = {};

    // Se não for admin, restringir por usuário
    if (usuarioType !== UsuarioType.ADMINISTRADOR) {
      if (usuarioType === UsuarioType.COMPRADOR) {
        where.compradorId = usuarioId;
      } else if (usuarioType === UsuarioType.PRODUTOR) {
        where.vendedorId = usuarioId;
      } else {
        // Para usuários COOPERATIVA ou outros tipos, mostrar onde são comprador OU vendedor
        where.OR = [
          { compradorId: usuarioId },
          { vendedorId: usuarioId }
        ];
      }
    } else {
      // Para admins, aplicar filtros específicos se fornecidos
      if (compradorId) {
        where.compradorId = compradorId;
      }

      if (vendedorId) {
        where.vendedorId = vendedorId;
      }
    }

    // Aplicar filtro por status
    if (status) {
      where.status = status;
    }

    // Aplicar filtros de data
    if (dataInicio || dataFim) {
      where.data = {};
      if (dataInicio) {
        where.data.gte = dataInicio;
      }
      if (dataFim) {
        where.data.lte = dataFim;
      }
    }

    // Buscar as transações com paginação
    const [transacoes, total] = await Promise.all([
      prisma.transacao.findMany({
        where,
        skip,
        take: limit,
        orderBy: { data: 'desc' },
        include: {
          comprador: true,
          vendedor: true,
        },
      }),
      prisma.transacao.count({ where })
    ]);

    // Formatar as transações para o formato DTO
    const data = transacoes.map(t => ({
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
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));

    // Retornar os dados formatados com metadata
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    };
  } catch (error) {
    console.error('Erro ao filtrar transações:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao filtrar transações',
    });
  }
}