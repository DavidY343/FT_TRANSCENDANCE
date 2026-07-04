import { test, expect } from '@playwright/test';

test.describe('Edge Cases in Connections', () => {

    test('Defeat by abandonment (Grace period expiration)', async ({ browser }) => {
        test.setTimeout(90000);

        const contextA = await browser.newContext({ ignoreHTTPSErrors: true, baseURL: 'https://localhost:8080' });
        const contextB = await browser.newContext({ ignoreHTTPSErrors: true, baseURL: 'https://localhost:8080' });

        const pageA = await contextA.newPage();
        const pageB = await contextB.newPage();

        const timestamp = Date.now().toString();
        const userA = { email: `userA_${timestamp}@test.com`, user: `pA_${timestamp}`, pass: 'ValidPassword123*' };
        const userB = { email: `userB_${timestamp}@test.com`, user: `pB_${timestamp}`, pass: 'ValidPassword123*' };

        async function registerAndLogin(page, user) {
            await page.goto('/');
            await page.waitForURL('**/login', { timeout: 10000 });
            await page.locator('.auth-link').click();
            await page.waitForURL('**/register', { timeout: 10000 });
            await page.locator('#register-email').fill(user.email);
            await page.locator('#register-username').fill(user.user);
            await page.locator('#register-display-name').fill(user.user);
            await page.locator('#register-password').fill(user.pass);
            await page.locator('#register-confirm-password').fill(user.pass);
            const submitReg = page.locator('button.submit-btn');
            await expect(submitReg).toBeEnabled();
            await submitReg.click();
            await page.waitForURL('**/lobby', { timeout: 15000 });
        }

        await Promise.all([
            registerAndLogin(pageA, userA),
            registerAndLogin(pageB, userB)
        ]);

        const joinQueueA = pageA.locator('.lobby-action-card').nth(0).locator('button').nth(0);
        const joinQueueB = pageB.locator('.lobby-action-card').nth(0).locator('button').nth(0);

        await joinQueueA.click();
        await joinQueueB.click();

        await Promise.all([
            pageA.waitForURL('**/games/*', { timeout: 30000 }),
            pageB.waitForURL('**/games/*', { timeout: 30000 })
        ]);

        // Ensure both players are fully connected and see the board
        await expect(pageA.locator('.chessboard')).toBeVisible();
        await expect(pageB.locator('.chessboard')).toBeVisible();

        // Player A closes the browser, triggering disconnection
        await pageA.close();

        // Player B should see the grace modal
        const graceModalB = pageB.locator('.disconnect-grace-card');
        await expect(graceModalB).toBeVisible({ timeout: 15000 });

        // Wait for the grace period to expire (the backend enforces a 30s limit)
        // We will wait up to 40 seconds to ensure the backend processes the timeout
        const gameOverModal = pageB.locator('.game-over-modal, .result-modal'); // Adjust selector based on your actual UI for game over
        // According to translations, there's a result message like "YOU WIN"
        const winMessage = pageB.locator('text=YOU WIN');
        await expect(winMessage).toBeVisible({ timeout: 40000 });

        // Ensure the room state reflects finished
        await expect(pageB.locator('text=Opponent disconnected')).toBeHidden();
    });

    test('Simultaneous disconnection', async ({ browser }) => {
        test.setTimeout(90000);

        const contextA = await browser.newContext({ ignoreHTTPSErrors: true, baseURL: 'https://localhost:8080' });
        const contextB = await browser.newContext({ ignoreHTTPSErrors: true, baseURL: 'https://localhost:8080' });

        const pageA = await contextA.newPage();
        const pageB = await contextB.newPage();

        const timestamp = Date.now().toString();
        const userA = { email: `userA_sim_${timestamp}@test.com`, user: `pA_sim_${timestamp}`, pass: 'ValidPassword123*' };
        const userB = { email: `userB_sim_${timestamp}@test.com`, user: `pB_sim_${timestamp}`, pass: 'ValidPassword123*' };

        async function registerAndLogin(page, user) {
            await page.goto('/');
            await page.waitForURL('**/login', { timeout: 10000 });
            await page.locator('.auth-link').click();
            await page.waitForURL('**/register', { timeout: 10000 });
            await page.locator('#register-email').fill(user.email);
            await page.locator('#register-username').fill(user.user);
            await page.locator('#register-display-name').fill(user.user);
            await page.locator('#register-password').fill(user.pass);
            await page.locator('#register-confirm-password').fill(user.pass);
            const submitReg = page.locator('button.submit-btn');
            await expect(submitReg).toBeEnabled();
            await submitReg.click();
            await page.waitForURL('**/lobby', { timeout: 15000 });
        }

        await Promise.all([
            registerAndLogin(pageA, userA),
            registerAndLogin(pageB, userB)
        ]);

        const joinQueueA = pageA.locator('.lobby-action-card').nth(0).locator('button').nth(0);
        const joinQueueB = pageB.locator('.lobby-action-card').nth(0).locator('button').nth(0);

        await joinQueueA.click();
        await joinQueueB.click();

        await Promise.all([
            pageA.waitForURL('**/games/*', { timeout: 30000 }),
            pageB.waitForURL('**/games/*', { timeout: 30000 })
        ]);

        // Both players disconnect at the same time
        await Promise.all([
            pageA.close(),
            pageB.close()
        ]);

        // Wait for grace period to expire so backend cleans up the game
        await new Promise(r => setTimeout(r, 35000));

        // Let's create a new page for A and ensure they don't have an active game anymore
        const pageA_reconnected = await contextA.newPage();
        await pageA_reconnected.goto('/');
        await pageA_reconnected.waitForURL('**/login', { timeout: 15000 });
        await pageA_reconnected.locator('#login-email').fill(userA.email);
        await pageA_reconnected.locator('#login-password').fill(userA.pass);
        await pageA_reconnected.locator('button.submit-btn').click();
        await pageA_reconnected.waitForURL('**/lobby', { timeout: 15000 });

        // They should NOT see the ActiveGameCard taking over the screen
        const resumeButtonA = pageA_reconnected.locator('.active-game-container button').first();
        await expect(resumeButtonA).toBeHidden({ timeout: 5000 });
    });
});
