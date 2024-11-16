import { describe, it, expect } from 'vitest';
import { hashPassword, comparePasswords } from '@@/utils/cryptUtil';

describe('cryptUtil', () => {
    it('hashPassword should return a hashed password', async () => {
        const password = 'password123';
        const hashed = await hashPassword(password);
        expect(hashed).not.toBe(password);
        expect(hashed).toMatch(/^\$2[ayb]\$.{56}$/);
    });

    it('comparePasswords should return true for matching passwords', async () => {
        const password = 'password123';
        const hashed = await hashPassword(password);
        const isMatch = await comparePasswords(password, hashed);
        expect(isMatch).toBe(true);
    });

    it('comparePasswords should return false for non-matching passwords', async () => {
        const password = 'password123';
        const hashed = await hashPassword(password);
        const isMatch = await comparePasswords('wrongpassword', hashed);
        expect(isMatch).toBe(false);
    });

    it('hashing the same password twice should produce different hashes', async () => {
        const password = 'password123';
        const hashed1 = await hashPassword(password);
        const hashed2 = await hashPassword(password);
        expect(hashed1).not.toBe(hashed2);
    });
});