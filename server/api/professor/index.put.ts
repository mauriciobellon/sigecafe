import { H3Event } from 'h3'
import { PrismaClient } from "@prisma/client"
import { UserRepository } from '@@/repositories/UserRepository'
const prisma = new PrismaClient()

export default defineEventHandler(async (event: H3Event) => {

  const body = await readBody(event);

  const name = body.name;
  const email = body.email;
  const password = body.password;


  const userRepository = new UserRepository()
  const user = await userRepository.getUserByEmail(email)
  if (!user) {
    return {
      status: 404,
      body: "Usuário não encontrado",
    }
  }
  user.name = name
  user.password = password
  const userUpdated = await userRepository.updateUser(user)

  return userUpdated
})
