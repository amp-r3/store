import { supabase, baseApi } from '@/shared/api';
import { CartData } from '@/entities/cart/model/types';
import { getErrorMessage } from '@/shared/lib';

type QuantityAction = 'inc' | 'dec';

const calcQty = (current: number, action: QuantityAction) =>
  action === 'inc' ? current + 1 : Math.max(0, current - 1);

const upsertCartRows = (userId: string, cart: Record<number, CartData>) => {
  const rows = Object.entries(cart).map(([sizeId, data]) => ({
    user_id: userId,
    size_id: Number(sizeId),
    quantity: data.quantity,
  }));

  return supabase.from('cart_items').upsert(rows, { onConflict: 'user_id, size_id' });
};

export const cartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query<Record<number, CartData>, void>({
      async queryFn() {
        try {
          const {
            data: { user },
            error: authError,
          } = await supabase.auth.getUser();
          if (authError || !user) {
            return { error: { status: 'CUSTOM_ERROR', data: 'The user is not authorized' } };
          }

          const { data, error } = await supabase
            .from('cart_items')
            .select(
              `
              size_id, 
              quantity,
              product_sizes (
                product_id
              )
            `,
            )
            .eq('user_id', user.id);

          if (error) {
            return { error: { status: error.code, data: error.message } };
          }

          const formattedCart: Record<number, CartData> = {};

          if (data) {
            data.forEach((item) => {
              const productSizes = item.product_sizes;
              const productId = Array.isArray(productSizes)
                ? productSizes[0]?.product_id
                : productSizes?.product_id;

              formattedCart[item.size_id] = {
                quantity: item.quantity,
                productId: productId as number,
              };
            });
          }

          return { data: formattedCart };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', data: getErrorMessage(error) } };
        }
      },
      providesTags: ['Cart'],
    }),

    upsertCartItem: builder.mutation<
      null,
      { sizeId: number; productId: number; action: QuantityAction }
    >({
      queryFn: async ({ sizeId, action }) => {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          const user = session?.user;
          if (!user) {
            return { error: { status: 'CUSTOM_ERROR', data: 'Not authorized' } };
          }

          const { data: currentItem } = await supabase
            .from('cart_items')
            .select('quantity')
            .match({ user_id: user.id, size_id: sizeId })
            .maybeSingle();

          const targetQty = currentItem?.quantity || 0;

          if (action === 'dec' && targetQty <= 1) {
            const { error } = await supabase
              .from('cart_items')
              .delete()
              .match({ user_id: user.id, size_id: sizeId });

            if (error) return { error: { status: error.code, data: error.message } };
            return { data: null };
          }

          const finalQty = targetQty ? calcQty(targetQty, action) : action === 'inc' ? 1 : 0;

          if (finalQty === 0) {
            return { data: null };
          }

          const { error } = await supabase
            .from('cart_items')
            .upsert(
              { user_id: user.id, size_id: sizeId, quantity: finalQty },
              { onConflict: 'user_id, size_id' },
            );

          if (error) {
            return { error: { status: error.code, data: error.message } };
          }

          return { data: null };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', data: getErrorMessage(error) } };
        }
      },

      async onQueryStarted({ sizeId, productId, action }, { dispatch, queryFulfilled, getState }) {
        const state = getState();
        const cartData = cartApi.endpoints.getCart.select()(state).data;
        const currentQty = cartData?.[sizeId]?.quantity ?? 0;

        if (action === 'dec' && currentQty <= 1) {
          const patchResult = dispatch(
            cartApi.util.updateQueryData(
              'getCart',
              undefined as never,
              (draft: Record<number, CartData>) => {
                delete draft[sizeId];
              },
            ),
          );
          try {
            await queryFulfilled;
          } catch {
            patchResult.undo();
          }
          return;
        }

        const newQuantity = calcQty(currentQty, action);

        const patchResult = dispatch(
          cartApi.util.updateQueryData('getCart', undefined as never, (draft) => {
            draft[sizeId] = { quantity: newQuantity, productId };
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    deleteCartItem: builder.mutation<null, number>({
      queryFn: async (sizeId) => {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          const user = session?.user;
          if (!user) {
            return { error: { status: 'CUSTOM_ERROR', data: 'Not authorized' } };
          }

          const { error } = await supabase
            .from('cart_items')
            .delete()
            .match({ user_id: user.id, size_id: sizeId });

          if (error) {
            return { error: { status: error.code, data: error.message } };
          }

          return { data: null };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', data: getErrorMessage(error) } };
        }
      },

      async onQueryStarted(sizeId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          cartApi.util.updateQueryData('getCart', undefined as never, (draft) => {
            delete draft[sizeId];
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    syncCart: builder.mutation<null, Record<number, CartData>>({
      queryFn: async (localCart) => {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          const user = session?.user;
          if (!user) {
            return { error: { status: 'CUSTOM_ERROR', data: 'Not authorized' } };
          }

          if (Object.keys(localCart).length === 0) {
            return { data: null };
          }

          const { error } = await upsertCartRows(user.id, localCart);

          if (error) {
            return { error: { status: error.code, data: error.message } };
          }

          return { data: null };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', data: getErrorMessage(error) } };
        }
      },
      invalidatesTags: ['Cart'],
    }),

    // Restores an exact quantity for a single line (unlike upsertCartItem,
    // which only steps by ±1) — used to undo a removal/decrease-to-zero.
    restoreCartItem: builder.mutation<
      null,
      { sizeId: number; productId: number; quantity: number }
    >({
      queryFn: async ({ sizeId, quantity }) => {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          const user = session?.user;
          if (!user) {
            return { error: { status: 'CUSTOM_ERROR', data: 'Not authorized' } };
          }

          const { error } = await supabase
            .from('cart_items')
            .upsert(
              { user_id: user.id, size_id: sizeId, quantity },
              { onConflict: 'user_id, size_id' },
            );

          if (error) {
            return { error: { status: error.code, data: error.message } };
          }

          return { data: null };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', data: getErrorMessage(error) } };
        }
      },

      async onQueryStarted({ sizeId, productId, quantity }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          cartApi.util.updateQueryData('getCart', undefined as never, (draft) => {
            draft[sizeId] = { quantity, productId };
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // Bulk re-upsert of a whole cart snapshot — used to undo "Clear cart".
    restoreCart: builder.mutation<null, Record<number, CartData>>({
      queryFn: async (snapshot) => {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          const user = session?.user;
          if (!user) {
            return { error: { status: 'CUSTOM_ERROR', data: 'Not authorized' } };
          }

          if (Object.keys(snapshot).length === 0) {
            return { data: null };
          }

          const { error } = await upsertCartRows(user.id, snapshot);

          if (error) {
            return { error: { status: error.code, data: error.message } };
          }

          return { data: null };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', data: getErrorMessage(error) } };
        }
      },

      async onQueryStarted(snapshot, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          cartApi.util.updateQueryData('getCart', undefined as never, (draft) => {
            Object.assign(draft, snapshot);
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    clearCart: builder.mutation<null, void>({
      queryFn: async () => {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          const user = session?.user;

          if (!user) {
            return { error: { status: 'CUSTOM_ERROR', data: 'Not authorized' } };
          }

          const { error } = await supabase.from('cart_items').delete().eq('user_id', user.id);

          if (error) {
            return { error: { status: error.code, data: error.message } };
          }

          return { data: null };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', data: getErrorMessage(error) } };
        }
      },

      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          cartApi.util.updateQueryData('getCart', undefined as never, (draft) => {
            Object.keys(draft).forEach((key) => delete draft[Number(key)]);
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const {
  useGetCartQuery,
  useUpsertCartItemMutation,
  useDeleteCartItemMutation,
  useClearCartMutation,
  useSyncCartMutation,
  useRestoreCartItemMutation,
  useRestoreCartMutation,
} = cartApi;
