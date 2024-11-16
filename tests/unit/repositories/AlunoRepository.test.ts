import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AlunoRepository } from '@@/repositories/AlunoRepository';

describe('AlunoRepository', () => {
    let alunoRepository: AlunoRepository;

    beforeEach(() => {
        alunoRepository = new AlunoRepository();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it('should create a new aluno successfully', async () => {
        const mockAluno = {
            nome: 'Teste Aluno',
            escolaId: 1,
        };

        const createdAluno = await alunoRepository.createAluno(mockAluno as any);

        expect(createdAluno).toHaveProperty('id');
        expect(createdAluno.nome).toBe(mockAluno.nome);
        expect(createdAluno.escolaId).toBe(mockAluno.escolaId);
    });

    it('should throw an error when creating aluno with missing nome', async () => {
        const mockAluno = {
            escolaId: 1,
        };

        await expect(alunoRepository.createAluno(mockAluno as any)).rejects.toThrow();
    });
});