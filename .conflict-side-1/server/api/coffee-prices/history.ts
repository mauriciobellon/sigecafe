import { defineEventHandler, createError } from 'h3'
import { getServerSession } from '#auth'
import prisma from '@@/lib/prisma'
import type { PrecoCafeDTO } from '~/types/api'

export default defineEventHandler(async (event) => {
  // Require authentication
  const session = await getServerSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  try {
    const history = await prisma.precoCafeHistorico.findMany({
      orderBy: { data: 'asc' }
    })
    // Map to DTO
    const data: PrecoCafeDTO[] = history.map(h => ({
      id: h.id,
      data: h.data,
      precoRobusta: h.precoRobusta,
      precoArabica: h.precoArabica,
      fonte: h.fonte
    }))
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching coffee price history:', error)
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch history' })
  }
})