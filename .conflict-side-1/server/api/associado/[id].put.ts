import { defineEventHandler, readBody, createError } from 'h3';
import { AssociadoRepository } from '../../repositories/AssociadoRepository';
import type { AssociadoUpdateDTO, AuthResponseDTO } from '~/types/api';
import { getServerSession } from '#auth';

export default defineEventHandler(async (event): Promise<AuthResponseDTO> => {
  try {
    // Check if user is admin
    const session = await getServerSession(event);
    const userType = (session?.user as any)?.type;

    if (userType !== 'ADMINISTRADOR' && userType !== 'COOPERATIVA') {
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

    const body = await readBody(event) as Omit<AssociadoUpdateDTO, 'id'>;

    // Ensure tipo is valid if provided
    if (body.tipo && body.tipo !== 'PRODUTOR' && body.tipo !== 'COMPRADOR') {
      return {
        success: false,
        message: 'Tipo inválido. Deve ser PRODUTOR ou COMPRADOR'
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

    // Update associado
    const associado = await associadoRepository.update(id, {
      id,
      ...body
    });

    return {
      success: true,
      message: 'Associado atualizado com sucesso',
      data: associado
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }

    console.error('Error updating associado:', error);
    return {
      success: false,
      message: `Erro ao atualizar associado: ${error.message || 'Erro desconhecido'}`
    };
  }
});