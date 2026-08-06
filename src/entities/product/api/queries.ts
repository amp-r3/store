import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/shared/api';
import { Product, ProductSize } from '../model/types';

export interface Category {
    slug: string;
    name: string;
}
export type Categories = Category[]

export interface ProductParams {
    page?: number;
    sortBy?: string | null;
    order?: string | null;
    search?: string | null;
    category?: string | null;
    limit?: number | null;
    deals?: boolean;
}

export interface ProductsResponse {
    items: Record<number, Product>;
    ids: number[];
    total: number;
}

// Pure Supabase query functions, callable from both the browser (RTK Query's
// queryFn, via `supabase` from shared/api) and the server (RSC, via
// createServerSupabaseClient()) — one source of truth for the actual query
// shape, including the documented products_view nullability casts. They
// throw the raw PostgrestError/Error on failure rather than returning an
// RTKQ-shaped result; productsApi.ts's queryFn wrappers translate that into
// `{ error }`, while RSC callers let it propagate (error.tsx / notFound()).

export async function fetchProducts(db: SupabaseClient<Database>, params: ProductParams): Promise<ProductsResponse> {
    const { page = 1, search, sortBy, order, category, deals } = params;
    const limit = params.limit ?? 12;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = db
        .from('products_view')
        .select('*', { count: 'exact' });

    if (search) {
        query = query.ilike('title', `%${search}%`);
    }

    if (category && category !== 'all') {
        query = query.eq('category', category);
    }

    if (deals) {
        query = query.gt('discountPercentage', 0);
    }

    if (sortBy && order) {
        query = query.order(sortBy, { ascending: order === 'asc' });
    } else if (deals) {
        query = query
            .order('discountPercentage', { ascending: false })
            .order('id', { ascending: true });
    } else {
        query = query.order('id', { ascending: true });
    }

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    // products_view is a Postgres view: PG cannot express NOT NULL for view
    // columns, so every generated column is `| null`. The view's underlying
    // columns are NOT NULL — cast once here.
    const rows = data as unknown as Product[];

    const items = rows.reduce((acc, curr) => {
        acc[curr.id] = curr;
        return acc;
    }, {} as Record<number, Product>);

    const ids = rows.map((product) => product.id);

    return { items, ids, total: count ?? 0 };
}

export async function fetchCategories(db: SupabaseClient<Database>): Promise<Categories> {
    const { data, error } = await db
        .from('categories')
        .select('slug, name');

    if (error) throw error;

    const defaultCategory: Category = {
        slug: 'all',
        name: 'All Products',
    };

    return [defaultCategory, ...(data ?? [])];
}

export async function fetchProductById(db: SupabaseClient<Database>, id: number): Promise<Product> {
    const { data, error } = await db
        .from('products_view')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;

    // products_view is a Postgres view: PG cannot express NOT NULL for view
    // columns, so every generated column is `| null`. The view's underlying
    // columns are NOT NULL — cast once here.
    return data as unknown as Product;
}

export async function fetchProductArrayById(db: SupabaseClient<Database>, ids: number[]): Promise<Product[]> {
    const { data, error } = await db
        .from('products_view')
        .select('*')
        .in('id', ids);

    if (error) throw error;

    // products_view is a Postgres view: PG cannot express NOT NULL for view
    // columns, so every generated column is `| null`. The view's underlying
    // columns are NOT NULL — cast once here.
    return data as unknown as Product[];
}

export async function fetchSizes(db: SupabaseClient<Database>, productId: number): Promise<ProductSize[]> {
    const { data, error } = await db
        .from('product_sizes')
        .select('id, value, stock')
        .eq('product_id', productId)
        .order('id', { ascending: true });

    if (error) throw error;

    return data;
}

export async function fetchDealsProducts(db: SupabaseClient<Database>, params?: { limit?: number }): Promise<Product[]> {
    const limit = params?.limit ?? 12;

    const { data, error } = await db
        .from('products_view')
        .select('*')
        .gt('discountPercentage', 0)
        .order('discountPercentage', { ascending: false })
        .order('id', { ascending: true })
        .limit(limit);

    if (error) throw error;

    // products_view is a Postgres view: PG cannot express NOT NULL for view
    // columns, so every generated column is `| null`. The view's underlying
    // columns are NOT NULL — cast once here.
    return data as unknown as Product[];
}
