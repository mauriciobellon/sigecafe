import { H3Event } from 'h3'
import { UserRepository } from '@@/repositories/UserRepository'

export default defineEventHandler(async (event: H3Event) => {

  const body = await readBody(event);

  const id = body.user.id

  const userRepository = new UserRepository()

  await userRepository.deleteUser(id)

  return true
})