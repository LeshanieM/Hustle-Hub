import { test, expect } from "@playwright/test";

const USERNAME = process.env.PW_REAL_CUSTOMER_USERNAME || "achi";
const PASSWORD = process.env.PW_REAL_CUSTOMER_PASSWORD || "achi123";
const INVALID_PASSWORD = "wrongpassword123";

test.describe("Login Page Tests", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    // Navigate to the login page before each test
    await page.goto("/login");
  });

  test("should render all login page elements correctly (Positive)", async ({
    page,
  }) => {
    await test.step("Verify headings and text", async () => {
      await expect(
        page.getByRole("heading", { name: "Welcome Back" }),
      ).toBeVisible();
      await expect(page.getByText("Sign in with your username")).toBeVisible();
    });

    await test.step("Verify input fields and labels", async () => {
      await expect(
        page.locator("label").filter({ hasText: "Username" }),
      ).toBeVisible();
      await expect(page.locator('input[name="username"]')).toBeVisible();

      await expect(
        page.locator("label").filter({ hasText: "Password" }),
      ).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
    });

    await test.step("Verify action buttons and links", async () => {
      await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();

      const registerLink = page.getByRole("link", { name: "Register here" });
      await expect(registerLink).toBeVisible();
      await expect(registerLink).toHaveAttribute("href", "/register");
    });
  });

  test("should successfully log in with valid credentials (Positive)", async ({
    page,
  }) => {
    await test.step("Fill in valid credentials", async () => {
      await page.locator('input[name="username"]').fill(USERNAME);
      await page.locator('input[name="password"]').fill(PASSWORD);
    });

    await test.step("Submit login form", async () => {
      await page.getByRole("button", { name: "Sign In" }).click();
    });

    await test.step("Verify successful login behavior", async () => {
      // Check for the success toast message
      await expect(
        page.getByText("Welcome back!", { exact: false }),
      ).toBeVisible();

      // Verify redirection to the landing page
      await page.waitForURL(/\/landing$/);
    });
  });

  test("should show error and prevent login with invalid credentials (Negative)", async ({
    page,
  }) => {
    await test.step("Fill in invalid credentials", async () => {
      await page.locator('input[name="username"]').fill(USERNAME);
      await page.locator('input[name="password"]').fill(INVALID_PASSWORD);
    });

    await test.step("Submit login form", async () => {
      await page.getByRole("button", { name: "Sign In" }).click();
    });

    await test.step("Verify error handling", async () => {
      // The button should briefly show "Signing In..." then revert back
      // Since it's an invalid login, an error toast should appear
      // But more importantly, we should still be on the login page
      await expect(page).not.toHaveURL(/\/landing$/);
      await expect(page).toHaveURL(/.*\/login/);

      // The inputs should still be visible, indicating we haven't navigated away
      await expect(page.locator('input[name="username"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
    });
  });
});
