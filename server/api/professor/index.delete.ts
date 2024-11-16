import { H3Event } from 'h3'
import { UsuarioRepository } from '@@/repositories/UsuarioRepository'

export default defineEventHandler(async (event: H3Event) => {

  const body = await readBody(event);

  const id = body.usuario.id

  const usuarioRepository = new UsuarioRepository()

  await usuarioRepository.deleteUsuario(id)

  return true
})