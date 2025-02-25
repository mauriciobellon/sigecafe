import CredentialsProvider from 'next-auth/providers/credentials'
import { Usuario } from '@prisma/client'
import { NuxtAuthHandler } from '#auth'
import { verify } from '@@/server/utils/crypto'
import { UsuarioRepository } from '@@/server/repositories/UsuarioRepository'

const usuarioRepository = new UsuarioRepository()

export default NuxtAuthHandler({
    secret: process.env.AUTH_SECRET,
    pages: {
        signIn: '/auth',
    },
    session: {
        strategy: 'jwt',
        maxAge: 600,
    },
    providers: [
        // @ts-ignore
        CredentialsProvider.default({
            name: 'Credentials',
            // @ts-ignore
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Credenciais inválidas')
                }

                const usuario = await usuarioRepository.getUsuarioByEmail(credentials.email)

                if (!usuario || !usuario.password) {
                    throw new Error('Credenciais inválidas')
                }

                const isPasswordValid = await verify(credentials.password, usuario.password)
                if (!isPasswordValid) {
                    throw new Error('Credenciais inválidas')
                }

                return usuario
            },
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            if (token?.email) {
                const usuario: Usuario | null = await usuarioRepository.getUsuarioByEmail(token.email)
                if (usuario) {
                    session.user = usuario
                } else {
                    session.user = undefined
                }
            }
            return session
        }
    }
})