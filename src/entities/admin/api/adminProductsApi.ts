import { supabase, baseApi } from '@/shared/api';
import type { Database } from '@/shared/api';

export interface AdminCategory {
  id: number;
  name: string;
  slug: string;
  productsCount: number;
}

export interface AdminProductListItem {
  id: number;
  title: string;
  thumbnail: string | null;
  sku: string | null;
  category: string | null;
  basePrice: number;
  price: number;
  discountPercentage: number;
  rating: number;
  isArchived: boolean;
}

export interface AdminProductsQueryArgs {
  page: number;
  limit: number;
  search?: string;
}

export interface PaginatedAdminProducts {
  items: AdminProductListItem[];
  totalCount: number;
}

// Mirrors entities/product's Product shape but in camelCase-in/snake_case-out
// form for the admin_create_product / admin_update_product jsonb payload —
// only the keys present are ever read by the RPC (see the migration), so a
// partial payload on update leaves the rest of the row untouched.
export interface AdminProductPayload {
  title?: string;
  description?: string;
  categoryId?: number | null;
  basePrice?: number;
  discountPercentage?: number;
  thumbnail?: string;
  images?: string[];
  tags?: string[];
  brand?: string;
  sku?: string;
  weight?: number | null;
  dimensions?: { width: number; height: number; depth: number };
  warrantyInformation?: string;
  shippingInformation?: string;
  availabilityStatus?: string;
  returnPolicy?: string;
  minimumOrderQuantity?: number;
  meta?: { barcode?: string; qrCode?: string };
}

export interface CreateAdminProductPayload extends AdminProductPayload {
  title: string;
  basePrice: number;
}

const toRpcPayload = (payload: AdminProductPayload) => ({
  ...(payload.title !== undefined && { title: payload.title }),
  ...(payload.description !== undefined && { description: payload.description }),
  ...(payload.categoryId !== undefined && { category_id: payload.categoryId }),
  ...(payload.basePrice !== undefined && { base_price: payload.basePrice }),
  ...(payload.discountPercentage !== undefined && { discount_percentage: payload.discountPercentage }),
  ...(payload.thumbnail !== undefined && { thumbnail: payload.thumbnail }),
  ...(payload.images !== undefined && { images: payload.images }),
  ...(payload.tags !== undefined && { tags: payload.tags }),
  ...(payload.brand !== undefined && { brand: payload.brand }),
  ...(payload.sku !== undefined && { sku: payload.sku }),
  ...(payload.weight !== undefined && { weight: payload.weight }),
  ...(payload.dimensions !== undefined && { dimensions: payload.dimensions }),
  ...(payload.warrantyInformation !== undefined && { warranty_information: payload.warrantyInformation }),
  ...(payload.shippingInformation !== undefined && { shipping_information: payload.shippingInformation }),
  ...(payload.availabilityStatus !== undefined && { availability_status: payload.availabilityStatus }),
  ...(payload.returnPolicy !== undefined && { return_policy: payload.returnPolicy }),
  ...(payload.minimumOrderQuantity !== undefined && { minimum_order_quantity: payload.minimumOrderQuantity }),
  ...(payload.meta !== undefined && { meta: payload.meta }),
});

