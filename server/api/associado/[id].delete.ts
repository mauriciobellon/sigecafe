import { defineEventHandler, createError } from 'h3';
import { AssociadoRepository } from '../../repositories/AssociadoRepository';
import type { AuthResponseDTO } from '~/types/api';
import { getServerSession } from '#auth';

export default defineEventHandler(async (event): Promise<AuthResponseDTO> => {
  try {
    // Check if user is admin
    const session = await getServerSession(event);
    const userType = (session?.user as any)?.type;

    if (userType !== 'ADMINISTRADOR') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Não autorizado. Acesso apenas para administradores'
      });
    }

    // Get ID from URL
    const id = parseInt(event.context.params?.id as string);

    if (isNaN(id)) {
      return {
        success: false,
        message: 'ID inválido'
      };
    }

    const associadoRepository = new AssociadoRepository();

    // Check if associado exists
    const existingAssociado = await associadoRepository.getById(id);
    if (!existingAssociado) {
      return {
        success: false,
        message: 'Associado não encontrado'
      };
    }

    // Check for related entities (e.g., transactions)
    // Implement this check if needed to prevent deletion of associados with dependencies

    // Delete associado
    await associadoRepository.delete(id);

    return {
      success: true,
      message: 'Associado excluído com sucesso'
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }

    console.error('Error deleting associado:', error);
    return {
      success: false,
      message: `Erro ao excluir associado: ${error.message || 'Erro desconhecido'}`
    };
  }
});