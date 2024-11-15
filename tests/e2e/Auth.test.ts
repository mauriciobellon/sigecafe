import { createPage, url } from "@nuxt/test-utils/e2e";
import type { Page } from "playwright-core";
import { describe, expect, test, beforeAll, afterAll } from "vitest";
import { UserRepository } from "~~/repositories/UserRepository";
import setup from "./__setup";
describe("Authentication Flow", () => {
    const testUser = {
        name: "Test User",
        email: "test@test.com",
        password: "password"
    };

    let page: Page;
    let userRepository: UserRepository;

    beforeAll(async () => {
        // Setup
        setup();
        userRepository = new UserRepository();
        page = await createPage();

        // Cleanup existing test user if exists
        try {
            await userRepository.deleteUserByEmail(testUser.email);
        } catch (error) {
            // Ignore if user doesn't exist
        }
    });

    afterAll(async () => {
        // Cleanup
        try {
            await userRepository.deleteUserByEmail(testUser.email);
        } catch (error) {
            // Ignore if user doesn't exist
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
            await page.getByPlaceholder("Nome Completo").fill(testUser.name);
            await page.getByRole("button").click();
            // Add assertion for next step visibility if applicable
        });

        test("should allow entering email", async () => {
            await page.getByPlaceholder("name@example.com").fill(testUser.email);
            await page.getByRole("button").click();
            // Add assertion for next step visibility if applicable
        });

        test("should allow entering password and complete signup", async () => {
            await page.getByPlaceholder("********").fill(testUser.password);
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
            await page.getByRole("textbox", { name: "email" }).fill(testUser.email);
            await page.getByRole("button").click();
            // Add assertion for password field visibility if applicable
        });

        test("should allow entering password and complete login", async () => {
            await page.getByRole("textbox", { name: "password" }).fill(testUser.password);
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
