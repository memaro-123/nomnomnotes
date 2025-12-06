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

    // Wait for Add Entry button to appear after dashboard is stable
    const addEntryButton = page.getByRole('button', { name: /add entry/i });
    await expect(addEntryButton).toBeVisible({ timeout: 10000 });
    await addEntryButton.click();

    // Fill in required fields
    await page.getByPlaceholder(/enter the title/i).fill('My Test Entry');

    // Location
    const locationInput = page.getByPlaceholder(/select location/i);
    await locationInput.fill('New York');
    await locationInput.press('Enter');

    // Price
    await page.getByRole('button', { name: '$$$$', exact: true }).click();

    // Cuisine
    const cuisineInput = page.getByPlaceholder(/search cuisines/i);
    await cuisineInput.fill('Italian');
    await page.getByRole('button', { name: 'Italian' }).click();

    // Ratings
    const setRating = async (categoryLocator, value) => {
    const stars = categoryLocator.locator('button');

        for (let i = 0; i < value; i++) {
            const star = stars.nth(i);
            const box = await star.boundingBox();
            if (!box) continue;

            // Move to the center of the star (x,y) and click
            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            await page.mouse.down();
            await page.mouse.up();
        }
    };

    await setRating(page.locator('div:has-text("taste") >> div.flex'), 5);
    await setRating(page.locator('div:has-text("service") >> div.flex'), 4);
    await setRating(page.locator('div:has-text("value") >> div.flex'), 3);

    // Submit form
    const saveButton = page.getByRole('button', { name: /save/i });
    await expect(saveButton).toBeVisible();
    await saveButton.click();
});