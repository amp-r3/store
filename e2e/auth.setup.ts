import { test as setup, expect } from '@playwright/test';
import { createSupabaseAdminClient } from './support/supabaseAdmin';
import { e2eEnv } from './support/env';
import { LoginPage } from './pages/LoginPage';

const STORAGE_STATE = 'e2e/.auth/user.json';

/** Ensures the dedicated E2E test user exists, then logs in through the
 * real UI so the session lands in cookies the way `proxy.ts` expects (a
 * `supabase.auth.setSession()` shortcut would only populate localStorage —
 * see AGENTS.md's E2E section). Runs once per suite via the `setup`
 * project; `chromium-auth` depends on it and reuses the saved storage
 * state. */
setup('authenticate e2e user', async ({ page }) => {
  const admin = createSupabaseAdminClient();
  const email = e2eEnv.userEmail;
  const password = e2eEnv.userPassword;

  const { data: existing } = await admin.auth.admin.listUsers();
  const user = existing.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  if (!user) {
    const { error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) throw new Error(`Failed to create e2e user: ${error.message}`);
  } else {
    // Leftover cart from a previous run that crashed before checkout —
    // start every run from an empty guest-merge-free state.
    await admin.from('cart_items').delete().eq('user_id', user.id);
  }

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(email, password);

  await expect(page).toHaveURL('/');
  await page.context().storageState({ path: STORAGE_STATE });
});
