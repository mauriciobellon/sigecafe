import { getServerSession } from '#auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // Verificar autenticação
  const session = await getServerSession(event)
  if (!session || !session.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Você precisa estar autenticado para acessar esta funcionalidade',
    })
  }

  // Buscar o usuário pelo email
  const usuario = await prisma.usuario.findFirst({
    where: {
      email: session.user.email as string
    }
  })

  if (!usuario) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Usuário não encontrado',
    })
  }

  // Processar as requisições de acordo com o método
  switch (event.method) {
    case 'GET':
      return handleGetPreferences(usuario.id)
    case 'POST':
    case 'PUT':
      return handleUpdatePreferences(event, usuario.id)
    default:
      throw createError({
        statusCode: 405,
        statusMessage: 'Método não permitido',
      })
  }
})

// Função para obter as preferências do usuário
async function handleGetPreferences(usuarioId: number) {
  try {
    // Buscar ou criar preferências
    let preferences = await prisma.userPreference.findUnique({
      where: { usuarioId }
    })

    // Se não existir, criar com valores padrão
    if (!preferences) {
      preferences = await prisma.userPreference.create({
        data: {
          usuarioId,
          theme: 'system',
          fontSize: 'medium'
        }
      })
    }

    return {
      theme: preferences.theme,
      fontSize: preferences.fontSize
    }
  } catch (error) {
    console.error('Erro ao buscar preferências:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao buscar preferências',
    })
  }
}

// Função para atualizar as preferências do usuário
async function handleUpdatePreferences(event: any, usuarioId: number) {
  try {
    const body = await readBody(event)

    // Validação básica
    if (!body) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Corpo da requisição vazio',
      })
    }

    // Permitir apenas campos específicos
    const updateData: Record<string, any> = {}

    if (body.theme && ['light', 'dark', 'system'].includes(body.theme)) {
      updateData.theme = body.theme
    }

    if (body.fontSize && ['small', 'medium', 'large'].includes(body.fontSize)) {
      updateData.fontSize = body.fontSize
    }

    // Atualizar ou criar preferências
    const preferences = await prisma.userPreference.upsert({
      where: { usuarioId },
      update: updateData,
      create: {
        usuarioId,
        ...updateData,
      }
    })

    return {
      theme: preferences.theme,
      fontSize: preferences.fontSize
    }
  } catch (error) {
    console.error('Erro ao atualizar preferências:', error)
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao atualizar preferências',
    })
  }
}