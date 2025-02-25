import { H3Event } from 'h3'
import { getServerSession } from '#auth'
import { Usuario, UsuarioType } from '@prisma/client'
import { UsuarioRepository } from '@@/server/repositories/UsuarioRepository'

export default defineEventHandler(async (event) => {
  const method = event.method

  const session = await getServerSession(event)
  if (!session?.user || !(session.user as Usuario).escolaId) {
    return []
  }

  const escolaId = (session.user as Usuario).escolaId
  if (!escolaId) return []

  const usuarioRepository = new UsuarioRepository()

  // GET - List coordenadores
  if (method === "GET") {
    return await usuarioRepository.getUsuarioByEscolaAndType(escolaId, UsuarioType.COORDENADOR)
  }

  // POST - Create coordenador
  if (method === "POST") {
    const body = await readBody(event)
    try {
      const usuario: Partial<Usuario> = {
        type: UsuarioType.COORDENADOR,
        email: body.email,
        password: "$2b$10$PmI51SqJpTJ4stgWqPZIyefKyeIckhIixW2QQmzDBG5L464jNYnKa", // password
        name: body.name,
        escolaId: escolaId
      }

      return await usuarioRepository.createUsuario(usuario as Usuario)
    } catch (error) {
      return {
        status: 500,
        body: error,
        headers: { "Content-Type": "application/json" }
      }
    }
  }

  // PUT - Update coordenador
  if (method === "PUT") {
    const body = await readBody(event)
    const { name, email, password } = body

    const usuario = await usuarioRepository.getUsuarioByEmail(email)
    if (!usuario) {
      return {
        status: 404,
        body: "Usuário não encontrado",
      }
    }

    usuario.name = name
    usuario.password = password
    return await usuarioRepository.updateUsuario(usuario)
  }

  // DELETE - Remove coordenador
  if (method === "DELETE") {
    const body = await readBody(event)
    const id = body.usuario.id

    await usuarioRepository.deleteUsuarioById(id)
    return true
  }
})