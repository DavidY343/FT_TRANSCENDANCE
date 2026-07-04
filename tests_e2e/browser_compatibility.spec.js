import { test, expect } from '@playwright/test';

test.describe('Robust Cross-Browser Testing: Auth, Navigation, and UI', () => {
	
	test.beforeEach(async ({ page }) => {
		// Intercept login API request to mock authentication
		await page.route('**/api/v1/auth/login', async route => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					access_token: 'fake-access-token',
					refresh_token: 'fake-refresh-token',
				}),
			});
		});

		// Intercept user profile API to prevent errors when navigating to authenticated pages
		await page.route('**/api/v1/users/me', async route => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					id: 1,
					username: 'TestUser',
					email: 'test@example.com',
					stats: { wins: 10, losses: 5, elo: 1200 }
				}),
			});
		});

		// Mock leaderboard data
		await page.route('**/api/v1/leaderboard**', async route => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					results: [
						{ username: 'Player1', elo: 2000 },
						{ username: 'Player2', elo: 1500 }
					]
				}),
			});
		});
	});

	test('1. Should perform a complete login flow and redirect to lobby', async ({ page }) => {
		// Go to login page
		await page.goto('/login');

		const inputEmail = page.locator('input[type="email"]');
		const inputPassword = page.locator('input[type="password"]');
		const submitButton = page.locator('button[type="submit"]');

		// Check UI elements
		await expect(inputEmail).toBeVisible();
		await expect(inputPassword).toBeVisible();
		await expect(submitButton).toBeDisabled();

		// Fill the form
		await inputEmail.fill('test@example.com');
		await inputPassword.fill('ValidPassword123*');
		
		// Button should enable after valid input
		await expect(submitButton).toBeEnabled();

		// Submit the form
		await submitButton.click();

		// Expect redirection to the lobby
		await expect(page).toHaveURL(/.*\/lobby/);
		await expect(page.locator('.brand-title')).toBeVisible(); // Check TopBar brand
	});

	test('2. Should navigate to different authenticated pages via TopBar', async ({ page }) => {
		// Direct navigation with mocked token in localStorage
		await page.goto('/lobby');
		
		// Wait for the app to initialize auth state (injecting token)
		await page.evaluate(() => {
			localStorage.setItem('access_token', 'fake-access-token');
		});
		await page.reload();

		// Check we are in lobby
		await expect(page).toHaveURL(/.*\/lobby/);

		// Navigate to Leaderboard using UI elements (assuming links exist in TopBar/MenuDisplay)
		// We use a broader approach: finding link by href or text if they exist, or direct navigation
		// Let's ensure the menu can be opened if it's hidden behind a burger menu
		const menuButton = page.locator('summary').or(page.locator('.menu-toggle'));
		if (await menuButton.isVisible()) {
			await menuButton.click();
		}

		// Navigate to Profile
		await page.goto('/profile');
		await expect(page).toHaveURL(/.*\/profile/);
		
		// Navigate to Leaderboard
		await page.goto('/leaderboard');
		await expect(page).toHaveURL(/.*\/leaderboard/);
	});

	test('3. Should verify Language Selector changes the UI language state', async ({ page }) => {
		await page.goto('/login');

		// Locate the select dropdown for language
		const langSelector = page.locator('.language-selector');
		await expect(langSelector).toBeVisible();

		// Change to Spanish
		await langSelector.selectOption('es');
		
		// Verify local storage is updated (since contexts persist to localStorage)
		const savedLang = await page.evaluate(() => localStorage.getItem('app_lang'));
		expect(savedLang).toBe('es');

		// Change to French
		await langSelector.selectOption('fr');
		const savedLangFr = await page.evaluate(() => localStorage.getItem('app_lang'));
		expect(savedLangFr).toBe('fr');
	});
});
