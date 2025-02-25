import { defineEventHandler } from 'h3';
import { getServerSession } from '#auth';
import { UsuarioType, Usuario } from '@prisma/client';
import { EscolaRepository } from '@@/server/repositories/EscolaRepository'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);
  if (!session?.user) {
    return [];
  }

  const escolaRepository = new EscolaRepository();

  return await escolaRepository.getEscolaByUsuario((session.user as Usuario));
});
