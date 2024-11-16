import { createPage, url } from "@nuxt/test-utils/e2e";
import type { Page } from "playwright-core";
import { describe, expect, test, beforeAll, afterAll } from "vitest";
import { UsuarioRepository } from "~~/repositories/UsuarioRepository";
import setup from "./__setup";
describe("Authentication Flow", () => {
    const testUsuario = {
        name: "Test Usuario",
        email: "test@test.com",
        password: "password"
    };

    let page: Page;
    let usuarioRepository: UsuarioRepository;

    beforeAll(async () => {
        // Setup
        setup();
        usuarioRepository = new UsuarioRepository();
        page = await createPage();

        // Cleanup existing test usuario if exists
        try {
            await usuarioRepository.deleteUsuarioByEmail(testUsuario.email);
        } catch (error) {
            // Ignore if usuario doesn't exist
        }
    });

    afterAll(async () => {
        // Cleanup
        try {
            await usuarioRepository.deleteUsuarioByEmail(testUsuario.email);
        } catch (error) {
            // Ignore if usuario doesn't exist
        }
        await page.close();
    });

    describe("Restricted Unauthenticated Access", () => {
        test("should redirect to auth page when accessing home", async () => {
            await page.goto(url("/"), { waitUntil: "networkidle" });
            const currentPath = new URL(page.url()).pathname;
            expect(currentPath).toBe("/auth");
        });
    });

    describe("Sign Up Flow", () => {
        test("should load signup page", async () => {
            await page.goto(url("/auth/signup"), { waitUntil: "networkidle" });
            expect(page.url()).toContain("/auth/signup");
        });

        test("should allow entering name", async () => {
            await page.getByPlaceholder("Nome Completo").fill(testUsuario.name);
            await page.getByRole("button").click();
            // Add assertion for next step visibility if applicable
        });

        test("should allow entering email", async () => {
            await page.getByPlaceholder("name@example.com").fill(testUsuario.email);
            await page.getByRole("button").click();
            // Add assertion for next step visibility if applicable
        });

        test("should allow entering password and complete signup", async () => {
            await page.getByPlaceholder("********").fill(testUsuario.password);
            await page.getByRole("button").click();

            await page.waitForURL(url("app"));
            const currentPath = new URL(page.url()).pathname;
            expect(currentPath).toBe("/app");
        });
    });

    describe("Logout Flow", () => {
        test("should show logout option in dropdown", async () => {
            await page.getByTestId("dropdown-button").click();
            const logoutButton = page.getByTestId("dropdown-button-Sair");
            expect(await logoutButton.isVisible()).toBe(true);
        });

        test("should successfully logout and redirect to auth", async () => {
            await page.getByTestId("dropdown-button-Sair").click();
            await page.waitForURL(url("auth?callbackUrl=http://localhost:3000/app"));
            const currentPath = new URL(page.url()).pathname;
            expect(currentPath).toBe("/auth");
        });
    });

    describe("Login Flow", () => {
        test("should load login page", async () => {
            await page.goto(url("/auth"), { waitUntil: "networkidle" });
            expect(page.url()).toContain("/auth");
        });

        test("should allow entering email", async () => {
            await page.getByRole("textbox", { name: "email" }).fill(testUsuario.email);
            await page.getByRole("button").click();
            // Add assertion for password field visibility if applicable
        });

        test("should allow entering password and complete login", async () => {
            await page.getByRole("textbox", { name: "password" }).fill(testUsuario.password);
            await page.getByRole("button").click();

            await page.waitForURL(url("app"));
            const currentPath = new URL(page.url()).pathname;
            expect(currentPath).toBe("/app");
        });
    });

    describe("Account Deletion", () => {
        test("should show account option in dropdown", async () => {
            await page.getByTestId("dropdown-button").click();
            const accountButton = page.getByTestId("dropdown-button-Conta");
            expect(await accountButton.isVisible()).toBe(true);
        });

        test("should successfully redirect to account page", async () => {
            await page.getByTestId("dropdown-button-Conta").click();
            await page.waitForURL(url("app/perfil"));
            const currentPath = new URL(page.url()).pathname;
            expect(currentPath).toBe("/app/perfil");
        });

        test("should show delete account option in account page", async () => {
            await page.getByTestId("nav-link-Excluir Conta").click();
            await page.waitForURL(url("app/perfil/excluir"));
            const currentPath = new URL(page.url()).pathname;
            expect(currentPath).toBe("/app/perfil/excluir");
        });

        test("should successfully delete account and redirect to auth", async () => {
            await page.getByTestId("delete-account-button").click();
            await page.waitForURL(url("auth?callbackUrl=http://localhost:3000/app/perfil/excluir"));
            const currentPath = new URL(page.url()).pathname;
            expect(currentPath).toBe("/auth");
        });

    });
});
