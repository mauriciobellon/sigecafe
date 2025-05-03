import { defineEventHandler, readBody } from 'h3';
import { PrismaClient } from '@prisma/client';
import { generatePasswordResetToken } from '../../utils/password-token';
import type { PasswordRecoveryRequestDTO, AuthResponseDTO } from '~/types/api';

const prisma = new PrismaClient();

export default defineEventHandler(async (event): Promise<AuthResponseDTO> => {
  try {
    const body = await readBody(event) as PasswordRecoveryRequestDTO;
    const { celular } = body;

    if (!celular) {
      return {
        success: false,
        message: 'Número de celular é obrigatório'
      };
    }

    // Normalize phone number by removing non-digit characters
    const normalizedCelular = celular.replace(/\D/g, '');

    // Find the user
    const usuario = await prisma.usuario.findFirst({
      where: { celular: normalizedCelular }
    });

    if (!usuario) {
      // For security, don't reveal whether the user exists or not
      return {
        success: true,
        message: 'Se o número estiver cadastrado, você receberá um link para recuperação de senha'
      };
    }

    // Generate password reset token
    const token = await generatePasswordResetToken(usuario.id);

    // In a real application, send an SMS/WhatsApp message with the reset link
    // For now, we'll just return the token (in production this should be removed)
    console.log(`Password reset token for ${usuario.name} (${usuario.celular}): ${token}`);

    // Here you would integrate with an SMS service to send the recovery link
    // Example: await sendSMS(usuario.celular, `Seu link para recuperação de senha: ${process.env.APP_URL}/reset-password?token=${token}`);

    return {
      success: true,
      message: 'Se o número estiver cadastrado, você receberá um link para recuperação de senha',
      // Only for development, remove in production:
      data: {
        token,
        resetUrl: `/auth/reset-password?token=${token}`
      }
    };
  } catch (error) {
    console.error('Error in password recovery:', error);
    return {
      success: false,
      message: 'Erro ao processar solicitação de recuperação de senha'
    };
  }
});