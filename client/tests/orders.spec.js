import { test, expect } from '@playwright/test';

const USERNAME = process.env.PW_REAL_CUSTOMER_USERNAME || 'achi';
const PASSWORD = process.env.PW_REAL_CUSTOMER_PASSWORD || 'achi123';

test.describe('Customer Dashboard Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    // Navigate to login page
    await page.goto('/login');

    // Login flow
    await page.locator('input[name="username"]').fill(USERNAME);
    await page.locator('input[name="password"]').fill(PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for navigation to landing page after login
    await page.waitForURL(/\/landing$/);
    await page.waitForLoadState('load');
    
    // Now navigate to customer dashboard
    await page.goto('/customer-dashboard');
    await expect(page.getByText('Customer Overview')).toBeVisible();
  });

  test('Positive: Should display dashboard stats and welcome message', async ({ page }) => {
    // Check for welcome message
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();

    // Check for stats cards
    await expect(page.getByText('Total Orders', { exact: true })).toBeVisible();
    await expect(page.getByText('Active Orders', { exact: true })).toBeVisible();

    // Check for spending insights
    await expect(page.getByText('Spending Insights')).toBeVisible();
    await expect(page.getByText('Total Spent')).toBeVisible();
  });

  test('Positive: Should display the order history table with headers', async ({ page }) => {
    // Check if Order History section exists
    await expect(page.getByText('Order History', { exact: true })).toBeVisible();

    // Check for table headers
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Order ID' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Shop' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Amount' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible();
  });

  test('Negative: Should display empty state message when no orders exist', async ({ page }) => {
    // Mock the API response to return an empty array of orders
    await page.route('**/api/bookings/my', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    // Reload the page to trigger the mocked response
    await page.reload();
    await expect(page.getByText('Customer Overview')).toBeVisible();

    // Verify empty state for Recent Purchase History
    await expect(page.getByText('No past orders found')).toBeVisible();
    await expect(page.getByText('Discover amazing products and services')).toBeVisible();

    // Verify the Explore Marketplace button is present
    const exploreButton = page.getByRole('link', { name: /Explore Marketplace/i });
    await expect(exploreButton).toBeVisible();
    await expect(exploreButton).toHaveAttribute('href', '/stores');

    // Verify empty state for Active Order Status
    await expect(page.getByText("You don't have any active orders right now.")).toBeVisible();
  });
});
