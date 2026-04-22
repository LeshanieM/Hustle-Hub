import { test, expect } from '@playwright/test';

const USERNAME = process.env.PW_REAL_CUSTOMER_USERNAME || 'achi';
const PASSWORD = process.env.PW_REAL_CUSTOMER_PASSWORD || 'achi123';

test.describe('ChatBot Component Tests', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);

    await page.goto('/login');

    await test.step('Log in with the real customer account', async () => {
      await expect(
        page.getByRole('heading', { name: /welcome back/i }),
      ).toBeVisible();
      await page.locator('input[name="username"]').fill(USERNAME);
      await page.locator('input[name="password"]').fill(PASSWORD);
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.waitForURL(/\/landing$/);
    });
  });

  test('should open chatbot and show welcome message (Positive)', async ({
    page,
  }) => {
    await test.step('Open the ChatBot', async () => {
      const toggleButton = page.getByLabel('Toggle Chat');
      await expect(toggleButton).toBeVisible();
      await toggleButton.click({ force: true });
    });

    await test.step('Verify welcome message and bot name', async () => {
      await expect(
        page.getByRole('heading', { name: 'Hustle-Bot' }),
      ).toBeVisible();
      await expect(
        page.getByText("Hi! I'm Hustle-Bot. How can I help you today?"),
      ).toBeVisible();
    });
  });
});
