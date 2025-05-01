import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UsuarioRepository } from '@@/server/repositories/UsuarioRepository';

describe('UsuarioRepository', () => {
    let usuarioRepository: UsuarioRepository;

    beforeEach(() => {
        usuarioRepository = new UsuarioRepository();
    });

    it('should create a new usuario successfully', async () => {
        const mockUsuario = {
            email: 'test@example.com',
            name: 'Test User',
            password: 'securepassword',
        };

        const createdUsuario = await usuarioRepository.createUsuario(mockUsuario as any);

        expect(createdUsuario).toHaveProperty('id');
        expect(createdUsuario.email).toBe(mockUsuario.email);
        expect(createdUsuario.name).toBe(mockUsuario.name);
    });

    it('should throw an error when creating usuario with duplicate email', async () => {
        const mockUsuario = {
            email: 'duplicate@example.com',
            name: 'Duplicate User',
            password: 'securepassword',
        };

        await usuarioRepository.createUsuario(mockUsuario as any);

        await expect(usuarioRepository.createUsuario(mockUsuario as any)).rejects.toThrow();
    });
});