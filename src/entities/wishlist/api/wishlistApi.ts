import { supabase, baseApi } from "@/shared/api";
import { getErrorMessage } from "@/shared/lib";

export const wishlistApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getWishlist: builder.query<Record<number, boolean>, void>({
      async queryFn() {
        try {
          const { data: { user }, error: authError } = await supabase.auth.getUser();
          if (authError || !user) {
            return { error: { status: 401, data: 'Not authorized' } };
          }

          const { data, error } = await supabase
            .from('wishlist_items')
            .select('product_id')
            .eq('user_id', user.id);

          if (error) {
            return { error: { status: error.code, data: error.message } };
          }

          const formattedWishlist: Record<number, boolean> = {};

          if (data) {
            data.forEach((item) => {
              formattedWishlist[item.product_id] = true;
            });
          }

          return { data: formattedWishlist };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', data: getErrorMessage(error) } };
        }
      },
      providesTags: ['Wishlist']
    }),

    toggleWishlist: builder.mutation<null, { productId: number; isInWishlist: boolean; priceAtAdd?: number }>({
      queryFn: async ({ productId, isInWishlist, priceAtAdd }) => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const user = session?.user;
          if (!user) {
            return { error: { status: 'CUSTOM_ERROR', data: 'Not authorized' } };
          }

          let dbError = null;

          if (isInWishlist) {
            const { error } = await supabase
              .from('wishlist_items')
              .delete()
              .match({ user_id: user.id, product_id: productId });
            dbError = error;
          } else {
            const { error } = await supabase
              .from('wishlist_items')
              .upsert(
                { user_id: user.id, product_id: productId, price_at_add: priceAtAdd },
                { onConflict: 'user_id, product_id' }
              );
            dbError = error;
          }

          if (dbError) {
            return { error: { status: dbError.code, data: dbError.message } };
          }

          return { data: null };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', data: getErrorMessage(error) } };
        }
      },

      async onQueryStarted({ productId, isInWishlist }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          wishlistApi.util.updateQueryData('getWishlist', undefined as never, (draft) => {
            if (isInWishlist) {
              delete draft[productId];
            } else {
              draft[productId] = true;
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      }
    }),

    syncWishlist: builder.mutation<null, Record<number, boolean>>({
      queryFn: async (localWishlist) => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const user = session?.user;

          if (!user) {
            return { error: { status: 'CUSTOM_ERROR', data: 'The user is not authorized' } };
          }

          const itemsToSync = Object.entries(localWishlist).map(([productId]) => ({
            user_id: user.id,
            product_id: Number(productId)
          }));

          if (itemsToSync.length === 0) {
            return { data: null };
          }

          const { error } = await supabase
            .from('wishlist_items')
            .upsert(itemsToSync, { onConflict: 'user_id, product_id' });

          if (error) {
            return { error: { status: error.code, data: error.message } };
          }

          return { data: null };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', data: getErrorMessage(error) } };
        }
      },
      invalidatesTags: ['Wishlist']
    }),
  })
});

export const {
  useGetWishlistQuery,
  useToggleWishlistMutation,
  useSyncWishlistMutation
} = wishlistApi;