import { test, expect } from '@playwright/test';

test('user can log in and log out through settings', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // Switch to login mode
    await page.getByText('login').click();

    // Fill login form
    await page.getByPlaceholder('enter your email').fill('test@example.com');
    await page.getByPlaceholder('enter your password').fill('password123');

    // Click the REAL login submit button (the black one)
    await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle' }),
    page.getByRole('button', { name: 'login' }).nth(1).click(),
    ]);
    
    // TEMP: help us debug what the page looks like
    await page.screenshot({ path: 'after-login.png' });

    // Dashboard loads — Settings button should now be present
    const settingsButton = page.locator('button:has(svg[weight="fill"])').first();
    await expect(settingsButton).toBeVisible();

    // Open settings modal
    await settingsButton.click();

    // Wait for Settings modal to appear
    await expect(page.getByText('settings')).toBeVisible();

    // Click logout inside modal
    await page.getByRole('button', { name: /^logout$/i }).click();

    // Verify user is returned to login/signup screen
    await expect(page.getByText('login')).toBeVisible();
});