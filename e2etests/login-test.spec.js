import { test, expect } from '@playwright/test';

test('user can log in and log out through settings', async ({ page }) => {
  // Go to the app
  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');

  // Switch to login mode if not already there
  await page.getByText('login').click();

  // Fill login form
  await page.getByPlaceholder('enter your email').fill('test@example.com');
  await page.getByPlaceholder('enter your password').fill('password123');

  // Click login button
  await page.getByRole('button', { name: 'login' }).nth(1).click();

  // Wait for the dashboard to load
  const diaryHeader = page.getByText('my diary');
  await expect(diaryHeader).toBeVisible({ timeout: 15000 });

  // TEMP: take screenshot after login
  await page.screenshot({ path: 'after-login.png' });

  // Click the sidebar settings button
  const settingsButton = page.getByTestId('sidebar-settings-btn');
  await expect(settingsButton).toBeVisible({ timeout: 10000 });
  await settingsButton.click();

  // Wait for Logout button inside SettingsModal
  const logoutButton = page.getByRole('button', { name: 'logout' });
  await expect(logoutButton).toBeVisible({ timeout: 10000 });

  // Click logout
  await logoutButton.click();

  // Verify we are back on the login screen
  await expect(page.getByText('login')).toBeVisible();
});