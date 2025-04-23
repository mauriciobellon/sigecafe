import { getServerSession } from '#auth'
import prisma from '~~/lib/prisma'

export default defineEventHandler(async (event) => {
  // Get authenticated session
  const session = await getServerSession(event)
  if (!session?.user) {
    return {
      success: false,
      message: 'Não autorizado',
      status: 403
    }
  }

  // Get the user ID from the session
  const userEmail = session.user.email
  if (!userEmail) {
    return {
      success: false,
      message: 'Usuário não identificado',
      status: 403
    }
  }

  // Find the user in the database to get the ID
  const dbUser = await prisma.usuario.findFirst({
    where: { email: userEmail }
  })

  if (!dbUser) {
    return {
      success: false,
      message: 'Usuário não encontrado',
      status: 404
    }
  }

  const userId = dbUser.id;

  // GET request to fetch user profile
  if (event.method === 'GET') {
    try {
      const usuario = await prisma.usuario.findUnique({
        where: { id: userId },
        select: {
          name: true,
          email: true,
          celular: true,
          type: true
        }
      })

      if (!usuario) {
        return {
          success: false,
          message: 'Usuário não encontrado'
        }
      }

      return {
        success: true,
        data: usuario
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error)
      return {
        success: false,
        message: 'Erro ao buscar dados do perfil'
      }
    }
  }

  // PUT request to update user profile
  if (event.method === 'PUT') {
    try {
      const body = await readBody(event)
      const { name, email, celular } = body

      if (!name || !celular) {
        return {
          success: false,
          message: 'Nome e número de celular são obrigatórios'
        }
      }

      // Check if celular already exists for another user
      if (celular && celular !== dbUser.celular) {
        const existingUser = await prisma.usuario.findFirst({
          where: {
            celular,
            NOT: {
              id: userId
            }
          }
        })

        if (existingUser) {
          return {
            success: false,
            message: 'Este número de celular já está em uso'
          }
        }
      }

      const updatedUser = await prisma.usuario.update({
        where: { id: userId },
        data: {
          name,
          email,
          celular
        },
        select: {
          name: true,
          email: true,
          celular: true
        }
      })

      return {
        success: true,
        message: 'Perfil atualizado com sucesso',
        data: updatedUser
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      return {
        success: false,
        message: 'Erro ao atualizar perfil'
      }
    }
  }

  // DELETE request to delete user profile
  if (event.method === 'DELETE') {
    try {
      await prisma.usuario.delete({
        where: { id: userId }
      })

      return {
        success: true,
        message: 'Perfil excluído com sucesso'
      }
    } catch (error) {
      console.error('Erro ao excluir perfil:', error)
      return {
        success: false,
        message: 'Erro ao excluir perfil'
      }
    }
  }
})
