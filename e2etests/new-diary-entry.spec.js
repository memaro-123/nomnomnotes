import { test, expect } from '@playwright/test';

test('user can create a new diary entry', async ({ page }) => {
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

  // Wait for dashboard to load
  const diaryHeader = page.getByText('my diary');
  await expect(diaryHeader).toBeVisible({ timeout: 15000 });

  // Click "Add Entry" button
  const addEntryButton = page.getByRole('button', { name: /add entry/i });
  await expect(addEntryButton).toBeVisible({ timeout: 10000 });
  await addEntryButton.click();

  // Fill in required fields

  // Title
  await page.getByPlaceholder(/enter the title/i).fill('My Test Entry');

  // Location (simulate selection via JS to trigger onPlaceSelected)
  await page.evaluate(() => {
    const input = document.querySelector('input[data-testid="location-input"]');
    input.value = 'New York';

    const reactFiberKey = Object.keys(input).find(k => k.startsWith('__reactFiber'));
    if (reactFiberKey) {
      let fiberNode = input[reactFiberKey];
      let props = fiberNode.return?.memoizedProps;
      while (!props?.onPlaceSelected && fiberNode.return) {
        fiberNode = fiberNode.return;
        props = fiberNode.memoizedProps;
      }
      if (props?.onPlaceSelected) {
        props.onPlaceSelected({
          name: 'New York',
          address: 'New York, USA',
          placeId: 'fake-id',
          location: { lat: 40.7128, lng: -74.0060 },
          raw: {}
        });
      }
    }
  });

  // Price
  await page.getByRole('button', { name: '$$$$', exact: true }).click();

  // Cuisine
  const cuisineInput = page.getByTestId('cuisine-input');
  await cuisineInput.fill('Italian');
  await page.getByRole('button', { name: 'Italian' }).click();

  // Star Ratings helper
  const setRating = async (category, value) => {
    const container = page.locator(`div:has-text("${category}") >> div.flex`);
    const stars = container.locator('button');

    for (let i = 0; i < value; i++) {
      const starBox = await stars.nth(i).boundingBox();
      if (!starBox) continue;
      // Click the right half for full star
      await page.mouse.move(starBox.x + starBox.width * 0.75, starBox.y + starBox.height / 2);
      await page.mouse.down();
      await page.mouse.up();
    }
  };

  // Set ratings: taste=5, service=4, value=3
  await setRating('taste', 5);
  await setRating('service', 4);
  await setRating('value', 3);

  // Submit form
  const saveButton = page.getByRole('button', { name: /save/i });
  await expect(saveButton).toBeVisible();
  await saveButton.click();
});
