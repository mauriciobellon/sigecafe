import prisma from '@@/lib/prisma'
import type { Aluno, Escola, Usuario } from '@prisma/client';

export class AlunoRepository {

    async create(aluno: Aluno): Promise<Aluno> {
        const { nome } = aluno;
        return prisma.aluno.create({
            data: {
                nome,
                escola: {
                    connect: { id: aluno.escolaId }
                }
            }
        });
    }

    async update(aluno: Aluno): Promise<Aluno> {
        const id = aluno.id;
        const nome = aluno.nome;
        return prisma.aluno.update({ where: { id }, data: { nome } });
    }

    async delete(id: number): Promise<void> {
        await prisma.aluno.delete({ where: { id } });
    }

    async getAlunosByEscola(escolaId: number): Promise<Aluno[]> {
        return prisma.aluno.findMany({
            where: {
                escolaId: escolaId
            }
        });
    }

    async getAlunosByResponsavel(responsavelId: number): Promise<Aluno[]> {
        return prisma.aluno.findMany({
            where: {
                responsaveis: { some: { id: responsavelId } }
            }
        });
    }

    async getResponsaveisByAluno(alunoId: number): Promise<Usuario[]> {
        const aluno = await prisma.aluno.findUnique({
            where: { id: alunoId },
            include: { responsaveis: true }
        });
        return aluno?.responsaveis ?? [];
    }


}
