import { getServerSession } from '#auth'
import prisma from '~~/lib/prisma'

export default defineEventHandler(async (event) => {
  // Get authenticated session
  const session = await getServerSession(event)
  if (!session?.user?.email) {
    return {
      success: false,
      message: 'Não autorizado',
      status: 403
    }
  }

  // GET request to fetch user profile
  if (event.method === 'GET') {
    try {
      const usuario = await prisma.usuario.findUnique({
        where: {
          email: session.user.email
        },
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

      if (!name || !email) {
        return {
          success: false,
          message: 'Nome e email são obrigatórios'
        }
      }

      // Check if email already exists for another user
      if (email !== session.user.email) {
        const existingUser = await prisma.usuario.findUnique({
          where: { email }
        })

        if (existingUser) {
          return {
            success: false,
            message: 'Este email já está em uso'
          }
        }
      }

      const updatedUser = await prisma.usuario.update({
        where: {
          email: session.user.email
        },
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
        where: { email: session.user.email }
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
