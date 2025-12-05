const { test, expect } = require('@playwright/test');

test('user can create a new diary entry', async ({ page }) => {
    await page.goto('/');

    // Log in first
    await page.getByPlaceholder('enter your email').fill('testuser@gmail.com');
    await page.getByPlaceholder('enter your password').fill('testpass123');
    await page.getByRole('button', { name: /login/i }).click();

    // Click Add Diary button
    await page.getByRole('button', { name: /add diary/i }).click();

    // Fill diary form
    await page.getByPlaceholder('title').fill('My Automated Test Diary');
    await page.getByPlaceholder('write something...').fill('This entry was created by Playwright.');

    // Save
    await page.getByRole('button', { name: /save/i }).click();

    // Verify the diary entry shows up in the list
    await expect(page.getByText('My Automated Test Diary')).toBeVisible();
});
