import { H3Event } from 'h3'
import { AlunoRepository } from '@@/server/repositories/AlunoRepository'

export default defineEventHandler(async (event: H3Event) => {


  //verify if user is authenticated
  //verify if user has permission to delete 

  const body = await readBody(event);

  const id = body.usuario.id

  const alunoRepository = new AlunoRepository()

  await alunoRepository.delete(id)

  return true
})