import prisma from '@@/lib/prisma'
import type { Usuario, UsuarioType } from '@prisma/client';

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
        let usuario = await prisma.usuario.findFirst({
            where: { celular: normalizedCelular }
        });

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
    async getUsuarioByCooperativaAndType(cooperativaId: number, type: UsuarioType): Promise<Usuario[]> {
        console.log(`Finding usuarios with cooperativaId=${cooperativaId} and type=${type}`);

        // Check if there are any users for this cooperativa regardless of type
        const allUsers = await prisma.usuario.findMany({
            where: { cooperativaId }
        });
        console.log(`Total users for cooperativa ${cooperativaId}:`, allUsers.length);

        // Now check with type filter
        const typedUsers = await prisma.usuario.findMany({
            where: {
                cooperativaId,
                type
            }
        });
        console.log(`Users with type ${type}:`, typedUsers.length);

        return typedUsers;
    }
    async createUsuario(usuario: Partial<Usuario>): Promise<Usuario> {
        const { email, name, password, celular, type, cooperativaId, associadoId, colaboradorId } = usuario;
        return prisma.usuario.create({
            data: {
                email,
                name: name!,
                password: password!,
                celular: celular!,
                type,
                cooperativaId,
                associadoId,
                colaboradorId
            }
        });
    }
    async updateUsuario(usuario: Partial<Usuario> & { id: number }): Promise<Usuario> {
        const { id, email, name, password, celular, type, cooperativaId, associadoId, colaboradorId } = usuario;

        // Get current user data
        const currentUser = await this.getUsuarioById(id);
        if (!currentUser) {
            throw new Error(`Usuario with id ${id} not found`);
        }

        // Check if we need to update the celular and if it's already used by another user
        if (celular && celular !== currentUser.celular) {
            const existingUserWithCelular = await this.getUsuarioByCelular(celular);

            // If the phone is used by another user (not this one), throw an error
            if (existingUserWithCelular && existingUserWithCelular.id !== id) {
                throw new Error(`Celular ${celular} is already in use by another user`);
            }
        }

        // Proceed with the update
        return prisma.usuario.update({
            where: { id },
            data: {
                // Only update fields that are provided
                ...(email !== undefined ? { email } : {}),
                ...(name !== undefined ? { name } : {}),
                ...(password !== undefined ? { password } : {}),
                ...(celular !== undefined ? { celular } : {}),
                ...(type !== undefined ? { type } : {}),
                ...(cooperativaId !== undefined ? { cooperativaId } : {}),
                ...(associadoId !== undefined ? { associadoId } : {}),
                ...(colaboradorId !== undefined ? { colaboradorId } : {})
            }
        });
    }
    async deleteUsuarioById(id: number): Promise<void> {
        // First delete associated UserPreference to avoid FK constraint errors
        await prisma.userPreference.deleteMany({ where: { usuarioId: id } });

        // Then delete other relations that might cause FK constraint errors
        await prisma.notificacao.deleteMany({ where: { usuarioId: id } });
        await prisma.passwordResetToken.deleteMany({ where: { usuarioId: id } });
        await prisma.oferta.deleteMany({ where: { userId: id } });

        // Check if user is involved in any transactions
        const transacoes = await prisma.transacao.findMany({
            where: {
                OR: [
                    { compradorId: id },
                    { vendedorId: id }
                ]
            }
        });

        // If there are transactions, delete them
        if (transacoes.length > 0) {
            await prisma.transacao.deleteMany({
                where: {
                    OR: [
                        { compradorId: id },
                        { vendedorId: id }
                    ]
                }
            });
        }

        // Finally delete the user
        await prisma.usuario.delete({ where: { id } });
    }
    async deleteUsuarioByCelular(celular: string): Promise<void> {
        const usuario = await this.getUsuarioByCelular(celular);
        if (usuario) {
            await this.deleteUsuarioById(usuario.id);
        }
    }
    async deleteUsuarioByEmail(email: string): Promise<void> {
        const usuario = await this.getUsuarioByEmail(email);
        if (usuario) {
            await this.deleteUsuarioById(usuario.id);
        }
    }
}
