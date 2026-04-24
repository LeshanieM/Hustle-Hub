import { test, expect } from '@playwright/test';

const USERNAME = process.env.PW_REAL_OWNER_USERNAME || 'owner';
const PASSWORD = process.env.PW_REAL_OWNER_PASSWORD || 'owner123';

test.describe('Owner User Journeys', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/login');

    await test.step('Log in with the real owner account', async () => {
      await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
      await page.locator('input[name="username"]').fill(USERNAME);
      await page.locator('input[name="password"]').fill(PASSWORD);
      
      // Use Promise.all to catch the navigation triggered by the click
      await Promise.all([
        page.waitForURL(/\/landing/, { timeout: 30000 }),
        page.getByRole('button', { name: /sign in/i }).click(),
      ]);
      
      // Verify we are actually on the landing page
      await expect(page.getByRole('heading', { name: /What are you looking for today/i })).toBeVisible();
    });
  });

  test('should display owner dashboard with business KPIs (Positive)', async ({ page }) => {
    await test.step('Navigate to Owner Dashboard', async () => {
      await page.goto('/owner-dashboard');
      await expect(page.locator('.animate-spin').first()).toBeHidden();
      // Match the headerTitle="Store Overview" or h2="Operational Overview"
      await expect(page.getByText(/Store Overview|Operational Overview/i).first()).toBeVisible();
    });

    await test.step('Verify business KPI cards', async () => {
      // Updated to match actual labels in OwnerDashboard.jsx
      await expect(page.getByText(/Today's Revenue|Total Revenue/i, { exact: false }).first()).toBeVisible();
      await expect(page.getByText(/Pending Orders|Total Orders/i, { exact: false }).first()).toBeVisible();
    });
  });

  test('should display stock alerts for low inventory (Positive)', async ({ page }) => {
    await test.step('Navigate to Stock Alerts page', async () => {
      await page.goto('/owner/alerts');
      await expect(page.locator('.animate-spin').first()).toBeHidden();
      // HeaderTitle is "System Alerts", page heading is "My Products"
      await expect(page.getByText(/System Alerts|My Products/i).first()).toBeVisible();
    });

    await test.step('Verify alerts table or empty state', async () => {
      const emptyState = page.getByText(/Your catalog is empty|No products are currently low on stock/i);
      const table = page.getByRole('table');
      await expect(emptyState.or(table)).toBeVisible();
    });
  });

  test('should display analytics with forecasting charts (Positive)', async ({ page }) => {
    await test.step('Navigate to Analytics page', async () => {
      await page.goto('/analytics');
      await expect(page.locator('.animate-spin').first()).toBeHidden();
      await expect(page.getByText('Insights Matrix')).toBeVisible();
    });

    await test.step('Verify Recharts components are rendered', async () => {
      // Recharts responsive containers or "Insufficient data" empty state
      const chart = page.locator('.recharts-responsive-container');
      const emptyData = page.getByText(/Insufficient data|AI Forecasting Matrix/i);
      await expect(chart.or(emptyData).first()).toBeVisible();
    });
  });

  test('should generate and download business reports (Positive)', async ({ page }) => {
    await test.step('Navigate to Reports page', async () => {
      await page.goto('/owner/reports');
      await expect(page.locator('.animate-spin').first()).toBeHidden();
      // HeaderTitle is "Business Analytics", page heading is "Business Reports"
      await expect(page.getByText(/Business Analytics|Business Reports/i).first()).toBeVisible();
    });

    await test.step('Trigger report download', async () => {
      const downloadButton = page.getByRole('button', { name: /download|generate/i }).first();
      await expect(downloadButton).toBeVisible();

      const downloadPromise = page.waitForEvent('download');
      await downloadButton.click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/\.(pdf|csv)$/);
    });
  });

  test('should block owner from accessing admin pages (Negative)', async ({ page }) => {
    await test.step('Attempt to access Admin Dashboard', async () => {
      await page.goto('/admin-dashboard');
      // Should show NotFoundPage per role restriction (Checking for 404 text)
      await expect(page.getByText(/404/i).first()).toBeVisible();
    });

    await test.step('Attempt to access Business Directory', async () => {
      await page.goto('/admin/businesses');
      await expect(page.getByText('404', { exact: false })).toBeVisible();
    });
  });
});
