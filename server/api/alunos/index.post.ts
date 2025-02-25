import { H3Event } from 'h3'
import type { Usuario, UsuarioType } from '@prisma/client';
import { UsuarioRepository } from '@@/server/repositories/UsuarioRepository'

export default defineEventHandler(async (event: H3Event) => {

  const body = await readBody(event);

  try {
    const usuarioType = 'PROFESSOR' as UsuarioType
    //@ts-ignore
    const usuario: Usuario = {
      type: usuarioType,
      email: body.email,
      password: "$2b$10$ZHrUNAK/cI8svJjK/d/Fg.pPdLWfkxjpQVfFY4ub9Z/eUPqJn.NXW", // Senha padrão "123"
      name: body.name,
    }
    const usuarioRepository = new UsuarioRepository()
    const newProfessor = await usuarioRepository.createUsuario(usuario)
    return newProfessor;
  } catch (error) {
    return {
      status: 500,
      body: error,
      headers: {
        "Content-Type": "application/json",
      },
    }
  }
})
