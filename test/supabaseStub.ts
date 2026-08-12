import { vi } from 'vitest';

// Every RTK Query endpoint in this repo is a `queryFn` calling either
// `supabase.auth.*` directly, or a `fetch*(supabase, ...)` helper
// (src/entities/*/api/queries.ts) chaining off `supabase.from(table)...` —
// e.g. `.from('products_view').select('*').eq('id', id).single()`. A single
// mock of the browser client (@/shared/api/supabase/client) therefore
// controls every network path a component test can hit.
//
// `createChain` is a thenable Proxy: any property access returns a function
// that returns the same proxy, so an arbitrarily long
// `.select().eq().order().single()` chain resolves without enumerating each
// method. `then` is the one property that breaks the chain and resolves the
// configured `{ data, error }`.

export interface SupabaseTableResult {
  data?: unknown;
  error?: unknown;
}

const createChain = (result: SupabaseTableResult): PromiseLike<SupabaseTableResult> => {
  const chain: object = new Proxy(() => {}, {
    apply: () => chain,
    get: (_target, prop) => {
      if (prop === 'then') {
        return (resolve: (value: SupabaseTableResult) => void) =>
          resolve({ data: result.data ?? null, error: result.error ?? null });
      }
      return () => chain;
    },
  });
  return chain as PromiseLike<SupabaseTableResult>;
};

interface SupabaseStubAuth {
  getUser: () => Promise<{ data: { user: unknown }; error: unknown }>;
  signInWithPassword: (...args: unknown[]) => Promise<{ data: unknown; error: unknown }>;
  signUp: (...args: unknown[]) => Promise<{ data: unknown; error: unknown }>;
  updateUser: (...args: unknown[]) => Promise<{ data: unknown; error: unknown }>;
  signOut: (...args: unknown[]) => Promise<{ error: unknown }>;
}

export interface SupabaseStubConfig {
  /** Keyed by table name — e.g. `{ products_view: { data: [...] } }`. */
  tables?: Record<string, SupabaseTableResult>;
  auth?: Partial<SupabaseStubAuth>;
}

const AUTHENTICATED_USER = { id: 'test-user-id', email: 'test@example.com' };

export interface SupabaseStub {
  from: ReturnType<typeof vi.fn>;
  rpc: ReturnType<typeof vi.fn>;
  auth: {
    getUser: ReturnType<typeof vi.fn>;
    signInWithPassword: ReturnType<typeof vi.fn>;
    signUp: ReturnType<typeof vi.fn>;
    updateUser: ReturnType<typeof vi.fn>;
    signOut: ReturnType<typeof vi.fn>;
  };
  __setTable(table: string, result: SupabaseTableResult): void;
}

export function createSupabaseStub(config: SupabaseStubConfig = {}): SupabaseStub {
  const tables: Record<string, SupabaseTableResult> = { ...(config.tables ?? {}) };

  return {
    from: vi.fn((table: string) => createChain(tables[table] ?? { data: null, error: null })),
    rpc: vi.fn(() => createChain({ data: null, error: null })),
    auth: {
      getUser: vi.fn(
        config.auth?.getUser ??
          (() => Promise.resolve({ data: { user: AUTHENTICATED_USER }, error: null })),
      ),
      signInWithPassword: vi.fn(
        config.auth?.signInWithPassword ?? (() => Promise.resolve({ data: {}, error: null })),
      ),
      signUp: vi.fn(config.auth?.signUp ?? (() => Promise.resolve({ data: {}, error: null }))),
      updateUser: vi.fn(
        config.auth?.updateUser ?? (() => Promise.resolve({ data: {}, error: null })),
      ),
      signOut: vi.fn(config.auth?.signOut ?? (() => Promise.resolve({ error: null }))),
    },
    // Reconfigures a table's result after the stub has already been
    // created — needed because `vi.mock`'s factory runs once per test file,
    // but different tests in the same file often need different responses
    // from the same mocked client (e.g. a happy-path list vs. an error).
    __setTable(table: string, result: SupabaseTableResult) {
      tables[table] = result;
    },
  };
}
