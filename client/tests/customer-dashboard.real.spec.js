import { test, expect } from '@playwright/test';

const USERNAME = process.env.PW_REAL_CUSTOMER_USERNAME || 'achi';
const PASSWORD = process.env.PW_REAL_CUSTOMER_PASSWORD || 'achi123';

const impossibleSearch = 'zzzzzz-no-store-match-12345';

test.describe('Customer dashboard flows with real data', () => {
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

  test('opens the customer dashboard and shows the active order section', async ({ page }) => {
    await test.step('Open the customer dashboard', async () => {
      await page.goto('/customer-dashboard');
      await expect(page.getByText('Customer Overview')).toBeVisible();
    });

    await test.step('Verify the dashboard shell and active order section render', async () => {
      await expect(page.getByText('Total Orders', { exact: true })).toBeVisible();
      await expect(page.getByText('Active Orders', { exact: true })).toBeVisible();
      await expect(page.getByText('Order History', { exact: true })).toBeVisible();

      await page.mouse.wheel(0, 1200);
      await expect(page.getByText('Placed', { exact: true })).toBeVisible();
      await expect(page.getByText('Delivered', { exact: true })).toBeVisible();
    });
  });

  test('opens the real order history report flow', async ({ page }) => {
    await test.step('Open the real order history page', async () => {
      await page.goto('/orders');
      await expect(page.getByRole('heading', { level: 1, name: 'My Orders', exact: true })).toBeVisible();
    });

    await test.step('Trigger the report flow and verify the page remains usable', async () => {
      await expect(page.getByText('No orders yet')).not.toBeVisible();
      const downloadButton = page.getByRole('button', { name: /download report/i });
      await expect(downloadButton).toBeVisible();
      await downloadButton.click();
      await expect(downloadButton).toBeVisible();
      await expect(page.getByRole('heading', { level: 1, name: 'My Orders', exact: true })).toBeVisible();
    });
  });

  test('browses stores with real data for found and empty search states', async ({ page }) => {
    await test.step('Open the stores page and wait for real store cards', async () => {
      await page.goto('/stores');
      await expect(page.getByText('University Storefronts')).toBeVisible();
      await expect(page.getByRole('link').filter({ hasText: /visit store/i }).first()).toBeVisible();
    });

    let firstStoreName = '';

    await test.step('Capture a real store name from the first card', async () => {
      const firstCard = page.getByRole('link').filter({ hasText: /visit store/i }).first();
      const heading = firstCard.locator('h2').first();
      firstStoreName = (await heading.textContent())?.trim() || '';
      expect(firstStoreName).not.toBe('');
    });

    await test.step('Search for the real store and verify a matching result is shown', async () => {
      const searchInput = page.getByPlaceholder('Find a specific store...');
      await searchInput.fill(firstStoreName.slice(0, Math.min(firstStoreName.length, 4)));
      await expect(page.getByText(firstStoreName, { exact: true }).first()).toBeVisible();
    });

    await test.step('Search for an impossible value and verify the empty state appears', async () => {
      const searchInput = page.getByPlaceholder('Find a specific store...');
      await searchInput.fill(impossibleSearch);
      await expect(page.getByText('No Stores Match These Filters')).toBeVisible();
      await expect(page.getByRole('button', { name: /clear filters/i })).toBeVisible();
    });
  });
});
