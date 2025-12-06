import { test, expect } from '@playwright/test';

test('user can log in and log out through settings', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');

  // Switch to login mode if not already there
  await page.getByText('login').click();

  // Fill login form
  await page.getByPlaceholder('enter your email').fill('test@example.com');
  await page.getByPlaceholder('enter your password').fill('password123');

  // Click login button
  await page.getByRole('button', { name: 'login' }).nth(1).click();

  // Wait for something unique in the dashboard like my diary header
  const diaryHeader = page.getByText('my diary');
  await expect(diaryHeader).toBeVisible({ timeout: 15000 }); // give extra time for Firebase

  // Open settings modal (click the first GearIcon button)
  const settingsButton = page.locator('button:has(svg)').first();
  await settingsButton.click();

  // Wait for Logout button inside SettingsModal
  const logoutButton = page.getByRole('button', { name: 'logout' });
  await expect(logoutButton).toBeVisible();

  // Click logout
  await logoutButton.click();

  // Verify that we are back on login screen
  await expect(page.getByText('login')).toBeVisible();
});