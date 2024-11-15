import prisma from '@@/lib/prisma'
import type { Aluno, User, UserType } from '@prisma/client';

export class UserRepository {
    async getAllUsers(): Promise<User[]> {
        return prisma.user.findMany();
    }
    async getUserByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({ where: { email } });
    }
    async getUserById(id: number): Promise<User | null> {
        return prisma.user.findUnique({ where: { id } });
    }
    async getUserByType(type: UserType): Promise<User[]> {
        return prisma.user.findMany({ where: { type } });
    }
    async createUser(user: User): Promise<User> {
        const email = user.email;
        const name = user.name;
        const password = user.password;
        return prisma.user.create({ data: { email, name, password } });
    }
    async updateUser(user: User): Promise<User> {
        const id = user.id;
        const email = user.email;
        const name = user.name;
        const password = user.password;
        const type = user.type;
        return prisma.user.update({ where: { id }, data: { email, name, password, type } });
    }
    async deleteUserById(id: number): Promise<void> {
        await prisma.user.delete({ where: { id } });
    }
    async deleteUserByEmail(email: string): Promise<void> {
        await prisma.user.delete({ where: { email } });
    }

    async getFilhos(id: number): Promise<Aluno[]> {
        return prisma.aluno.findMany({
            where: {
                responsaveis: {
                    some: {
                        id: id
                    }
                }
            }
        });
    }
}
