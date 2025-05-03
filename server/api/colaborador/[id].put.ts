import { defineEventHandler, readBody, createError } from 'h3';
import { ColaboradorRepository } from '../../repositories/ColaboradorRepository';
import { getServerSession } from '#auth';
import type { ColaboradorUpdateDTO, AuthResponseDTO } from '~/types/api';

export default defineEventHandler(async (event): Promise<AuthResponseDTO> => {
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
      return {
        success: false,
        message: 'ID inválido'
      };
    }

    const repository = new ColaboradorRepository();

    // Fetch existing colaborador
    const existingColaborador = await repository.getById(id);
    if (!existingColaborador) {
      return {
        success: false,
        message: 'Colaborador não encontrado'
      };
    }

    // If user is from a cooperativa, ensure they can only update their own colaboradores
    if (userType === 'COOPERATIVA') {
      const userCooperativaId = (session.user as any).cooperativaId;
      if (existingColaborador.cooperativaId !== userCooperativaId) {
        return {
          success: false,
          message: 'Você só pode atualizar colaboradores da sua própria cooperativa'
        };
      }
    }

    const body = await readBody(event) as Omit<ColaboradorUpdateDTO, 'id'>;

    // If cooperativaId is being updated, validate it
    if (body.cooperativaId !== undefined && userType === 'COOPERATIVA') {
      const userCooperativaId = (session.user as any).cooperativaId;
      if (body.cooperativaId !== userCooperativaId) {
        return {
          success: false,
          message: 'Você não pode transferir um colaborador para outra cooperativa'
        };
      }
    }

    // Perform update
    const colaborador = await repository.update(id, {
      id,
      ...body
    });

    return {
      success: true,
      message: 'Colaborador atualizado com sucesso',
      data: colaborador
    };
  } catch (error: any) {
    console.error('Error updating colaborador:', error);
    return {
      success: false,
      message: `Erro ao atualizar colaborador: ${error.message || 'Erro desconhecido'}`
    };
  }
});