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
// configured `{ data, error, count }`.

export interface SupabaseTableResult {
  data?: unknown;
  error?: unknown;
  /** For `{ count: 'exact', head: true }` queries (getOrderCounts,
   * getUnreadNotificationsCount, fetchReviews/fetchProducts' totalCount). */
  count?: number | null;
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
          resolve({
            data: result.data ?? null,
            error: result.error ?? null,
            count: result.count ?? null,
          });
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

interface RealtimeChannelRegistration {
  channelName: string;
  event: string;
  config: Record<string, unknown>;
  handler: (payload: { new: unknown }) => void;
}

interface ChannelStub {
  on(
    event: string,
    config: Record<string, unknown>,
    handler: (payload: { new: unknown }) => void,
  ): ChannelStub;
  subscribe(): ChannelStub;
}

export interface SupabaseStub {
  from: ReturnType<typeof vi.fn>;
  rpc: ReturnType<typeof vi.fn>;
  functions: {
    invoke: ReturnType<typeof vi.fn>;
  };
  channel: ReturnType<typeof vi.fn>;
  removeChannel: ReturnType<typeof vi.fn>;
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
  /** No name → sets the default every unnamed-lookup `supabase.rpc(...)`
   * call resolves with. With a name, only calls to that RPC function get
   * this result — needed once a flow calls two different RPCs (e.g.
   * `useCheckoutDraft` calling `get_last_purchase_date` and a test also
   * driving `create_order`) and each needs its own response. */
  __setRpc(result: SupabaseTableResult): void;
  __setRpc(name: string, result: SupabaseTableResult): void;
  /** Invokes every callback registered via `auth.onAuthStateChange`, the way
   * the real client would when a session change fires — this is what drives
   * `useSessionSync`/`useLocalDataMerge` in a test. */
  __emitAuthChange(event: string, session: SupabaseSession | null): void;
  /** Invokes every registered realtime `postgres_changes` handler for
   * `table` with `{ new: row }`, the way Supabase's realtime client would
   * on an INSERT. Drives `notificationsRealtime.ts`/`useNotificationsSync`. */
  __emitRealtimeInsert(table: string, row: unknown): void;
  /** Every `supabase.channel(name)...on(event, config, handler)` call made
   * so far — lets a test assert the exact filter string a channel
   * subscribed with (e.g. the `user_id=eq.<id>` cross-user leak guard). */
  __getChannels(): RealtimeChannelRegistration[];
  /** Every `.from(table)...` chain call made so far, in order — since
   * `createChain`'s Proxy otherwise discards call arguments, this is the only
   * way to assert *what payload* a `.upsert(...)`/`.insert(...)` etc. received.
   * RPC calls are recorded too, under the synthetic table name `rpc:<name>`.
   * Omit `table` for calls across every table. */
  __getCalls(table?: string): RecordedChainCall[];
  /** Restores table/rpc results to the config the stub was created with,
   * clears recorded calls + registered auth-change/realtime callbacks, and
   * resets every `auth.*` mock's call history AND any per-test
   * `mockResolvedValueOnce`/`mockResolvedValue` override back to its
   * config-provided (or built-in) default implementation. `vi.mock`'s
   * factory runs once per test file, so the stub instance — and anything a
   * prior test configured on it via `__setTable`/`__setRpc`/the auth mocks —
   * otherwise leaks into every later test in that file. Call in `beforeEach`
   * whenever a file uses `__setTable`/`__setRpc` with an error and later
   * asserts a success path, overrides an `auth.*` mock, or uses
   * `__getCalls`. */
  __reset(): void;
}

export function createSupabaseStub(config: SupabaseStubConfig = {}): SupabaseStub {
  let tables: Record<string, SupabaseTableResult> = { ...(config.tables ?? {}) };
  let rpcResult: SupabaseTableResult = { data: null, error: null };
  let rpcResultsByName: Record<string, SupabaseTableResult> = {};
  let authChangeCallbacks: AuthChangeCallback[] = [];
  let recordedCalls: RecordedChainCall[] = [];
  let realtimeChannels: RealtimeChannelRegistration[] = [];

  const authDefaults: { [K in keyof SupabaseStubAuth]: SupabaseStubAuth[K] } = {
    getUser:
      config.auth?.getUser ??
      (() => Promise.resolve({ data: { user: AUTHENTICATED_USER }, error: null })),
    getSession:
      config.auth?.getSession ??
      (() =>
        Promise.resolve({
          data: { session: { user: AUTHENTICATED_USER, access_token: TEST_ACCESS_TOKEN } },
          error: null,
        })),
    signInWithPassword:
      config.auth?.signInWithPassword ?? (() => Promise.resolve({ data: {}, error: null })),
    signInWithOAuth:
      config.auth?.signInWithOAuth ?? (() => Promise.resolve({ data: {}, error: null })),
    signUp: config.auth?.signUp ?? (() => Promise.resolve({ data: {}, error: null })),
    updateUser: config.auth?.updateUser ?? (() => Promise.resolve({ data: {}, error: null })),
    signOut: config.auth?.signOut ?? (() => Promise.resolve({ error: null })),
  };

  const auth = {
    getUser: vi.fn(authDefaults.getUser),
    getSession: vi.fn(authDefaults.getSession),
    signInWithPassword: vi.fn(authDefaults.signInWithPassword),
    signInWithOAuth: vi.fn(authDefaults.signInWithOAuth),
    signUp: vi.fn(authDefaults.signUp),
    updateUser: vi.fn(authDefaults.updateUser),
    signOut: vi.fn(authDefaults.signOut),
    onAuthStateChange: vi.fn((callback: AuthChangeCallback) => {
      authChangeCallbacks.push(callback);
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    }),
  };

  return {
    from: vi.fn((table: string) =>
      createChain(tables[table] ?? { data: null, error: null }, (method, args) => {
        recordedCalls.push({ table, method, args });
      }),
    ),
    rpc: vi.fn((name: string, args?: unknown) => {
      recordedCalls.push({ table: `rpc:${name}`, method: 'rpc', args: [args] });
      return createChain(rpcResultsByName[name] ?? rpcResult);
    }),
    functions: {
      invoke: vi.fn(() => Promise.resolve({ data: null, error: null })),
    },
    channel: vi.fn((channelName: string) => {
      const channelStub: ChannelStub = {
        on(event, channelConfig, handler) {
          realtimeChannels.push({ channelName, event, config: channelConfig, handler });
          return channelStub;
        },
        subscribe() {
          return channelStub;
        },
      };
      return channelStub;
    }),
    removeChannel: vi.fn(),
    auth,
    // Reconfigures a table's result after the stub has already been
    // created — needed because `vi.mock`'s factory runs once per test file,
    // but different tests in the same file often need different responses
    // from the same mocked client (e.g. a happy-path list vs. an error).
    __setTable(table: string, result: SupabaseTableResult) {
      tables[table] = result;
    },
    __setRpc(nameOrResult: string | SupabaseTableResult, maybeResult?: SupabaseTableResult) {
      if (typeof nameOrResult === 'string') {
        rpcResultsByName[nameOrResult] = maybeResult ?? { data: null, error: null };
      } else {
        rpcResult = nameOrResult;
      }
    },
    __emitAuthChange(event: string, session: SupabaseSession | null) {
      authChangeCallbacks.forEach((callback) => callback(event, session));
    },
    __emitRealtimeInsert(table: string, row: unknown) {
      realtimeChannels
        .filter((registration) => registration.config.table === table)
        .forEach((registration) => registration.handler({ new: row }));
    },
    __getChannels() {
      return [...realtimeChannels];
    },
    __getCalls(table?: string) {
      return table ? recordedCalls.filter((call) => call.table === table) : [...recordedCalls];
    },
    __reset() {
      tables = { ...(config.tables ?? {}) };
      rpcResult = { data: null, error: null };
      rpcResultsByName = {};
      authChangeCallbacks = [];
      recordedCalls = [];
      realtimeChannels = [];
      auth.getUser.mockReset();
      auth.getUser.mockImplementation(authDefaults.getUser);
      auth.getSession.mockReset();
      auth.getSession.mockImplementation(authDefaults.getSession);
      auth.signInWithPassword.mockReset();
      auth.signInWithPassword.mockImplementation(authDefaults.signInWithPassword);
      auth.signInWithOAuth.mockReset();
      auth.signInWithOAuth.mockImplementation(authDefaults.signInWithOAuth);
      auth.signUp.mockReset();
      auth.signUp.mockImplementation(authDefaults.signUp);
      auth.updateUser.mockReset();
      auth.updateUser.mockImplementation(authDefaults.updateUser);
      auth.signOut.mockReset();
      auth.signOut.mockImplementation(authDefaults.signOut);
    },
  };
}
