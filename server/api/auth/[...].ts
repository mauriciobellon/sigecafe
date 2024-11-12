import CredentialsProvider from 'next-auth/providers/credentials'
import { NuxtAuthHandler } from '#auth'
import { UserRepository } from '../../repositories/UserRepository'
import { comparePasswords } from '../../utils/cryptUtil'
import { User } from '@prisma/client'

const userRepository = new UserRepository()

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

                const user = await userRepository.getUserByEmail(credentials.email)

                if (!user || !user.password) {
                    throw new Error('Credenciais inválidas')
                }

                const isPasswordValid = await comparePasswords(credentials.password, user.password)
                if (!isPasswordValid) {
                    throw new Error('Credenciais inválidas')
                }

                return user
            },
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            if (token?.email) {
                const user: User | null = await userRepository.getUserByEmail(token.email)
                if (user) {
                    session.user = user
                } else {
                    session.user = undefined
                }
            }
            return session
        }
    }
})