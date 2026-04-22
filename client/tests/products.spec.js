import { test, expect } from '@playwright/test';

const USERNAME = process.env.PW_REAL_CUSTOMER_USERNAME || 'achi';
const PASSWORD = process.env.PW_REAL_CUSTOMER_PASSWORD || 'achi123';

const impossibleSearch = 'non-existent-product-123456789';

test.describe('Customer Products Page Tests', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page, browserName }) => {
    test.setTimeout(60000);
    

    await page.goto('/login');

    await test.step('Log in with the real customer account', async () => {
      await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
      await page.locator('input[name="username"]').fill(USERNAME);
      await page.locator('input[name="password"]').fill(PASSWORD);
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.waitForURL(/\/landing$/);
    });
  });

  test('should display products and page title (Positive)', async ({ page }) => {
    await test.step('Navigate to Products page', async () => {
      await page.goto('/customer/products');
      await expect(page.getByRole('heading', { name: 'University Storefront' })).toBeVisible();
      await expect(page.getByText('Discover exclusive university merchandise')).toBeVisible();
    });

    await test.step('Verify product cards are visible', async () => {
      // Wait for loading to finish
      await expect(page.locator('.animate-spin')).not.toBeVisible();
      
      // Check if at least one product card is present
      const productCards = page.locator('.grid > div'); // ProductCard container
      await expect(productCards.first()).toBeVisible();
    });
  });

  test('should filter products by search query (Positive)', async ({ page }) => {
    await test.step('Navigate to Products page', async () => {
      await page.goto('/customer/products');
      await expect(page.locator('.animate-spin')).not.toBeVisible();
    });

    let firstProductName = '';

    await test.step('Capture a real product name from the first card', async () => {
      const firstCard = page.locator('.grid > div').first();
      const heading = firstCard.locator('h3').first();
      firstProductName = (await heading.textContent())?.trim() || '';
      expect(firstProductName).not.toBe('');
    });

    await test.step('Search for the real product and verify it remains visible', async () => {
      const searchInput = page.getByPlaceholder('Search products...');
      await searchInput.fill(firstProductName);
      
      // The result should match the search
      await expect(page.getByText(firstProductName, { exact: true }).first()).toBeVisible();
    });
  });

  test('should show empty state when no products match search (Negative)', async ({ page }) => {
    await test.step('Navigate to Products page', async () => {
      await page.goto('/customer/products');
      await expect(page.locator('.animate-spin')).not.toBeVisible();
    });

    await test.step('Search for an impossible value', async () => {
      const searchInput = page.getByPlaceholder('Search products...');
      await searchInput.fill(impossibleSearch);
      
      // Verify "No products found" message
      await expect(page.getByText('No products found')).toBeVisible();
      await expect(page.getByText("We couldn't find anything matching your search criteria.")).toBeVisible();
      
      // Verify "Clear filters" button exists
      await expect(page.getByRole('button', { name: /clear filters/i })).toBeVisible();
    });
  });
});
