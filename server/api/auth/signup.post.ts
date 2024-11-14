import { defineEventHandler, readBody } from 'h3'
import { hashPassword } from '@@/utils/cryptUtil'
import { UserRepository } from '@@/repositories/UserRepository'
const userRepository = new UserRepository()

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { name, email, password } = body

    if (!name || !email || !password) {
        return { success: false, message: 'Faltam campos obrigatórios' }
    }

    try {
        const existingUser = await userRepository.getUserByEmail(email)

        if (existingUser) {
            return { success: false, errorCode: 'USER_EXISTS', message: 'Usuário já existe' }
        }

        const encodedPassword = await hashPassword(password)

        await userRepository.createUser({
            name,
            email,
            password: encodedPassword,
        })

        return { success: true, message: 'Usuário criado com sucesso' }
    } catch (error) {
        console.error('Erro ao registrar:', error)
        return { success: false, message: 'Ocorreu um erro ao registrar' }
    }
}) 