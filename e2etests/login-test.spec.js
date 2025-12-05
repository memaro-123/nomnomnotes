const { test, expect } = require('@playwright/test');

test('user can login successfully, see dashboard, and logout', async ({ page }) => {
    // Go to the login screen
    await page.goto('/');

    // Fill login form (match your actual React inputs)
    await page.fill('input[placeholder="enter your email"]', 'testuser@gmail.com');
    await page.fill('input[placeholder="enter your password"]', 'testpass123');

    // Click login
    await page.click('button:has-text("login")');

    // Dashboard should appear
    await expect(
        page.getByText(/my diary/i)
    ).toBeVisible();

    // Open settings menu to click logout
    await page.click('button:has-text("settings")');

    // Click logout
    await page.click('button:has-text("logout")');

    // Verify we are back on login page
    await expect(
        page.locator('text=login')
    ).toBeVisible();
});
