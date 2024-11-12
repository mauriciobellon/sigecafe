import prisma from '~/lib/prisma'
import type { Aluno, Escola, User } from '@prisma/client';

export class EscolaRepository {
    async getAllEscolas(): Promise<Escola[]> {
        return prisma.escola.findMany();
    }
    async getEscolaByAluno(alunoId: number): Promise<Escola | null> {
        return prisma.escola.findFirst({ where: { alunos: { some: { id: alunoId } } } });
    }
}
