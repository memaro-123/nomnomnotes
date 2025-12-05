const { test, expect } = require('@playwright/test');

test('user can edit and delete an existing diary entry', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Login
    await page.getByPlaceholder('enter your email').fill('testuser@gmail.com');
    await page.getByPlaceholder('enter your password').fill('testpass123');
    await page.getByRole('button', { name: /login/i }).click();

    // Assume entry exists called "My Automated Test Diary"
    await page.getByText('My Automated Test Diary').click();

    // Click edit
    await page.getByRole('button', { name: /edit/i }).click();

    // Modify title
    await page.getByPlaceholder('title').fill('Updated Automated Test Diary');

    // Save
    await page.getByRole('button', { name: /save/i }).click();

    // Verify updated title
    await expect(page.getByText('Updated Automated Test Diary')).toBeVisible();

    // Now delete it
    await page.getByText('Updated Automated Test Diary').click();
    await page.getByRole('button', { name: /delete/i }).click();

    // Confirm delete
    await page.getByRole('button', { name: /confirm/i }).click();

    // Verify deletion
    await expect(page.getByText('Updated Automated Test Diary')).not.toBeVisible();
});
