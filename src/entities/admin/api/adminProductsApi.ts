import { supabase, baseApi } from '@/shared/api';
import type { Database } from '@/shared/api';
import { revalidateProduct, revalidateStorefront } from '@/shared/api/revalidate';

export interface AdminCategory {
  id: number;
  name: string;
  slug: string;
  productsCount: number;
}

export interface AdminProductSize {
  id: number;
  value: string;
  stock: number;
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
  /** false/undefined = only active products (also totalCount/pagination scope). */
  includeArchived?: boolean;
}

export interface PaginatedAdminProducts {
  items: AdminProductListItem[];
  totalCount: number;
}

// Raw-table detail for the edit form — products_view has neither category_id
// nor is_archived (the view exists for the customer catalog and deliberately
// excludes both), and archived products must still be editable here.
export interface AdminProductDetail {
  id: number;
  title: string;
  description: string | null;
  categoryId: number | null;
  basePrice: number;
  discountPercentage: number;
  /** Server-computed generated column — read-only, shown for the price-drop check. */
  price: number;
  thumbnail: string | null;
  images: string[];
  tags: string[];
  brand: string | null;
  sku: string | null;
  weight: number | null;
  dimensions: { width: number; height: number; depth: number };
  warrantyInformation: string | null;
  shippingInformation: string | null;
  availabilityStatus: string | null;
  returnPolicy: string | null;
  minimumOrderQuantity: number | null;
  meta: { barcode: string; qrCode: string };
  isArchived: boolean;
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
      queryFn: async ({ page, limit, search, includeArchived }) => {
        const from = (page - 1) * limit;
        const to = page * limit - 1;

        let query = supabase
          .from('products')
          .select('id, title, thumbnail, sku, base_price, price, discount_percentage, rating, is_archived, categories(name)', { count: 'exact' });

        if (!includeArchived) {
          query = query.eq('is_archived', false);
        }

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

    getAdminProductById: builder.query<AdminProductDetail, number>({
      queryFn: async (id) => {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          return { error: { status: 400, data: error.message } };
        }

        const row = data as Database['public']['Tables']['products']['Row'];
        // dimensions/meta are jsonb with no shape guarantee from the DB —
        // documented cast at the query boundary, same as elsewhere in the app.
        const dimensions = (row.dimensions as { width?: number; height?: number; depth?: number } | null) ?? {};
        const meta = (row.meta as { barcode?: string; qrCode?: string } | null) ?? {};

        return {
          data: {
            id: row.id,
            title: row.title,
            description: row.description,
            categoryId: row.category_id,
            basePrice: Number(row.base_price),
            discountPercentage: Number(row.discount_percentage ?? 0),
            price: Number(row.price ?? 0),
            thumbnail: row.thumbnail,
            images: row.images ?? [],
            tags: row.tags ?? [],
            brand: row.brand,
            sku: row.sku,
            weight: row.weight !== null ? Number(row.weight) : null,
            dimensions: {
              width: dimensions.width ?? 0,
              height: dimensions.height ?? 0,
              depth: dimensions.depth ?? 0,
            },
            warrantyInformation: row.warranty_information,
            shippingInformation: row.shipping_information,
            availabilityStatus: row.availability_status,
            returnPolicy: row.return_policy,
            minimumOrderQuantity: row.minimum_order_quantity,
            meta: { barcode: meta.barcode ?? '', qrCode: meta.qrCode ?? '' },
            isArchived: row.is_archived,
          },
        };
      },
      providesTags: (_result, _error, id) => [{ type: 'Product', id }],
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
      async onQueryStarted(_payload, { queryFulfilled }) {
        try {
          await queryFulfilled;
          await revalidateStorefront();
        } catch {
          // queryFulfilled already rejected on the RPC error, or the
          // Server Action itself threw — either way there's nothing to
          // roll back here (no optimistic patch), so just swallow it.
        }
      },
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
      async onQueryStarted({ id }, { queryFulfilled }) {
        try {
          await queryFulfilled;
          await revalidateProduct(id);
        } catch {
          // See createAdminProduct's onQueryStarted.
        }
      },
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
      async onQueryStarted({ id }, { queryFulfilled }) {
        try {
          await queryFulfilled;
          // An archive/restore both adds to and removes from the storefront
          // listing, not just this one product page.
          await Promise.all([revalidateProduct(id), revalidateStorefront()]);
        } catch {
          // See createAdminProduct's onQueryStarted.
        }
      },
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
      async onQueryStarted(_payload, { queryFulfilled }) {
        try {
          await queryFulfilled;
          await revalidateStorefront();
        } catch {
          // See createAdminProduct's onQueryStarted.
        }
      },
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
      async onQueryStarted(_id, { queryFulfilled }) {
        try {
          await queryFulfilled;
          await revalidateStorefront();
        } catch {
          // See createAdminProduct's onQueryStarted.
        }
      },
    }),

