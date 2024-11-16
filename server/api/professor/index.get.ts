import { H3Event } from 'h3'
import { UsuarioType } from '@prisma/client'
import { UsuarioRepository } from '@@/repositories/UsuarioRepository'


export default defineEventHandler(async (event: H3Event) => {
  try {
    const usuarioType = 'PROFESSOR' as UsuarioType
    const usuarioRepository = new UsuarioRepository()
    const allProfessors = await usuarioRepository.getUsuarioByType(usuarioType)
    return allProfessors;
  } catch (error) {
    return {
      status: 500,
      body: error,
    }
  }
})
