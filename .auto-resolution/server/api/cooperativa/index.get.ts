import { defineEventHandler } from 'h3';
import { getServerSession } from '#auth';
import { UsuarioType, Usuario } from '@prisma/client';
import { CooperativaRepository } from '@@/server/repositories/CooperativaRepository'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);
  if (!session?.user) {
    return [];
  }

  const cooperativaRepository = new CooperativaRepository();

  return await cooperativaRepository.getCooperativaByUsuario((session.user as Usuario));
});
