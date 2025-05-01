import { defineEventHandler, readBody, createError } from 'h3';
import { AssociadoRepository } from '../../repositories/AssociadoRepository';
import type { AssociadoCreateDTO, AuthResponseDTO } from '~/types/api';
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

    const body = await readBody(event) as AssociadoCreateDTO;
    const { nome, tipo, cooperativaId } = body;

    // Basic validation
    if (!nome || !tipo || !cooperativaId) {
      return {
        success: false,
        message: 'Dados incompletos. Nome, tipo e cooperativaId são obrigatórios'
      };
    }

    // Ensure tipo is valid
    if (tipo !== 'PRODUTOR' && tipo !== 'COMPRADOR') {
      return {
        success: false,
        message: 'Tipo inválido. Deve ser PRODUTOR ou COMPRADOR'
      };
    }

    const associadoRepository = new AssociadoRepository();
    const associado = await associadoRepository.create(body);

    return {
      success: true,
      message: 'Associado criado com sucesso',
      data: associado
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }

    console.error('Error creating associado:', error);
    return {
      success: false,
      message: `Erro ao criar associado: ${error.message || 'Erro desconhecido'}`
    };
  }
});