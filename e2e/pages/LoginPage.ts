import { expect, type Page } from '@playwright/test';

/** `/login` is a two-step form: `AuthProviderList` renders first, and the
 * email/password fields only appear after `Continue with Email` is clicked
 * (see AGENTS.md's E2E section — the most common source of a naive login
 * test failing here). */
export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto(from?: string) {
    const url = from ? `/login?from=${encodeURIComponent(from)}` : '/login';
    await this.page.goto(url);
  }

  async continueWithEmail() {
    await this.page.getByRole('button', { name: 'Continue with Email' }).click();
  }

  async fillCredentials(email: string, password: string) {
    await this.page.getByLabel('Email').fill(email);
    // Not `getByLabel('Password')`: Playwright's label matching is a
    // case-insensitive substring by default, and the "Show password"/"Hide
    // password" toggle button's aria-label also contains "password" — that
    // makes the query resolve to 2 elements (strict mode violation). `name`
    // is set by react-hook-form's `register('password')` and stays stable
    // across the show/hide toggle, unlike `type`.
    await this.page.locator('input[name="password"]').fill(password);
  }

  async submit() {
    await this.page.getByRole('button', { name: 'Log in' }).click();
  }

  async login(email: string, password: string) {
    await this.continueWithEmail();
    await this.fillCredentials(email, password);
    await this.submit();
  }

  async expectInvalidCredentialsError() {
    await expect(
      this.page.getByRole('alert').filter({ hasText: 'Invalid email or password' }),
    ).toBeVisible();
  }
}
