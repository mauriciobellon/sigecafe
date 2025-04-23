import prisma from '@@/lib/prisma'
import type { Aluno, Usuario, UsuarioType } from '@prisma/client';

export class UsuarioRepository {
    async getAllUsuarios(): Promise<Usuario[]> {
        return prisma.usuario.findMany();
    }
    async getUsuarioByEmail(email: string): Promise<Usuario | null> {
        return prisma.usuario.findFirst({ where: { email } });
    }
    async getUsuarioByCelular(celular: string): Promise<Usuario | null> {
        // Normalize phone number by removing non-digit characters
        const normalizedCelular = celular.replace(/\D/g, '');

        // Try with exact match first
        let usuario = await prisma.usuario.findUnique({ where: { celular: normalizedCelular } });

        // If not found, try with a contains query (for partially formatted numbers)
        if (!usuario) {
            usuario = await prisma.usuario.findFirst({
                where: {
                    celular: {
                        contains: normalizedCelular
                    }
                }
            });
        }

        return usuario;
    }
    async getUsuarioById(id: number): Promise<Usuario | null> {
        return prisma.usuario.findUnique({ where: { id } });
    }
    async getUsuarioByType(type: UsuarioType): Promise<Usuario[]> {
        return prisma.usuario.findMany({ where: { type } });
    }
    async createUsuario(usuario: Partial<Usuario>): Promise<Usuario> {
        const { email, name, password, celular, type } = usuario;
        return prisma.usuario.create({
            data: {
                email,
                name: name!,
                password: password!,
                celular: celular!,
                type
            }
        });
    }
    async updateUsuario(usuario: Partial<Usuario> & { id: number }): Promise<Usuario> {
        const { id, email, name, password, celular, type } = usuario;
        return prisma.usuario.update({
            where: { id },
            data: {
                email,
                name,
                password,
                celular,
                type
            }
        });
    }
    async deleteUsuarioById(id: number): Promise<void> {
        await prisma.usuario.delete({ where: { id } });
    }
    async deleteUsuarioByEmail(email: string): Promise<void> {
        await prisma.usuario.delete({ where: { email } });
    }
    async deleteUsuarioByCelular(celular: string): Promise<void> {
        await prisma.usuario.delete({ where: { celular } });
    }
}
