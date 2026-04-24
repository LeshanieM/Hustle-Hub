import { test, expect } from '@playwright/test';

const USERNAME = process.env.PW_REAL_CUSTOMER_USERNAME || 'achi';
const PASSWORD = process.env.PW_REAL_CUSTOMER_PASSWORD || 'achi123';

test.describe('Customer User Journeys', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
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

  test('should display customer dashboard with overview data (Positive)', async ({ page }) => {
    await test.step('Navigate to Customer Dashboard', async () => {
      await page.goto('/customer-dashboard');
      await expect(page.locator('.animate-spin')).not.toBeVisible();
      await expect(page.getByText('Customer Overview')).toBeVisible();
    });

    await test.step('Verify dashboard KPI cards', async () => {
      await expect(page.getByText('Total Orders', { exact: true })).toBeVisible();
      await expect(page.getByText('Active Orders', { exact: true })).toBeVisible();
      await expect(page.getByText('Order History', { exact: true })).toBeVisible();
    });
  });

  test('should allow customer to browse and search stores (Positive)', async ({ page }) => {
    await test.step('Navigate to Stores page', async () => {
      await page.goto('/stores');
      await expect(page.locator('.animate-spin')).not.toBeVisible();
      await expect(page.getByText('University Storefronts')).toBeVisible();
    });

    await test.step('Verify store cards are visible', async () => {
      // BrowseStores uses Link (<a>) children inside the grid
      const storeCards = page.getByRole('link', { name: /visit store/i });
      await expect(storeCards.first()).toBeVisible();
    });

    await test.step('Search for a specific store', async () => {
      const searchInput = page.getByPlaceholder('Find a specific store...');
      await searchInput.fill('Store');
      // Result should still show something or be filtered
      await expect(page.getByRole('link', { name: /visit store/i }).first()).toBeVisible();
    });
  });

  test('should open my orders and download report (Positive)', async ({ page }) => {
    await test.step('Navigate to Orders page', async () => {
      await page.goto('/orders');
      await expect(page.locator('.animate-spin')).not.toBeVisible();
      await expect(page.getByRole('heading', { name: 'My Orders' }).first()).toBeVisible();
    });

    await test.step('Trigger report download', async () => {
      const downloadButton = page.getByRole('button', { name: /download report/i });
      await expect(downloadButton).toBeVisible();

      const downloadPromise = page.waitForEvent('download');
      await downloadButton.click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('.pdf');
    });
  });

  test('should view notifications and mark as read (Positive)', async ({ page }) => {
    await test.step('Check notification bell in header', async () => {
      await page.goto('/landing');
      // Support both SVG (Lucide) and Material icons used across different headers
      const bell = page.locator('button').filter({ has: page.locator('svg, .material-symbols-outlined') }).first();
      await expect(bell).toBeVisible();
      await bell.click();
      // Dropdown should appear - NotificationBell component uses "Notifications" as heading
      await expect(page.getByRole('heading', { name: 'Notifications' }).first()).toBeVisible();
    });

    await test.step('Navigate to full notifications page', async () => {
      await page.goto('/notifications');
      await expect(page.locator('.animate-spin')).not.toBeVisible();
      await expect(page.getByRole('heading', { name: 'Notifications' }).first()).toBeVisible();
    });

    await test.step('Mark a notification as read', async () => {
      const markReadBtn = page.getByRole('button', { name: /mark as read/i }).first();
      if (await markReadBtn.isVisible()) {
        await markReadBtn.click();
      }
    });
  });

  test('should block customer from accessing owner/admin pages (Negative)', async ({ page }) => {
    await test.step('Attempt to access Owner Dashboard', async () => {
      await page.goto('/owner-dashboard');
      await expect(page.getByText('404', { exact: false })).toBeVisible();
    });

    await test.step('Attempt to access Admin Dashboard', async () => {
      await page.goto('/admin-dashboard');
      await expect(page.getByText('404', { exact: false })).toBeVisible();
    });
  });
});