export const adminProductsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Reads the raw table, not products_view: the view filters out archived
    // rows on purpose (customer catalog), but the admin list needs to show
    // and un-archive them.
    getAdminProducts: builder.query<PaginatedAdminProducts, AdminProductsQueryArgs>({
      queryFn: async ({ page, limit, search }) => {
        const from = (page - 1) * limit;
        const to = page * limit - 1;

        let query = supabase
          .from('products')
          .select('id, title, thumbnail, sku, base_price, price, discount_percentage, rating, is_archived, categories(name)', { count: 'exact' });

        const trimmedSearch = search?.trim();
        if (trimmedSearch) {
          query = query.ilike('title', `%${trimmedSearch}%`);
        }

        const { data, error, count } = await query
          .order('id', { ascending: true })
          .range(from, to);

        if (error) {
          return { error: { status: 400, data: error.message } };
        }

        const items: AdminProductListItem[] = (data ?? []).map((row) => ({
          id: row.id,
          title: row.title,
          thumbnail: row.thumbnail,
          sku: row.sku,
          category: row.categories?.name ?? null,
          basePrice: Number(row.base_price),
          price: Number(row.price),
          discountPercentage: Number(row.discount_percentage ?? 0),
          rating: Number(row.rating ?? 0),
          isArchived: row.is_archived,
        }));

        return { data: { items, totalCount: count ?? 0 } };
      },
      providesTags: (result) =>
        result
          ? [...result.items.map((item) => ({ type: 'Product' as const, id: item.id })), { type: 'Product', id: 'ADMIN_LIST' }]
          : [{ type: 'Product', id: 'ADMIN_LIST' }],
    }),

    createAdminProduct: builder.mutation<number, CreateAdminProductPayload>({
      queryFn: async (payload) => {
        const { data, error } = await supabase.rpc(
          'admin_create_product',
          // admin_create_product's Args are generic Json server-side; the
          // payload matches what the function reads but jsonb has no index
          // signature to satisfy Json structurally.
          { p_payload: toRpcPayload(payload) } as unknown as Database['public']['Functions']['admin_create_product']['Args']
        );

        if (error) {
          return { error: { status: 400, data: error.message } };
        }

        return { data: data as unknown as number };
      },
      invalidatesTags: [{ type: 'Product', id: 'ADMIN_LIST' }, { type: 'Product', id: 'LIST' }],
    }),

    updateAdminProduct: builder.mutation<null, { id: number; payload: AdminProductPayload }>({
      queryFn: async ({ id, payload }) => {
        const { error } = await supabase.rpc('admin_update_product', {
          p_id: id,
          p_payload: toRpcPayload(payload) as unknown as Database['public']['Functions']['admin_update_product']['Args']['p_payload'],
        });

        if (error) {
          return { error: { status: 400, data: error.message } };
        }

        return { data: null };
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'ADMIN_LIST' },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    archiveAdminProduct: builder.mutation<null, { id: number; archived: boolean }>({
      queryFn: async ({ id, archived }) => {
        const { error } = await supabase.rpc('admin_archive_product', { p_id: id, p_archived: archived });

        if (error) {
          return { error: { status: 400, data: error.message } };
        }

        return { data: null };
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'ADMIN_LIST' },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    getAdminCategories: builder.query<AdminCategory[], void>({
      queryFn: async () => {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, slug, products(count)')
          .order('name', { ascending: true });

        if (error) {
          return { error: { status: 400, data: error.message } };
        }

        // `products(count)` embeds as a single-element aggregate row, not a
        // typed relationship the generated Row type knows about — cast at
        // the boundary same as the other aggregate/Json reads in this file.
        const rows = data as unknown as { id: number; name: string; slug: string; products: { count: number }[] }[];

        return {
          data: rows.map((row) => ({
            id: row.id,
            name: row.name,
            slug: row.slug,
            productsCount: row.products?.[0]?.count ?? 0,
          })),
        };
      },
      providesTags: [{ type: 'Category', id: 'ADMIN_LIST' }],
    }),

    upsertAdminCategory: builder.mutation<number, { id: number | null; name: string; slug: string }>({
      queryFn: async ({ id, name, slug }) => {
        // p_id has no SQL default, so the generator infers a required
        // `number` even though the function accepts and branches on null
        // (create vs. update) — see admin_upsert_category's body.
        const { data, error } = await supabase.rpc(
          'admin_upsert_category',
          { p_id: id, p_name: name, p_slug: slug } as unknown as Database['public']['Functions']['admin_upsert_category']['Args']
        );

        if (error) {
          return { error: { status: 400, data: error.message } };
        }

        return { data: data as unknown as number };
      },
      invalidatesTags: [{ type: 'Category', id: 'ADMIN_LIST' }, { type: 'Category', id: 'LIST' }],
    }),

    deleteAdminCategory: builder.mutation<null, number>({
      queryFn: async (id) => {
        const { error } = await supabase.rpc('admin_delete_category', { p_id: id });

        if (error) {
          return { error: { status: 400, data: error.message } };
        }

        return { data: null };
      },
      invalidatesTags: [{ type: 'Category', id: 'ADMIN_LIST' }, { type: 'Category', id: 'LIST' }, { type: 'Product', id: 'ADMIN_LIST' }],
    }),

    upsertAdminProductSize: builder.mutation<number, { productId: number; value: string; stock: number }>({
      queryFn: async ({ productId, value, stock }) => {
        const { data, error } = await supabase.rpc('admin_upsert_product_size', {
          p_product_id: productId,
          p_value: value,
          p_stock: stock,
        });

        if (error) {
          return { error: { status: 400, data: error.message } };
        }

        return { data: data as unknown as number };
      },
      invalidatesTags: (_result, _error, { productId }) => [{ type: 'Size', id: productId }],
    }),

    deleteAdminProductSize: builder.mutation<null, { sizeId: number; productId: number }>({
      queryFn: async ({ sizeId }) => {
        const { error } = await supabase.rpc('admin_delete_product_size', { p_size_id: sizeId });

        if (error) {
          return { error: { status: 400, data: error.message } };
        }

        return { data: null };
      },
      invalidatesTags: (_result, _error, { productId }) => [{ type: 'Size', id: productId }],
    }),

    // No optimistic update: unlike cart/wishlist (this app's only precedent
    // for onQueryStarted + updateQueryData), there's no admin-owned cache to
    // patch here without a cross-entity import into entities/product's
    // getSizes cache — plain tag invalidation keeps this self-contained, at
    // the cost of one round-trip before the UI reflects the new stock.
    setAdminStock: builder.mutation<null, { sizeId: number; productId: number; stock: number }>({
      queryFn: async ({ sizeId, stock }) => {
        const { error } = await supabase.rpc('admin_set_stock', { p_size_id: sizeId, p_stock: stock });

        if (error) {
          return { error: { status: 400, data: error.message } };
        }

        return { data: null };
      },
      invalidatesTags: (_result, _error, { productId }) => [{ type: 'Size', id: productId }],
    }),
  }),
});

export const {
  useGetAdminProductsQuery,
  useCreateAdminProductMutation,
  useUpdateAdminProductMutation,
  useArchiveAdminProductMutation,
  useGetAdminCategoriesQuery,
  useUpsertAdminCategoryMutation,
  useDeleteAdminCategoryMutation,
  useUpsertAdminProductSizeMutation,
  useDeleteAdminProductSizeMutation,
  useSetAdminStockMutation,
} = adminProductsApi;
