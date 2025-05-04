import { defineEventHandler, readBody } from 'h3';
import { PrismaClient } from '@prisma/client';
import { hash } from '../../utils/crypto';
import { validatePasswordResetToken, consumePasswordResetToken } from '../../utils/password-token';
import type { PasswordResetRequestDTO, AuthResponseDTO } from '~/types/api';

const prisma = new PrismaClient();

export default defineEventHandler(async (event): Promise<AuthResponseDTO> => {
  try {
    const body = await readBody(event) as PasswordResetRequestDTO;
    const { token, password } = body;

    if (!token || !password) {
      return {
        success: false,
        message: 'Token e senha são obrigatórios'
      };
    }

    // Validate the token
    const tokenData = await validatePasswordResetToken(token);
    if (!tokenData) {
      return {
        success: false,
        message: 'Token inválido ou expirado'
      };
    }

    // Hash the new password
    const hashedPassword = await hash(password);

    // Update the user's password
    await prisma.usuario.update({
      where: { id: tokenData.userId },
      data: { password: hashedPassword }
    });

    // Consume (delete) the token
    await consumePasswordResetToken(token);

    return {
      success: true,
      message: 'Senha alterada com sucesso'
    };
  } catch (error) {
    console.error('Error in password reset:', error);
    return {
      success: false,
      message: 'Erro ao processar alteração de senha'
    };
  }
});