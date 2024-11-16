import { getServerSession } from '#auth'
import prisma from '~~/lib/prisma'
import { comparePasswords, hashPassword } from '~~/utils/cryptUtil'

export default defineEventHandler(async (event) => {
  try {
    // Get authenticated session
    const session = await getServerSession(event)
    if (!session) {
      return {
        success: false,
        message: 'Não autorizado'
      }
    }

    // Get request body
    const body = await readBody(event)
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return {
        success: false,
        message: 'Faltam campos obrigatórios'
      }
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user?.email }
    })

    if (!usuario) {
      return {
        success: false,
        message: 'Usuário não encontrado'
      }
    }
    const hashedPassword = await hashPassword(newPassword)

    console.log(usuario.password)
    console.log(hashedPassword)
    const isValid = await comparePasswords(currentPassword, usuario.password)
    if (!isValid) {
      return {
        success: false,
        message: 'Senha atual incorreta'
      }
    }

    await prisma.usuario.update({
      where: { email: usuario.email },
      data: { password: hashedPassword }
    })

    return {
      success: true,
      message: 'Senha alterada com sucesso'
    }
  } catch (error: any) {
    console.error('Erro ao alterar senha:', error)
    return {
      success: false,
      message: 'Ocorreu um erro ao alterar a senha'
    }
  }
})