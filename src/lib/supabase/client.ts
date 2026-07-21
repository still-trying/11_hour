/**
 * Supabase Client Stub
 *
 * This project uses Firebase as its primary backend. Several service files
 * (habits.ts, notifications.ts) and hooks were written with Supabase calls.
 * This stub provides a type-compatible interface so the code compiles.
 *
 * TODO: Replace with real Supabase client if adding Supabase,
 *       or migrate the services to use Firebase Firestore instead.
 */

type FilterBuilder = {
  select: (columns?: string) => FilterBuilder;
  insert: (data: unknown) => FilterBuilder;
  update: (data: unknown) => FilterBuilder;
  delete: () => FilterBuilder;
  eq: (column: string, value: unknown) => FilterBuilder;
  neq: (column: string, value: unknown) => FilterBuilder;
  gte: (column: string, value: unknown) => FilterBuilder;
  lte: (column: string, value: unknown) => FilterBuilder;
  order: (column: string, options?: { ascending?: boolean }) => FilterBuilder;
  limit: (count: number) => FilterBuilder;
  single: () => FilterBuilder;
  then: (resolve: (result: { data: unknown; error: unknown }) => void) => void;
  data: unknown;
  error: unknown;
};

function createFilterBuilder(): FilterBuilder {
  const builder: FilterBuilder = {
    select: () => builder,
    insert: () => builder,
    update: () => builder,
    delete: () => builder,
    eq: () => builder,
    neq: () => builder,
    gte: () => builder,
    lte: () => builder,
    order: () => builder,
    limit: () => builder,
    single: () => builder,
    then: (resolve) => resolve({ data: [], error: null }),
    data: [],
    error: null,
  };

  // Make the builder thenable so await works
  Object.defineProperty(builder, 'then', {
    value: (resolve: (result: { data: unknown; error: unknown }) => void) => {
      return Promise.resolve({ data: [], error: null }).then(resolve);
    },
    enumerable: false,
  });

  return builder;
}

type RealtimeChannel = {
  on: (event: string, config: unknown, callback: (...args: unknown[]) => void) => RealtimeChannel;
  subscribe: (callback?: (status: string) => void) => RealtimeChannel;
};

interface SupabaseClient {
  from: (table: string) => FilterBuilder;
  auth: {
    getUser: () => Promise<{ data: { user: unknown }; error: unknown }>;
    signOut: () => Promise<{ error: unknown }>;
  };
  channel: (name: string) => RealtimeChannel;
  removeChannel: (channel: RealtimeChannel) => void;
}

export function createClient(): SupabaseClient {
  console.warn(
    '⚠️ [Supabase Stub] Using stub client. Connect a real Supabase instance or migrate to Firebase.'
  );

  return {
    from: (_table: string) => createFilterBuilder(),
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signOut: async () => ({ error: null }),
    },
    channel: (_name: string) => {
      const channel: RealtimeChannel = {
        on: (_event, _config, _callback) => channel,
        subscribe: (_callback) => channel,
      };
      return channel;
    },
    removeChannel: () => {},
  };
}
