import { defineEventHandler, createError } from 'h3';
import { ColaboradorRepository } from '../../repositories/ColaboradorRepository';
import { getServerSession } from '#auth';
import type { AuthResponseDTO } from '~/types/api';

export default defineEventHandler(async (event): Promise<AuthResponseDTO> => {
  try {
    // Check authentication and authorization
    const session = await getServerSession(event);
    const userType = (session?.user as any)?.type;

    // Only admin can delete colaboradores
    if (!session?.user || userType !== 'ADMINISTRADOR') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Não autorizado. Apenas administradores podem excluir colaboradores.'
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

    // Check for related entities before deleting
    // (e.g., check if the colaborador has any active associations that prevent deletion)
    // This is a placeholder for any such checks

    // Perform delete
    await repository.delete(id);

    return {
      success: true,
      message: 'Colaborador excluído com sucesso'
    };
  } catch (error: any) {
    console.error('Error deleting colaborador:', error);
    return {
      success: false,
      message: `Erro ao excluir colaborador: ${error.message || 'Erro desconhecido'}`
    };
  }
});