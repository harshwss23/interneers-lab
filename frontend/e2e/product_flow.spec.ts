import { test, expect } from '@playwright/test';

test.describe('Product Management E2E Flow', () => {
  test('should allow a manager to create, edit, and view a product', async ({ page }) => {
    // 1. Login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="text"]', 'wuser');
    await page.fill('input[type="password"]', 'wuser');
    await page.click('button[type="submit"]');
    
    // Check redirect to inventory
    await expect(page).toHaveURL(/.*my-inventory/);

    // 2. Create Product
    await page.click('text=Add Product');
    await page.fill('input[placeholder="Product Name"]', 'E2E Test Tablet');
    await page.fill('input[placeholder="Price"]', '299');
    await page.fill('input[placeholder="Stock Quantity"]', '50');
    // Select first category
    await page.selectOption('select', { index: 1 });
    await page.click('button:has-text("Create Product")');

    // 3. Verify in list
    await expect(page.locator('text=E2E Test Tablet')).toBeVisible();

    // 4. Edit Product
    await page.click('text=E2E Test Tablet');
    await expect(page).toHaveURL(/.*product\/.*/);
    await page.click('text=Edit Product');
    await page.fill('input[placeholder="Product Name"]', 'E2E Test Tablet PRO');
    await page.click('button:has-text("Save Changes")');

    // 5. Verify update
    await expect(page.locator('text=E2E Test Tablet PRO')).toBeVisible();
    await expect(page.locator('text=$299')).toBeVisible();
  });
});
