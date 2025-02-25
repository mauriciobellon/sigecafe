import { defineEventHandler, readBody } from 'h3'
import { hash } from '@@/server/utils/crypto'
import { UsuarioRepository } from '@@/server/repositories/UsuarioRepository'
const usuarioRepository = new UsuarioRepository()

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { name, email, password } = body

    if (!name || !email || !password) {
        return { success: false, message: 'Faltam campos obrigatórios' }
    }

    try {
        const existingUsuario = await usuarioRepository.getUsuarioByEmail(email)

        if (existingUsuario) {
            return { success: false, errorCode: 'USER_EXISTS', message: 'Usuário já existe' }
        }

        const encodedPassword = await hash(password)

        await usuarioRepository.createUsuario({
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