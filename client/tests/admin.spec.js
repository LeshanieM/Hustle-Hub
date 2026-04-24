import { test, expect } from '@playwright/test';

const USERNAME = process.env.PW_REAL_ADMIN_USERNAME || 'admin';
const PASSWORD = process.env.PW_REAL_ADMIN_PASSWORD || 'admin123';

test.describe('Admin User Journeys', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/login');

    await test.step('Log in with the real admin account', async () => {
      await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
      await page.locator('input[name="username"]').fill(USERNAME);
      await page.locator('input[name="password"]').fill(PASSWORD);
      
      // Use Promise.all to catch the navigation triggered by the click
      await Promise.all([
        page.waitForURL(/\/landing/, { timeout: 30000 }),
        page.getByRole('button', { name: /sign in/i }).click(),
      ]);
      
      // Verify we are actually on the landing page by checking for a known element
      await expect(page.getByRole('heading', { name: /What are you looking for today/i })).toBeVisible();
    });
  });

  test('should display admin dashboard with platform metrics (Positive)', async ({ page }) => {
    await test.step('Navigate to Admin Dashboard', async () => {
      await page.goto('/admin-dashboard');
      await expect(page.locator('.animate-spin')).not.toBeVisible();
      // Target the HEADING specifically to avoid sidebar link conflicts (Strict Mode)
      await expect(page.getByRole('heading', { name: /Platform Overview|Administrative Intelligence/i })).toBeVisible();
    });

    await test.step('Verify platform KPI cards', async () => {
      await expect(page.getByText('Total Students', { exact: true })).toBeVisible();
      await expect(page.getByText('Total Businesses', { exact: true })).toBeVisible();
    });
  });

  test('should allow admin to search and filter Business Directory (Positive)', async ({ page }) => {
    await test.step('Navigate to Business Directory', async () => {
      await page.goto('/admin/businesses');
      await expect(page.locator('.animate-spin')).not.toBeVisible();
      await expect(page.getByRole('heading', { name: 'Business Directory' }).first()).toBeVisible();
    });

    await test.step('Verify business list is loaded', async () => {
      // In BusinessDirectory, children are divs. Search/filter might return empty but we expect either cards or a message.
      const storeCards = page.locator('.grid > div');
      await expect(storeCards.first().or(page.getByText(/No businesses found/i))).toBeVisible();
    });

    await test.step('Search for a specific business', async () => {
      const searchInput = page.getByPlaceholder('Search by store or owner name...');
      await searchInput.fill('Store');
      // Results should update or show empty state
      await expect(page.locator('.grid > div').first().or(page.getByRole('heading', { name: /No businesses found/i }))).toBeVisible();
    });

    await test.step('Filter businesses by status', async () => {
      const activeFilter = page.getByRole('button', { name: 'ACTIVE', exact: true });
      await activeFilter.click();
      // Verify list updates or show empty state
      await expect(page.locator('.grid > div').first().or(page.getByRole('heading', { name: /No businesses found/i }))).toBeVisible();
    });
  });

  test('should allow admin to search and filter User Directory (Positive)', async ({ page }) => {
    await test.step('Navigate to User Directory', async () => {
      await page.goto('/admin/users');
      await expect(page.locator('.animate-spin')).not.toBeVisible();
      await expect(page.getByRole('heading', { name: 'User Directory' }).first()).toBeVisible();
    });

    await test.step('Filter users by role', async () => {
      const ownerFilter = page.getByRole('button', { name: 'OWNER', exact: true });
      await ownerFilter.click();
      // Verify list contains Owners or empty state
      await expect(page.getByText('OWNER', { exact: false }).first().or(page.getByRole('heading', { name: /No users found/i }))).toBeVisible();
    });
  });

  test('should allow admin to view and filter Audit Logs (Positive)', async ({ page }) => {
    await test.step('Navigate to Audit Logs', async () => {
      await page.goto('/admin/audit-logs');
      await expect(page.locator('.animate-spin')).not.toBeVisible();
      await expect(page.getByRole('heading', { name: 'Audit Logs' }).first()).toBeVisible();
    });

    await test.step('Filter logs by action', async () => {
      const searchInput = page.getByPlaceholder('Search logs by action or target...');
      await searchInput.fill('Login');
      // Use .group to target actual log entries specifically
      await expect(page.locator('.space-y-6 .group').first().or(page.getByRole('heading', { name: /No logs match/i }))).toBeVisible();
    });
  });

  test('should block unauthorized guest from accessing admin dashboard (Negative)', async ({ page }) => {
    await test.step('Log out and attempt direct access', async () => {
      await page.context().clearCookies();
      await page.evaluate(() => localStorage.clear());
      await page.goto('/admin-dashboard');
      await expect(page).toHaveURL(/\/login/);
    });

    await test.step('Verify login form is visible', async () => {
      await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
    });
  });
});
