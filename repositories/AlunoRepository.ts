import prisma from '~/lib/prisma'
import type { Aluno } from '@prisma/client';

export class AlunoRepository {
    async getAllAlunos(): Promise<Aluno[]> {
        return prisma.aluno.findMany();
    }

    async getAlunosByResponsavel(responsavelId: number): Promise<Aluno[]> {
        return prisma.aluno.findMany({
            where: {
                responsaveis: { some: { id: responsavelId } }
            }
        });
    }

    async createAluno(aluno: Aluno): Promise<Aluno> {
        const nome = aluno.nome;
        return prisma.aluno.create({ data: { nome } });
    }
    async updateAluno(aluno: Aluno): Promise<Aluno> {
        const id = aluno.id;
        const nome = aluno.nome;
        return prisma.aluno.update({ where: { id }, data: { nome } });
    }
    async deleteAluno(id: number): Promise<void> {
        await prisma.aluno.delete({ where: { id } });
    }
}
