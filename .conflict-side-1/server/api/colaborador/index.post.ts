import { defineEventHandler, readBody, createError } from 'h3';
import { ColaboradorRepository } from '../../repositories/ColaboradorRepository';
import { getServerSession } from '#auth';
import type { ColaboradorCreateDTO, AuthResponseDTO } from '~/types/api';

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

    const body = await readBody(event) as ColaboradorCreateDTO;
    const { nome, cooperativaId } = body;

    // Basic validation
    if (!nome || !cooperativaId) {
      return {
        success: false,
        message: 'Nome e cooperativaId são obrigatórios'
      };
    }

    // If user is from a cooperativa, ensure they can only create colaboradores for their own cooperativa
    if (userType === 'COOPERATIVA') {
      const userCooperativaId = (session.user as any).cooperativaId;
      if (cooperativaId !== userCooperativaId) {
        return {
          success: false,
          message: 'Você só pode criar colaboradores para sua própria cooperativa'
        };
      }
    }

    const repository = new ColaboradorRepository();
    const colaborador = await repository.create(body);

    return {
      success: true,
      message: 'Colaborador criado com sucesso',
      data: colaborador
    };
  } catch (error: any) {
    console.error('Error creating colaborador:', error);
    return {
      success: false,
      message: `Erro ao criar colaborador: ${error.message || 'Erro desconhecido'}`
    };
  }
});