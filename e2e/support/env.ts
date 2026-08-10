/** Fails fast with a clear message instead of a confusing mid-test auth
 * error when a required var is missing (see AGENTS.md's E2E section). */
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required env var ${name} for the E2E suite. ` +
        `See AGENTS.md's "E2E Tests" section for the full list.`,
    );
  }
  return value;
}

export const e2eEnv = {
  get supabaseUrl() {
    return required('NEXT_PUBLIC_SUPABASE_URL');
  },
  get supabaseAnonKey() {
    return required('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  },
  get supabaseServiceRoleKey() {
    return required('SUPABASE_SERVICE_ROLE_KEY');
  },
  get userEmail() {
    return required('E2E_USER_EMAIL');
  },
  get userPassword() {
    return required('E2E_USER_PASSWORD');
  },
};
