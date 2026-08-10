import { test, expect } from '../fixtures/test';
import { e2eEnv } from '../support/env';

// P0-3 — Auth session & guards (AGENTS.md's E2E section): identity gates
// orders, cart sync and order history. A broken `proxy.ts` either locks
// every customer out or exposes protected routes.

test.describe('auth session and guards', () => {
  test('an unauthenticated visit to a protected route redirects to login with the return path', async ({
    page,
  }) => {
    await page.goto('/user');
    await expect(page).toHaveURL(/\/login\?from=%2Fuser/);
  });

  test('wrong credentials show an inline error and do not sign in', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login(e2eEnv.userEmail, 'not-the-real-password-123');
    await loginPage.expectInvalidCredentialsError();
    await expect(page).toHaveURL('/login');
  });

  test('correct credentials redirect back to the originally requested page, and the session survives a reload and blocks re-visiting /login', async ({
    page,
    loginPage,
  }) => {
    await loginPage.goto('/user');
    await loginPage.login(e2eEnv.userEmail, e2eEnv.userPassword);
    await expect(page).toHaveURL('/user');

    await page.reload();
    await expect(page).toHaveURL('/user');

    await page.goto('/login');
    await expect(page).not.toHaveURL(/\/login/);
  });
});
