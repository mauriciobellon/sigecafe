import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AlunoRepository } from '@@/server/repositories/AlunoRepository';
import prisma from '@@/lib/prisma';

// Mock do prisma
vi.mock('@@/lib/prisma', () => ({
    default: {
        aluno: {
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            findMany: vi.fn(),
            findUnique: vi.fn()
        }
    }
}));

describe('AlunoRepository', () => {
    let alunoRepository: AlunoRepository;

    beforeEach(() => {
        alunoRepository = new AlunoRepository();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe('create', () => {
        it('deve criar um novo aluno com sucesso', async () => {
            const mockAluno = {
                nome: 'Aluno Teste',
                escolaId: 1,
            };

            const mockResposta = {
                id: 1,
                ...mockAluno
            };

            (prisma.aluno.create as any).mockResolvedValue(mockResposta);

            const alunoCreated = await alunoRepository.create(mockAluno as any);

            expect(alunoCreated).toHaveProperty('id');
            expect(alunoCreated.nome).toBe(mockAluno.nome);
            expect(alunoCreated.escolaId).toBe(mockAluno.escolaId);
            expect(prisma.aluno.create).toHaveBeenCalledTimes(1);
        });

        it('deve lançar erro ao criar aluno sem nome', async () => {
            const mockAluno = {
                escolaId: 1,
            };

            await expect(alunoRepository.create(mockAluno as any)).rejects.toThrow();
        });
    });

    describe('update', () => {
        it('deve atualizar um aluno existente', async () => {
            const mockAluno = {
                id: 1,
                nome: 'Aluno Atualizado',
            };

            (prisma.aluno.update as any).mockResolvedValue(mockAluno);

            const alunoAtualizado = await alunoRepository.update(mockAluno as any);

            expect(alunoAtualizado.nome).toBe(mockAluno.nome);
            expect(prisma.aluno.update).toHaveBeenCalledTimes(1);
        });
    });

    describe('delete', () => {
        it('deve deletar um aluno', async () => {
            const alunoId = 1;
            await alunoRepository.delete(alunoId);
            expect(prisma.aluno.delete).toHaveBeenCalledWith({
                where: { id: alunoId }
            });
        });
    });

    describe('getAlunosByEscola', () => {
        it('deve retornar alunos por escola', async () => {
            const escolaId = 1;
            const mockAlunos = [
                { id: 1, nome: 'Aluno 1', escolaId },
                { id: 2, nome: 'Aluno 2', escolaId }
            ];

            (prisma.aluno.findMany as any).mockResolvedValue(mockAlunos);

            const alunos = await alunoRepository.getAlunosByEscola(escolaId);

            expect(alunos).toHaveLength(2);
            expect(prisma.aluno.findMany).toHaveBeenCalledWith({
                where: { escolaId }
            });
        });
    });

    describe('getAlunosByResponsavel', () => {
        it('deve retornar alunos por responsável', async () => {
            const responsavelId = 1;
            const mockAlunos = [
                { id: 1, nome: 'Aluno 1' },
                { id: 2, nome: 'Aluno 2' }
            ];

            (prisma.aluno.findMany as any).mockResolvedValue(mockAlunos);

            const alunos = await alunoRepository.getAlunosByResponsavel(responsavelId);

            expect(alunos).toHaveLength(2);
            expect(prisma.aluno.findMany).toHaveBeenCalledWith({
                where: {
                    responsaveis: { some: { id: responsavelId } }
                }
            });
        });
    });
});