import { test, expect } from '@playwright/test';

test.describe('Compradores Page', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the login page
    await page.goto('/auth');

    // Fill in login credentials (adjust these based on your test user)
    await page.fill('input[name="celular"]', '11999999999');
    await page.fill('input[name="password"]', 'password123');

    // Click the login button
    await page.click('button[type="submit"]');

    // Wait for navigation to the dashboard
    await page.waitForURL('/app');

    // Navigate to the compradores page
    await page.goto('/app/compradores');

    // Wait for the page to load
    await page.waitForSelector('h2:has-text("Compradores")');
  });

  test('should display compradores page with datatable', async ({ page }) => {
    // Check that the page title is displayed
    await expect(page.locator('h2:has-text("Compradores")')).toBeVisible();

    // Check that the description is displayed
    await expect(page.locator('p:has-text("Gerencie os compradores de café")')).toBeVisible();

    // Check that the datatable is displayed
    await expect(page.locator('.dataTables_wrapper')).toBeVisible();

    // Check for datatable columns
    await expect(page.locator('th:has-text("Id")')).toBeVisible();
    await expect(page.locator('th:has-text("Nome")')).toBeVisible();
    await expect(page.locator('th:has-text("Celular")')).toBeVisible();
    await expect(page.locator('th:has-text("Cidade")')).toBeVisible();
    await expect(page.locator('th:has-text("Estado")')).toBeVisible();
  });

  test('should open new comprador form', async ({ page }) => {
    // Click the "Novo Comprador" button
    await page.click('button:has-text("Novo Comprador")');

    // Check that the dialog is displayed
    await expect(page.locator('h2:has-text("Novo Comprador")')).toBeVisible();

    // Check that form fields are displayed
    await expect(page.locator('label:has-text("Nome")')).toBeVisible();
    await expect(page.locator('label:has-text("Celular")')).toBeVisible();
    await expect(page.locator('label:has-text("Documento")')).toBeVisible();
    await expect(page.locator('label:has-text("Endereço")')).toBeVisible();
    await expect(page.locator('label:has-text("Cidade")')).toBeVisible();
    await expect(page.locator('label:has-text("Estado")')).toBeVisible();

    // Check for Submit and Cancel buttons
    await expect(page.locator('button:has-text("Salvar")')).toBeVisible();
    await expect(page.locator('button:has-text("Cancelar")')).toBeVisible();
  });

  test('should show details when clicking on details button', async ({ page }) => {
    // Assuming there's at least one row in the table
    // Get the first details button
    const detailsButton = page.locator('button:has-text("Detalhes")').first();

    // Click the details button
    await detailsButton.click();

    // Check that the details dialog is displayed
    await expect(page.locator('h2:has-text("Detalhes do Comprador")')).toBeVisible();

    // Check for information displayed in the details
    await expect(page.locator('.font-semibold:has-text("Nome:")')).toBeVisible();
    await expect(page.locator('.font-semibold:has-text("Celular:")')).toBeVisible();
    await expect(page.locator('.font-semibold:has-text("Documento:")')).toBeVisible();
    await expect(page.locator('.font-semibold:has-text("Endereço:")')).toBeVisible();
    await expect(page.locator('.font-semibold:has-text("Cidade:")')).toBeVisible();
    await expect(page.locator('.font-semibold:has-text("Estado:")')).toBeVisible();

    // Check for close button
    await expect(page.locator('button:has-text("Fechar")')).toBeVisible();
  });
});