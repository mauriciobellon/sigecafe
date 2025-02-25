import { defineEventHandler } from 'h3';
import { getServerSession } from '#auth';
import { EscolaRepository } from '@@/server/repositories/EscolaRepository'
import type { Escola } from '@prisma/client'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);
  if (!session?.user) {
    return [];
  }

  const method = event._method
  const escolaRepository = new EscolaRepository();

  if (method === 'PUT') {
    const body = await readBody<Escola>(event)
    return await escolaRepository.updateEscola(body)
  }
});
