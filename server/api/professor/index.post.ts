import { H3Event } from 'h3'
import type { User, UserType } from '@prisma/client';
import { UserRepository } from '@/repositories/UserRepository';

export default defineEventHandler(async (event: H3Event) => {

  const body = await readBody(event);

  try {
    const userType = 'PROFESSOR' as UserType
    const user: User = {
      type: userType,
      email: body.email,
      password: "$2b$10$ZHrUNAK/cI8svJjK/d/Fg.pPdLWfkxjpQVfFY4ub9Z/eUPqJn.NXW", // Senha padrão "123"
      name: body.name,
    }
    const userRepository = new UserRepository()
    const newProfessor = await userRepository.createUser(user)
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
