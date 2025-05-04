import { defineEventHandler, createError } from 'h3';
import { AssociadoRepository } from '../../../repositories/AssociadoRepository';
import type { AssociadoFilterDTO } from '~/types/api';

export default defineEventHandler(async (event) => {
  try {
    const cooperativaId = parseInt(event.context.params?.id as string);

    if (isNaN(cooperativaId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID de cooperativa inválido'
      });
    }

    const query = getQuery(event);

    // Prepare filter with default values
    const page = query.page ? parseInt(query.page as string) : 1;
    const limit = query.limit ? parseInt(query.limit as string) : 10;

    const filter: AssociadoFilterDTO = {
      page,
      limit,
    };

    // Add optional filters
    if (query.nome) {
      filter.nome = query.nome as string;
    }

    // Handle tipo parameter with proper type checking
    if (query.tipo === 'PRODUTOR' || query.tipo === 'COMPRADOR') {
      filter.tipo = query.tipo;
    }

    if (query.cidade) {
      filter.cidade = query.cidade as string;
    }

    if (query.estado) {
      filter.estado = query.estado as string;
    }

    const associadoRepository = new AssociadoRepository();
    const result = await associadoRepository.getByCooperativa(cooperativaId, filter);

    return {
      success: true,
      data: result.data,
      meta: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit)
      }
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }

    console.error('Error retrieving associados by cooperativa:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to retrieve associados'
    });
  }
});