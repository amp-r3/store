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

export interface RecordedChainCall {
  table: string;
  method: string;
  args: unknown[];
}

const createChain = (
  result: SupabaseTableResult,
  onCall?: (method: string, args: unknown[]) => void,
): PromiseLike<SupabaseTableResult> => {
  const chain: object = new Proxy(() => {}, {
    apply: () => chain,
    get: (_target, prop) => {
      if (prop === 'then') {
        return (resolve: (value: SupabaseTableResult) => void) =>
          resolve({ data: result.data ?? null, error: result.error ?? null });
      }
      return (...args: unknown[]) => {
        onCall?.(String(prop), args);
        return chain;
      };
    },
  });
  return chain as PromiseLike<SupabaseTableResult>;
};

interface SupabaseSession {
  user: unknown;
  access_token: string;
}

type AuthChangeCallback = (event: string, session: SupabaseSession | null) => void;

interface SupabaseStubAuth {
  getUser: () => Promise<{ data: { user: unknown }; error: unknown }>;
  getSession: () => Promise<{ data: { session: SupabaseSession | null }; error: unknown }>;
  signInWithPassword: (...args: unknown[]) => Promise<{ data: unknown; error: unknown }>;
  signInWithOAuth: (...args: unknown[]) => Promise<{ data: unknown; error: unknown }>;
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
const TEST_ACCESS_TOKEN = 'test-access-token';

export interface SupabaseStub {
  from: ReturnType<typeof vi.fn>;
  rpc: ReturnType<typeof vi.fn>;
  auth: {
    getUser: ReturnType<typeof vi.fn>;
    getSession: ReturnType<typeof vi.fn>;
    signInWithPassword: ReturnType<typeof vi.fn>;
    signInWithOAuth: ReturnType<typeof vi.fn>;
    signUp: ReturnType<typeof vi.fn>;
    updateUser: ReturnType<typeof vi.fn>;
    signOut: ReturnType<typeof vi.fn>;
    onAuthStateChange: ReturnType<typeof vi.fn>;
  };
  __setTable(table: string, result: SupabaseTableResult): void;
  __setRpc(result: SupabaseTableResult): void;
  /** Invokes every callback registered via `auth.onAuthStateChange`, the way
   * the real client would when a session change fires — this is what drives
   * `useSessionSync`/`useLocalDataMerge` in a test. */
  __emitAuthChange(event: string, session: SupabaseSession | null): void;
  /** Every `.from(table)...` chain call made so far, in order — since
   * `createChain`'s Proxy otherwise discards call arguments, this is the only
   * way to assert *what payload* a `.upsert(...)`/`.insert(...)` etc. received.
   * Omit `table` for calls across every table. */
  __getCalls(table?: string): RecordedChainCall[];
  /** Restores table/rpc results to the config the stub was created with and
   * clears recorded calls + registered auth-change callbacks. `vi.mock`'s
   * factory runs once per test file, so the stub instance — and anything a
   * prior test configured on it via `__setTable`/`__setRpc` — otherwise
   * leaks into every later test in that file. Call in `beforeEach` whenever
   * a file uses `__setTable` with an error and later asserts a success path,
   * or uses `__getCalls`. */
  __reset(): void;
}

export function createSupabaseStub(config: SupabaseStubConfig = {}): SupabaseStub {
  let tables: Record<string, SupabaseTableResult> = { ...(config.tables ?? {}) };
  let rpcResult: SupabaseTableResult = { data: null, error: null };
  let authChangeCallbacks: AuthChangeCallback[] = [];
  let recordedCalls: RecordedChainCall[] = [];

  return {
    from: vi.fn((table: string) =>
      createChain(tables[table] ?? { data: null, error: null }, (method, args) => {
        recordedCalls.push({ table, method, args });
      }),
    ),
    rpc: vi.fn(() => createChain(rpcResult)),
    auth: {
      getUser: vi.fn(
        config.auth?.getUser ??
          (() => Promise.resolve({ data: { user: AUTHENTICATED_USER }, error: null })),
      ),
      getSession: vi.fn(
        config.auth?.getSession ??
          (() =>
            Promise.resolve({
              data: {
                session: { user: AUTHENTICATED_USER, access_token: TEST_ACCESS_TOKEN },
              },
              error: null,
            })),
      ),
      signInWithPassword: vi.fn(
        config.auth?.signInWithPassword ?? (() => Promise.resolve({ data: {}, error: null })),
      ),
      signInWithOAuth: vi.fn(
        config.auth?.signInWithOAuth ?? (() => Promise.resolve({ data: {}, error: null })),
      ),
      signUp: vi.fn(config.auth?.signUp ?? (() => Promise.resolve({ data: {}, error: null }))),
      updateUser: vi.fn(
        config.auth?.updateUser ?? (() => Promise.resolve({ data: {}, error: null })),
      ),
      signOut: vi.fn(config.auth?.signOut ?? (() => Promise.resolve({ error: null }))),
      onAuthStateChange: vi.fn((callback: AuthChangeCallback) => {
        authChangeCallbacks.push(callback);
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      }),
    },
    // Reconfigures a table's result after the stub has already been
    // created — needed because `vi.mock`'s factory runs once per test file,
    // but different tests in the same file often need different responses
    // from the same mocked client (e.g. a happy-path list vs. an error).
    __setTable(table: string, result: SupabaseTableResult) {
      tables[table] = result;
    },
    // Reconfigures the result every `supabase.rpc(...)` call resolves with —
    // there's only ever one in-flight RPC per test, unlike tables, so a
    // single mutable slot (not a per-name map) is enough.
    __setRpc(result: SupabaseTableResult) {
      rpcResult = result;
    },
    __emitAuthChange(event: string, session: SupabaseSession | null) {
      authChangeCallbacks.forEach((callback) => callback(event, session));
    },
    __getCalls(table?: string) {
      return table ? recordedCalls.filter((call) => call.table === table) : [...recordedCalls];
    },
    __reset() {
      tables = { ...(config.tables ?? {}) };
      rpcResult = { data: null, error: null };
      authChangeCallbacks = [];
      recordedCalls = [];
    },
  };
}
