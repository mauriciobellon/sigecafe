import { AssociadoRepository } from '../../repositories/AssociadoRepository';
import type { H3Event } from 'h3';
import type { AssociadoFilterDTO } from '~/types/api';

export default defineEventHandler(async (event: H3Event) => {
  try {
    const query = getQuery(event);

    // Extract query parameters
    const page = query.page ? parseInt(query.page as string) : 1;
    const limit = query.limit ? parseInt(query.limit as string) : 10;
    const nome = query.nome as string | undefined;

    // Handle tipo parameter with proper type checking
    let tipo: 'PRODUTOR' | 'COMPRADOR' | undefined = undefined;
    if (query.tipo === 'PRODUTOR' || query.tipo === 'COMPRADOR') {
      tipo = query.tipo;
    }

    const cidade = query.cidade as string | undefined;
    const estado = query.estado as string | undefined;

    const associadoRepository = new AssociadoRepository();

    const result = await associadoRepository.getAll({
      page,
      limit,
      nome,
      tipo,
      cidade,
      estado,
    });

    return result;
  } catch (error) {
    console.error('Error fetching associados:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch associados',
    });
  }
});