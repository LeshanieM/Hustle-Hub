import { test, expect } from '@playwright/test';

const USERNAME = process.env.PW_REAL_CUSTOMER_USERNAME || 'achi';
const PASSWORD = process.env.PW_REAL_CUSTOMER_PASSWORD || 'achi123';

test.describe('Review Component Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(120000);
    
    // Login flow
    await page.goto('/login');
    await page.locator('input[name="username"]').fill(USERNAME);
    await page.locator('input[name="password"]').fill(PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();
    
    await page.waitForURL(/\/landing$/);
    await page.waitForLoadState('load');

    // Ensure we are logged in by checking the dashboard
    await page.goto('/customer-dashboard');
    await expect(page.getByText('Customer Overview')).toBeVisible();
  });

  test('Positive: Should successfully post a new review', async ({ page }) => {
    // Mock product and reviews data
    await page.route(/\/api\/products\/test-product-id/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          _id: 'test-product-id',
          name: 'Test Product',
          price: 99.99,
          description: 'A great product for testing.',
          category: 'Electronics'
        }),
      });
    });

    await page.route(/\/api\/reviews\/product\/test-product-id/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    // Navigate to product details page
    await page.goto('/customer/products/test-product-id', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/customer\/products\/test-product-id/, { timeout: 30000 });
    await expect(page.getByText('Test Product')).toBeVisible({ timeout: 30000 });

    // Mock the post review API
    await page.route(/\/api\/reviews$/, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Review created', _id: 'new-review-id' }),
        });
      } else {
        await route.continue();
      }
    });

    // Open review modal
    await page.getByRole('button', { name: /write a review/i }).click();
    await expect(page.getByRole('heading', { name: 'Write a Review' })).toBeVisible();

    // Fill rating and feedback
    await page.getByLabel('Rate 5 stars').click();
    await page.locator('textarea#feedback').fill('This is an excellent product! Highly recommended.');

    // Submit review
    await page.getByRole('button', { name: /post review/i }).click();

    // Verify success toast
    await expect(page.getByText('Review published successfully!')).toBeVisible();
  });

  test('Positive: Should successfully edit an existing review', async ({ page }) => {
    // Mock product data
    await page.route(/\/api\/products\/test-product-id/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          _id: 'test-product-id',
          name: 'Test Product',
          price: 99.99,
          description: 'A great product for testing.',
        }),
      });
    });

    // Get the user ID from localStorage after login in beforeEach
    const userJson = await page.evaluate(() => localStorage.getItem('user'));
    const user = JSON.parse(userJson || '{}');
    const userId = user._id || user.user?._id || 'mock-user-id';

    // Mock reviews to include one from the current user
    await page.route(/\/api\/reviews\/product\/test-product-id/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{
          _id: 'existing-review-id',
          rating: 4,
          feedback: 'Initial thoughts on this product.',
          user_id: { _id: userId, username: 'achi' }, 
          created_at: new Date().toISOString()
        }]),
      });
    });

    // Navigate to product details page
    await page.goto('/customer/products/test-product-id', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/customer\/products\/test-product-id/, { timeout: 30000 });
    await expect(page.getByText('Initial thoughts on this product.')).toBeVisible({ timeout: 30000 });

    // Mock the update review API
    await page.route(/\/api\/reviews\/existing-review-id/, async (route) => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Review updated' }),
        });
      } else {
        await route.continue();
      }
    });



    // Click edit button using title
    await page.getByTitle('Edit Review').click();
    
    // Verify modal is in edit mode
    await expect(page.getByRole('heading', { name: 'Edit Review' })).toBeVisible();

    // Update rating and feedback
    await page.getByLabel('Rate 5 stars').click();
    await page.locator('textarea#feedback').fill('Updated: This product is actually perfect!');

    // Submit update
    await page.getByRole('button', { name: /update review/i }).click();

    // Verify success toast
    await expect(page.getByText('Review published successfully!')).toBeVisible();
  });

  test('Negative: Should show validation error when rating is missing or feedback is too short', async ({ page }) => {
    // Mock product and reviews data
    await page.route(/\/api\/products\/test-product-id/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          _id: 'test-product-id',
          name: 'Test Product',
          price: 99.99,
          description: 'A great product for testing.',
        }),
      });
    });

    await page.route(/\/api\/reviews\/product\/test-product-id/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    // Navigate to product details page
    await page.goto('/customer/products/test-product-id', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/customer\/products\/test-product-id/, { timeout: 30000 });
    await expect(page.getByText('Test Product')).toBeVisible({ timeout: 30000 });

    // Open review modal
    await page.getByRole('button', { name: /write a review/i }).click();
    await expect(page.getByRole('heading', { name: 'Write a Review' })).toBeVisible();

    // Case 1: Missing rating
    await page.locator('textarea#feedback').fill('This feedback has enough length.');
    await page.getByRole('button', { name: /post review/i }).click();
    await expect(page.getByText(/Please select a star rating/i)).toBeVisible();

    // Small delay between toast checks
    await page.waitForTimeout(500);

    // Case 2: Short feedback
    await page.getByLabel('Rate 4 stars').click();
    // Bypass browser-native validation to trigger our custom toast validation
    await page.locator('textarea#feedback').evaluate(el => el.removeAttribute('minLength'));
    await page.locator('textarea#feedback').fill('Short'); 
    await page.getByRole('button', { name: /post review/i }).click();
    
    // Check for the error message
    await expect(page.getByText(/Feedback must be at least 10 characters/i)).toBeVisible();
  });
});
