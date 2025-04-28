import { prisma } from '../../utils/prisma';

export default defineEventHandler(async (event) => {
  try {
    // Buscar valores mínimos e máximos
    const result = await prisma.transacao.aggregate({
      _min: {
        valorTotal: true,
        data: true
      },
      _max: {
        valorTotal: true,
        data: true
      }
    });

    return {
      minValue: result._min.valorTotal || 0,
      maxValue: result._max.valorTotal || 0,
      minDate: result._min.data || new Date(),
      maxDate: result._max.data || new Date()
    };
  } catch (error) {
    console.error('Erro ao buscar limites:', error);
    throw createError({
      statusCode: 500,
      message: 'Erro ao buscar limites'
    });
  }
}); 