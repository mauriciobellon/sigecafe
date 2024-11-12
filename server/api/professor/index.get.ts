import { H3Event } from 'h3'
import { UserType } from '@prisma/client'
import { UserRepository } from '@/repositories/UserRepository'


export default defineEventHandler(async (event: H3Event) => {
  try {
    const userType = 'PROFESSOR' as UserType
    const userRepository = new UserRepository()
    const allProfessors = await userRepository.getUserByType(userType)
    return allProfessors;
  } catch (error) {
    return {
      status: 500,
      body: error,
    }
  }
})
