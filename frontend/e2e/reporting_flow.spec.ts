import { test, expect } from '@playwright/test';

test.describe('Reporting & Navigation E2E Flow', () => {
  const username = 'wharshwss23';
  const password = 'harshwardhan706';
  const productName = `E2E Analytics ${Math.floor(Math.random() * 1000)}`;

  test('should verify reporting accuracy and navigation controls', async ({ page }) => {
    // 1. Login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/.*my-inventory/);

    // 2. Create a specific product for tracking
    await page.click('text=Add Product');
    await page.fill('input[placeholder="Product Name"]', productName);
    await page.fill('input[placeholder="Description"]', 'Automated E2E Test Product for Analytics');
    await page.fill('input[placeholder="Brand"]', 'E2E-Brand');
    await page.fill('input[placeholder="Price"]', '150');
    await page.fill('input[placeholder="Stock Quantity"]', '5'); // Below 10 threshold
    await page.selectOption('select', { index: 1 }); // Choose first category
    await page.click('button:has-text("Create Product")');

    await expect(page.locator(`text=${productName}`)).toBeVisible();

    // 3. Navigate to Reports
    await page.click('text=Reports');
    await expect(page).toHaveURL(/.*reports/);

    // 4. Test Category Distribution (Include/Exclude Range)
    await page.click('text=Inventory Distribution');
    // Set range to exclude the category we just added to
    await page.fill('input[type="number"] >> nth=0', '0');
    await page.fill('input[type="number"] >> nth=1', '10');
    await page.check('input[type="checkbox"]'); // Enable Exclude Mode
    
    // Check if some data is filtered (logic depends on existing data, but we can check if Apply works)
    await page.click('text=Apply Filters');
    
    // 5. Test Price Segmentation
    await page.click('text=Price Segments');
    await expect(page.locator('text=Mid-Range ($51-200)')).toBeVisible();

    // 6. Test Risk Analysis & Navigation
    await page.click('text=Risk Analysis');
    // Our product has stock 5, so it should be in "Critical Low Stock Items"
    const lowStockItem = page.locator(`text=${productName}`);
    await expect(lowStockItem).toBeVisible();

    // 7. Test Navigation Control (Click product in report)
    await lowStockItem.click();
    await expect(page).toHaveURL(/.*product\/.*/);
    await expect(page.locator('h1')).toContainText(productName);

    // 8. Edit and Verify Edit Flow
    await page.click('text=Edit Product');
    await page.fill('input[placeholder="Product Name"]', `${productName} UPDATED`);
    await page.fill('input[placeholder="Price"]', '550'); // Move to Premium segment
    await page.click('button:has-text("Save Changes")');

    await expect(page.locator(`text=${productName} UPDATED`)).toBeVisible();
    await expect(page.locator('text=$550')).toBeVisible();

    // 9. Final Verification in Reports
    await page.click('text=Reports');
    await page.click('text=Price Segments');
    await expect(page.locator('text=Premium ($201-1k)')).toBeVisible();
  });
});
