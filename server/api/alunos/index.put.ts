import { H3Event } from 'h3'
import { PrismaClient } from "@prisma/client"
import { UsuarioRepository } from '@@/server/repositories/UsuarioRepository'
const prisma = new PrismaClient()

export default defineEventHandler(async (event: H3Event) => {

  const body = await readBody(event);

  const name = body.name;
  const email = body.email;
  const password = body.password;


  const usuarioRepository = new UsuarioRepository()
  const usuario = await usuarioRepository.getUsuarioByEmail(email)
  if (!usuario) {
    return {
      status: 404,
      body: "Usuário não encontrado",
    }
  }
  usuario.name = name
  usuario.password = password
  const usuarioUpdated = await usuarioRepository.updateUsuario(usuario)

  return usuarioUpdated
})
