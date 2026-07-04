import { test, expect } from '@playwright/test';

test.describe('1v1 Multiplayer Gameplay, Real-Time Sync, and Disconnections', () => {

	test('Real-time matchmaking, websockets chat, and disconnection recovery', async ({ browser }) => {
		// Set a longer timeout for this test as it does a lot of network interactions
		test.setTimeout(90000);

		// Create two separate browser contexts to simulate two different, completely isolated users
		const contextA = await browser.newContext({ ignoreHTTPSErrors: true, baseURL: 'https://localhost:8080' });
		const contextB = await browser.newContext({ ignoreHTTPSErrors: true, baseURL: 'https://localhost:8080' });
		
		const pageA = await contextA.newPage();
		const pageB = await contextB.newPage();

		const timestamp = Date.now().toString();
		const uniqueIdA = timestamp + 'A';
		const uniqueIdB = timestamp + 'B';
		const userA = { email: `user_${uniqueIdA}@test.com`, user: `playerA_${uniqueIdA}`, pass: 'ValidPassword123*' };
		const userB = { email: `user_${uniqueIdB}@test.com`, user: `playerB_${uniqueIdB}`, pass: 'ValidPassword123*' };

		// Helper to register and login a user on a given page
        async function registerAndLogin(page, user) {
            await page.goto('/');
    
    // Wait to be redirected to login
            await page.waitForURL('**/login', { timeout: 10000 });

    // Click the "Register" link at the bottom of the login page to navigate to /register naturally
            await page.locator('.auth-link').click();
            await page.waitForURL('**/register', { timeout: 10000 });

            await page.locator('#register-email').fill(user.email);
            await page.locator('#register-username').fill(user.user);
            await page.locator('#register-display-name').fill(user.user);
            await page.locator('#register-password').fill(user.pass);
            await page.locator('#register-confirm-password').fill(user.pass);

    // Submit registration
            const submitReg = page.locator('button.submit-btn');
            await expect(submitReg).toBeEnabled();
            await submitReg.click();

    // Como la app hace auto-login al registrarse, esperamos directamente el lobby
            await page.waitForURL('**/lobby', { timeout: 15000 });
        }

		// 1. Both players register and login concurrently
		await Promise.all([
			registerAndLogin(pageA, userA),
			registerAndLogin(pageB, userB)
		]);

		// 2. Both players join the matchmaking queue
		// The matchmaking card is the first action card in the lobby grid
		const joinQueueA = pageA.locator('.lobby-action-card').nth(0).locator('button').nth(0);
		const joinQueueB = pageB.locator('.lobby-action-card').nth(0).locator('button').nth(0);

		await expect(joinQueueA).toBeEnabled();
		await expect(joinQueueB).toBeEnabled();

		await joinQueueA.click();
		await joinQueueB.click();

		// 3. Wait for the server to match them and redirect to /games/xxx
		await Promise.all([
			pageA.waitForURL('**/games/*', { timeout: 30000 }),
			pageB.waitForURL('**/games/*', { timeout: 30000 })
		]);

		// 4. Verify they are in the same game by checking the Game UI
		await expect(pageA.locator('.game-chat-card')).toBeVisible();
		await expect(pageB.locator('.game-chat-card')).toBeVisible();

		// 5. Chat Interaction (Testing WebSocket realtime message delivery)
        // Wait for WS to connect (input becomes enabled)
        await expect(pageA.locator('.chat-input')).toBeEnabled({ timeout: 15000 });
        await expect(pageB.locator('.chat-input')).toBeEnabled({ timeout: 15000 });

        const message = `Hello from ${userA.user}! Are you ready?`;
        await pageA.locator('.chat-input').fill(message);
		await pageA.locator('.chat-form button[type="submit"]').click();

		// Verify Player B receives the message in real time
		const receivedMessage = pageB.locator('.chat-message-text', { hasText: message }).first();
		await expect(receivedMessage).toBeVisible({ timeout: 15000 });

		// 6. Test Disconnection Grace Period and Race Conditions
		// We simulate Player A's browser crashing or abruptly closing
		await pageA.close();

		// Player B should detect the websocket disconnect via the backend and show the Grace Modal
		const graceModalB = pageB.locator('.disconnect-grace-card');
		await expect(graceModalB).toBeVisible({ timeout: 20000 });
		
		// 7. Player A reconnects within the 60s limit
		const pageA_reconnected = await contextA.newPage();
		await pageA_reconnected.goto('/');
		
		// Need to log in again since sessionStorage is cleared when the tab is closed
		await pageA_reconnected.waitForURL('**/login', { timeout: 15000 });
		await pageA_reconnected.locator('#login-email').fill(userA.email);
		await pageA_reconnected.locator('#login-password').fill(userA.pass);
		const submitLoginA = pageA_reconnected.locator('button.submit-btn');
		await expect(submitLoginA).toBeEnabled();
		await submitLoginA.click();

		await pageA_reconnected.waitForURL('**/lobby', { timeout: 15000 });
		
		// They should see the ActiveGameCard taking over the screen and click "Resume"
        const resumeButtonA = pageA_reconnected.locator('.active-game-container button').first();
        await expect(resumeButtonA).toBeVisible({ timeout: 30000 });
        await resumeButtonA.click();
		
		await pageA_reconnected.waitForURL('**/games/*', { timeout: 15000 });

		// Player B's grace modal should instantly disappear as Player A reconnects
		await expect(graceModalB).toBeHidden({ timeout: 15000 });
		
		// 8. Confirm the game is playable by sending another chat from B to A
		const messageB = `Welcome back!`;
		await pageB.locator('.chat-input').fill(messageB);
		await pageB.locator('.chat-form button[type="submit"]').click();
		
		const receivedMessageA = pageA_reconnected.locator('.chat-message-text', { hasText: messageB }).first();
		await expect(receivedMessageA).toBeVisible({ timeout: 15000 });

	});
});
