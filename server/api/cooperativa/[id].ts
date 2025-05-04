import { defineEventHandler } from 'h3';

import { CooperativaRepository } from '~~/server/repositories/CooperativaRepository';
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID is required'
    });
  }

  const cooperativaRepository = new CooperativaRepository();

  return await cooperativaRepository.getCooperativaById(parseInt(id));
});
