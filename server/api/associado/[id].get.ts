import { defineEventHandler, createError } from 'h3';
import { AssociadoRepository } from '../../repositories/AssociadoRepository';

export default defineEventHandler(async (event) => {
  try {
    const id = parseInt(event.context.params?.id as string);

    if (isNaN(id)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid associado ID format'
      });
    }

    const associadoRepository = new AssociadoRepository();
    const associado = await associadoRepository.getById(id);

    if (!associado) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Associado not found'
      });
    }

    return {
      success: true,
      data: associado
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }

    console.error('Error retrieving associado:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to retrieve associado'
    });
  }
});