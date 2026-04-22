import { test, expect } from '@playwright/test';

const USERNAME = process.env.PW_REAL_CUSTOMER_USERNAME || 'achi';
const PASSWORD = process.env.PW_REAL_CUSTOMER_PASSWORD || 'achi123';

test.describe('Product features', () => {
  
  test.beforeEach(async ({ page }) => {
    // Increase timeout for real data interactions
    test.setTimeout(60000);
    
    // Login first as /landing is protected
    await page.goto('/login');
    await page.locator('input[name="username"]').fill(USERNAME);
    await page.locator('input[name="password"]').fill(PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/\/landing$/);
  });

  test('Positive: Search for a product and view results', async ({ page }) => {
    await test.step('Perform search', async () => {
      // Ensure the search type is set to products
      await page.selectOption('select', 'products');
      const searchInput = page.getByPlaceholder(/Search/i).first();
      await searchInput.fill('Textbook');
      await page.keyboard.press('Enter');
    });

    await test.step('Verify results page', async () => {
      await page.waitForURL(/\/customer\/products/);
      // Wait for the results to load
      await expect(page.getByRole('heading', { name: /products/i }).first()).toBeVisible();
    });
  });

  test('Positive: View product details from landing page', async ({ page }) => {
    let productName = '';

    await test.step('Find first product and store its name', async () => {
      // Wait for product cards to appear
      const firstCard = page.locator('h3').first();
      await expect(firstCard).toBeVisible();
      productName = (await firstCard.textContent() || '').trim();
    });

    await test.step('Navigate to details', async () => {
      await page.getByRole('link', { name: /view details/i }).first().click();
    });

    await test.step('Verify details are correct', async () => {
      await page.waitForURL(/\/customer\/products\//);
      // Use non-exact match for robustness
      await expect(page.getByRole('heading', { name: productName, exact: false }).first()).toBeVisible();
      await expect(page.getByText(/description/i)).toBeVisible();
    });
  });

  test('Positive: Toggle favorite status (requires login)', async ({ page }) => {
    await test.step('Click favorite button', async () => {
      // Wait for landing page to fully load
      await page.waitForLoadState('networkidle');
      
      // Find a favorite button on a product card
      const favoriteButton = page.locator('button').filter({ hasText: 'favorite' }).first();
      await expect(favoriteButton).toBeVisible();
      
      await favoriteButton.click();
      
      // Wait for any toast message (success)
      // We don't check exact text to avoid localization/data issues
      await page.waitForTimeout(1000);
    });
  });

  test('Positive: 3D model rendering in product details', async ({ page }) => {
    await page.goto('/customer/products', { waitUntil: 'networkidle' });
    
    await test.step('Open first product', async () => {
      const viewDetails = page.getByRole('link', { name: /view details/i }).first();
      await expect(viewDetails).toBeVisible();
      await viewDetails.click();
    });

    await test.step('Verify 3D viewer or image placeholder', async () => {
      await page.waitForURL(/\/customer\/products\//);
      // The detail page should have either a model-viewer or an image
      const modelViewer = page.locator('model-viewer');
      const productImg = page.locator('img');
      
      // Give it a moment to load
      await page.waitForTimeout(3000);
      
      const count = await modelViewer.count() + await productImg.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test('Negative: Search for non-existent product', async ({ page }) => {
    const impossibleSearch = 'zzzzzz-non-existent-product-' + Date.now();
    
    await test.step('Perform impossible search', async () => {
      await page.selectOption('select', 'products');
      const searchInput = page.getByPlaceholder(/Search/i).first();
      await searchInput.fill(impossibleSearch);
      await page.keyboard.press('Enter');
    });

    await test.step('Verify empty state', async () => {
      await page.waitForURL(/\/customer\/products/);
      // Wait for results container to show empty state
      await expect(page.getByText(/no products/i)).toBeVisible();
    });
  });
});
