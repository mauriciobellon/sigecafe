import prisma from '@@/lib/prisma'
import type { Aluno, Usuario, UsuarioType } from '@prisma/client';

export class UsuarioRepository {
    async getAllUsuarios(): Promise<Usuario[]> {
        return prisma.usuario.findMany();
    }
    async getUsuarioByEmail(email: string): Promise<Usuario | null> {
        return prisma.usuario.findUnique({ where: { email } });
    }
    async getUsuarioById(id: number): Promise<Usuario | null> {
        return prisma.usuario.findUnique({ where: { id } });
    }
    async getUsuarioByType(type: UsuarioType): Promise<Usuario[]> {
        return prisma.usuario.findMany({ where: { type } });
    }
    async getUsuarioByEscolaAndType(escolaId: number, type: UsuarioType): Promise<Usuario[]> {
        return prisma.usuario.findMany({ where: { escolaId, type } });
    }
    async createUsuario(usuario: Usuario): Promise<Usuario> {
        const email = usuario.email;
        const name = usuario.name;
        const password = usuario.password;
        return prisma.usuario.create({ data: { email, name, password } });
    }
    async updateUsuario(usuario: Usuario): Promise<Usuario> {
        const id = usuario.id;
        const email = usuario.email;
        const name = usuario.name;
        const password = usuario.password;
        const type = usuario.type;
        return prisma.usuario.update({ where: { id }, data: { email, name, password, type } });
    }
    async deleteUsuarioById(id: number): Promise<void> {
        await prisma.usuario.delete({ where: { id } });
    }
    async deleteUsuarioByEmail(email: string): Promise<void> {
        await prisma.usuario.delete({ where: { email } });
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
