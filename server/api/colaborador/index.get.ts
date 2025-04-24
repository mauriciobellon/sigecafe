import { defineEventHandler, createError } from 'h3';
import { ColaboradorRepository } from '../../repositories/ColaboradorRepository';
import { getServerSession } from '#auth';
import type { ColaboradorFilterDTO } from '~/types/api';

export default defineEventHandler(async (event) => {
  try {
    // Check authentication and authorization
    const session = await getServerSession(event);
    const userType = (session?.user as any)?.type;

    if (!session?.user || (userType !== 'ADMINISTRADOR' && userType !== 'COOPERATIVA')) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Não autorizado'
      });
    }

    const query = getQuery(event);

    // Prepare filter with default values
    const page = query.page ? parseInt(query.page as string) : 1;
    const limit = query.limit ? parseInt(query.limit as string) : 10;

    const filter: ColaboradorFilterDTO = {
      page,
      limit,
      nome: query.nome as string | undefined,
      cargo: query.cargo as string | undefined,
    };

    // If user is from a cooperativa, only show their colaboradores
    if (userType === 'COOPERATIVA') {
      const cooperativaId = (session.user as any).cooperativaId;
      if (cooperativaId) {
        filter.cooperativaId = cooperativaId;
      }
    } else if (query.cooperativaId) {
      // Admin can filter by cooperativa
      filter.cooperativaId = parseInt(query.cooperativaId as string);
    }

    const repository = new ColaboradorRepository();
    const result = await repository.getAll(filter);

    return {
      success: true,
      data: result.data,
      meta: result.meta
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }

    console.error('Error fetching colaboradores:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao buscar colaboradores'
    });
  }
});