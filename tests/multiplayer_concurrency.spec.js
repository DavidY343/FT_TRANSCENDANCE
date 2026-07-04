import { test, expect } from '@playwright/test';

test.describe('Pure Concurrency', () => {

    test('Matchmaking stress test with 6 simultaneous users', async ({ browser }) => {
        test.setTimeout(120000);

        const NUM_USERS = 6;
        const contexts = [];
        const pages = [];
        const users = [];

        const timestamp = Date.now().toString();

        // Create browser contexts and pages
        for (let i = 0; i < NUM_USERS; i++) {
            const context = await browser.newContext({ ignoreHTTPSErrors: true, baseURL: 'https://localhost:8080' });
            contexts.push(context);
            pages.push(await context.newPage());
            users.push({
                email: `userC_${timestamp}_${i}@test.com`,
                user: `pC_${timestamp}_${i}`,
                pass: 'ValidPassword123*'
            });
        }

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
            await page.waitForURL('**/lobby', { timeout: 20000 });
        }

        // 1. All users register and login concurrently
        await Promise.all(pages.map((page, i) => registerAndLogin(page, users[i])));

        // 2. All users click join queue simultaneously
        const joinPromises = pages.map(async (page) => {
            const joinQueue = page.locator('.lobby-action-card').nth(0).locator('button').nth(0);
            await expect(joinQueue).toBeEnabled();
            await joinQueue.click();
        });
        await Promise.all(joinPromises);

        // 3. Wait for all users to be redirected to a game room
        const waitPromises = pages.map(page => page.waitForURL('**/games/*', { timeout: 40000 }));
        await Promise.all(waitPromises);

        // 4. Verify that pairs are created correctly (3 unique games for 6 players)
        const gameIds = new Set();
        for (const page of pages) {
            const url = page.url();
            const gameIdMatch = url.match(/\/games\/(\d+)/);
            if (gameIdMatch) {
                gameIds.add(gameIdMatch[1]);
            }
        }

        expect(gameIds.size).toBe(NUM_USERS / 2);

        // Cleanup
        await Promise.all(pages.map(page => page.close()));
    });
});
