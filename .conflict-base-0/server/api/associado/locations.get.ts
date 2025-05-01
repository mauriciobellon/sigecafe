import { prisma } from '../../utils/prisma';

interface AssociadoLocation {
  cidade: string | null;
  estado: string | null;
}

export default defineEventHandler(async (event) => {
  try {
    // Buscar todos os associados
    const associados = await prisma.associado.findMany({
      select: {
        cidade: true,
        estado: true
      },
      where: {
        cidade: {
          not: null
        },
        estado: {
          not: null
        }
      }
    });

    // Extrair cidades e estados únicos
    const cidades = [...new Set(associados.map((a: AssociadoLocation) => a.cidade).filter(Boolean))];
    const estados = [...new Set(associados.map((a: AssociadoLocation) => a.estado).filter(Boolean))];

    return {
      cidades,
      estados
    };
  } catch (error) {
    console.error('Erro ao buscar localizações:', error);
    throw createError({
      statusCode: 500,
      message: 'Erro ao buscar localizações'
    });
  }
}); 