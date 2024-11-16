import prisma from '@@/lib/prisma'
import type { Aluno, Escola, Usuario } from '@prisma/client';

export class EscolaRepository {
    async getEscolaByAluno(alunoId: number): Promise<Escola | null> {
        return prisma.escola.findFirst({ where: { alunos: { some: { id: alunoId } } } });
    }
}
