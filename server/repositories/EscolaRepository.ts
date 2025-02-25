import prisma from '@@/lib/prisma'
import type { Escola, Usuario } from '@prisma/client';

export class EscolaRepository {
    async getEscolaByUsuario(usuario: Usuario): Promise<Escola | null> {
        if (!usuario.escolaId) return null;
        return prisma.escola.findFirst({ where: { id: usuario.escolaId } });
    }

    async updateEscola(escola: Escola): Promise<Escola | null> {
        return prisma.escola.update({ where: { id: escola.id }, data: escola });
    }

    async getEscolaByAluno(alunoId: number): Promise<Escola | null> {
        const aluno = await prisma.aluno.findUnique({
            where: { id: alunoId },
            include: { escola: true }
        });
        return aluno?.escola ?? null;
    }
}
