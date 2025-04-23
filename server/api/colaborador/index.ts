import { H3Event } from 'h3'
import { getServerSession } from '#auth'
import { Usuario, UsuarioType } from '@prisma/client'
import { UsuarioRepository } from '@@/server/repositories/UsuarioRepository'

export default defineEventHandler(async (event) => {
  const method = event.method

  const session = await getServerSession(event)
  if (!session?.user || !(session.user as Usuario).cooperativaId) {
    return []
  }

  const cooperativaId = (session.user as Usuario).cooperativaId
  if (!cooperativaId) return []

  const usuarioRepository = new UsuarioRepository()

  // GET - List associates
  if (method === "GET") {
    const query = getQuery(event)
    const type = query.type as string

    if (type === 'produtor') {
      return await usuarioRepository.getUsuarioByCooperativaAndType(cooperativaId, UsuarioType.PRODUTOR)
    } else if (type === 'comprador') {
      return await usuarioRepository.getUsuarioByCooperativaAndType(cooperativaId, UsuarioType.COMPRADOR)
    } else {
      // Return all types of associates
      const produtores = await usuarioRepository.getUsuarioByCooperativaAndType(cooperativaId, UsuarioType.PRODUTOR)
      const compradores = await usuarioRepository.getUsuarioByCooperativaAndType(cooperativaId, UsuarioType.COMPRADOR)
      const administradores = await usuarioRepository.getUsuarioByCooperativaAndType(cooperativaId, UsuarioType.COOPERATIVA)

      return [...produtores, ...compradores, ...administradores]
    }
  }

  // POST - Create associate
  if (method === "POST") {
    const body = await readBody(event)
    try {
      const type = body.type || UsuarioType.PRODUTOR

      const usuario: Partial<Usuario> = {
        type: type,
        email: body.email,
        celular: body.celular,
        password: "$2b$10$PmI51SqJpTJ4stgWqPZIyefKyeIckhIixW2QQmzDBG5L464jNYnKa", // default password
        name: body.name,
        cooperativaId: cooperativaId
      }

      if (type === UsuarioType.PRODUTOR && body.produtorId) {
        usuario.produtorId = body.produtorId
      } else if (type === UsuarioType.COMPRADOR && body.compradorId) {
        usuario.compradorId = body.compradorId
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

  // PUT - Update associate
  if (method === "PUT") {
    const body = await readBody(event)
    const { id, name, email, celular, type } = body

    const usuario = await usuarioRepository.getUsuarioById(id)
    if (!usuario) {
      return {
        status: 404,
        body: "Usuário não encontrado",
      }
    }

    usuario.name = name
    usuario.email = email
    usuario.celular = celular

    if (type) {
      usuario.type = type
    }

    return await usuarioRepository.updateUsuario(usuario)
  }

  // DELETE - Remove associate
  if (method === "DELETE") {
    const body = await readBody(event)
    const id = body.id || body.usuario?.id

    if (!id) {
      return {
        status: 400,
        body: "ID do usuário não fornecido",
      }
    }

    await usuarioRepository.deleteUsuarioById(id)
    return true
  }
})