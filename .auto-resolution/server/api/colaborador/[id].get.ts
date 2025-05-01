import { defineEventHandler, createError } from 'h3';
import { ColaboradorRepository } from '../../repositories/ColaboradorRepository';
import { getServerSession } from '#auth';

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

    const id = parseInt(event.context.params?.id as string);

    if (isNaN(id)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID inválido'
      });
    }

    const repository = new ColaboradorRepository();
    const colaborador = await repository.getById(id);

    if (!colaborador) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Colaborador não encontrado'
      });
    }

    // If user is from a cooperativa, ensure they can only access their own colaboradores
    if (userType === 'COOPERATIVA') {
      const cooperativaId = (session.user as any).cooperativaId;
      if (colaborador.cooperativaId !== cooperativaId) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Não autorizado a acessar este colaborador'
        });
      }
    }

    return {
      success: true,
      data: colaborador
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }

    console.error('Error retrieving colaborador:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao buscar colaborador'
    });
  }
});