    // Raw table, not entities/product's getSizes: that one has no admin-owned
    // cache entry to patch optimistically, and this needs to work for
    // archived products too. Own cache entry (keyed by productId) is what
    // makes the optimistic update below possible.
    getAdminProductSizes: builder.query<AdminProductSize[], number>({
      queryFn: async (productId) => {
        const { data, error } = await supabase
          .from('product_sizes')
          .select('id, value, stock')
          .eq('product_id', productId)
          .order('value', { ascending: true });

        if (error) {
          return { error: { status: 400, data: error.message } };
        }

        return { data: data ?? [] };
      },
      providesTags: (_result, _error, productId) => [{ type: 'Size', id: productId }],
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
      // Bare 'Size' alongside the id-scoped tag: admin_low_stock's query
      // provides only the bare tag (it isn't scoped to one product), which an
      // id-scoped invalidation doesn't reach — RTK Query only matches a bare
      // tag back from a more specific one, never the other way around.
      invalidatesTags: (_result, _error, { productId }) => [{ type: 'Size', id: productId }, 'Size'],
      async onQueryStarted({ productId }, { queryFulfilled }) {
        try {
          await queryFulfilled;
          await revalidateProduct(productId);
        } catch {
          // See createAdminProduct's onQueryStarted.
        }
      },
    }),

    deleteAdminProductSize: builder.mutation<null, { sizeId: number; productId: number }>({
      queryFn: async ({ sizeId }) => {
        const { error } = await supabase.rpc('admin_delete_product_size', { p_size_id: sizeId });

        if (error) {
          return { error: { status: 400, data: error.message } };
        }

        return { data: null };
      },
      invalidatesTags: (_result, _error, { productId }) => [{ type: 'Size', id: productId }, 'Size'],
      async onQueryStarted({ productId }, { queryFulfilled }) {
        try {
          await queryFulfilled;
          await revalidateProduct(productId);
        } catch {
          // See createAdminProduct's onQueryStarted.
        }
      },
    }),

    // Own getAdminProductSizes cache entry (keyed by productId) makes this
    // optimistic, unlike the plain invalidation cart/wishlist used to be the
    // only precedent for — same onQueryStarted + updateQueryData +
    // patchResult.undo() shape as cartApi's quantity updates.
    setAdminStock: builder.mutation<null, { sizeId: number; productId: number; stock: number }>({
      queryFn: async ({ sizeId, stock }) => {
        const { error } = await supabase.rpc('admin_set_stock', { p_size_id: sizeId, p_stock: stock });

        if (error) {
          return { error: { status: 400, data: error.message } };
        }

        return { data: null };
      },
      async onQueryStarted({ sizeId, productId, stock }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          adminProductsApi.util.updateQueryData('getAdminProductSizes', productId, (draft) => {
            const size = draft.find((item) => item.id === sizeId);
            if (size) size.stock = stock;
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
          return;
        }

        try {
          await revalidateProduct(productId);
        } catch {
          // The stock update itself already succeeded — a failed
          // revalidation shouldn't roll back the optimistic patch.
        }
      },
      invalidatesTags: (_result, _error, { productId }) => [{ type: 'Size', id: productId }, 'Size'],
    }),
  }),
});

export const {
  useGetAdminProductsQuery,
  useGetAdminProductByIdQuery,
  useCreateAdminProductMutation,
  useUpdateAdminProductMutation,
  useArchiveAdminProductMutation,
  useGetAdminCategoriesQuery,
  useUpsertAdminCategoryMutation,
  useDeleteAdminCategoryMutation,
  useGetAdminProductSizesQuery,
  useUpsertAdminProductSizeMutation,
  useDeleteAdminProductSizeMutation,
  useSetAdminStockMutation,
} = adminProductsApi;
