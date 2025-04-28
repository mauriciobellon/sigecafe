import { randomBytes } from 'crypto';
import type { PasswordTokenDTO } from '~/types/api';
import { prisma } from './prisma';

// Token expiration time in hours
const TOKEN_EXPIRATION_HOURS = 2;

/**
 * Generate a random token and save it in the database
 */
export async function generatePasswordResetToken(usuarioId: number): Promise<string> {
  // Delete any existing tokens for this user
  await prisma.passwordResetToken.deleteMany({
    where: { usuarioId },
  });

  // Generate a new random token
  const token = randomBytes(32).toString('hex');

  // Calculate expiration date (current time + TOKEN_EXPIRATION_HOURS)
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + TOKEN_EXPIRATION_HOURS);

  // Save token to database
  await prisma.passwordResetToken.create({
    data: {
      token,
      usuarioId,
      expiresAt,
    },
  });

  return token;
}

/**
 * Validate a password reset token
 */
export async function validatePasswordResetToken(token: string): Promise<PasswordTokenDTO | null> {
  const passwordToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { usuario: true },
  });

  if (!passwordToken) {
    return null;
  }

  // Check if token has expired
  if (new Date() > passwordToken.expiresAt) {
    // Delete expired token
    await prisma.passwordResetToken.delete({
      where: { id: passwordToken.id },
    });
    return null;
  }

  return {
    token: passwordToken.token,
    userId: passwordToken.usuarioId,
    createdAt: passwordToken.createdAt,
    expiresAt: passwordToken.expiresAt,
  };
}

/**
 * Delete a password reset token
 */
export async function consumePasswordResetToken(token: string): Promise<boolean> {
  try {
    await prisma.passwordResetToken.delete({
      where: { token },
    });
    return true;
  } catch (error) {
    console.error('Error deleting token:', error);
    return false;
  }
}