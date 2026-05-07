import { RootState } from "@/app/store";
import { supabase } from "@/supabase";
import { CartData, CartItem } from "@/types/products";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";

type QuantityAction = 'inc' | 'dec';

const calcQty = (current: number, action: QuantityAction) =>
  action === 'inc' ? current + 1 : Math.max(0, current - 1);

export const cartApi = createApi({
  reducerPath: 'cartApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Cart'],
  endpoints: (builder) => ({

    getCart: builder.query<Record<number, CartData>, void>({
      async queryFn() {
        try {
          const { data, error } = await supabase
            .from('cart_items')
            .select('product_id, quantity');

          if (error) {
            return { error: { status: error.code, data: error.message } };
          }

          const formattedCart: Record<number, CartData> = {};

          if (data) {
            data.forEach((item) => {
              formattedCart[item.product_id] = { quantity: item.quantity };
            });
          }

          return { data: formattedCart };
        } catch (error: any) {
          return { error: { status: 'CUSTOM_ERROR', data: error.message } };
        }
      },
      providesTags: ['Cart']
    }),

    upsertCartItem: builder.mutation<null, { productId: number; action: QuantityAction }>({
      queryFn: async ({ productId, action }, { getState }) => {
        try {
          const { data: { user }, error: authError } = await supabase.auth.getUser();
          if (authError || !user) {
            return { error: { status: 'CUSTOM_ERROR', data: 'The user is not authorized' } };
          }

          const state = getState() as RootState;
          const cartData = cartApi.endpoints.getCart.select()(state).data;

          const targetQty = cartData?.[productId]?.quantity;

          if (action === 'dec' && !targetQty) {
            const { error } = await supabase
              .from('cart_items')
              .delete()
              .match({ user_id: user.id, product_id: productId });

            if (error) return { error: { status: error.code, data: error.message } };
            return { data: null };
          }

          const finalQty = targetQty || 1;

          const { error } = await supabase
            .from('cart_items')
            .upsert(
              { user_id: user.id, product_id: productId, quantity: finalQty },
              { onConflict: 'user_id, product_id' }
            );

          if (error) {
            return { error: { status: error.code, data: error.message } };
          }

          return { data: null };
        } catch (error: any) {
          return { error: { status: 'CUSTOM_ERROR', data: error.message } };
        }
      },

      async onQueryStarted({ productId, action }, { dispatch, queryFulfilled, getState }) {
        const state = getState() as unknown as RootState;
        const cartData = cartApi.endpoints.getCart.select()(state).data;
        const currentQty = cartData?.[productId]?.quantity ?? 0;

        if (action === 'dec' && currentQty <= 1) {
          const patchResult = dispatch(
            cartApi.util.updateQueryData('getCart', undefined as never, (draft: CartItem) => {
              delete draft[productId];
            })
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
          cartApi.util.updateQueryData('getCart', undefined as never, (draft: CartItem) => {
            draft[productId] = { quantity: newQuantity };
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      }
    }),

    deleteCartItem: builder.mutation<null, number>({
      queryFn: async (productId) => {
        try {
          const { data: { user } } = await supabase.auth.getUser();

          if (!user) {
            return { error: { status: 'CUSTOM_ERROR', data: 'The user is not authorized' } };
          }

          const { error } = await supabase
            .from('cart_items')
            .delete()
            .match({ user_id: user.id, product_id: productId });

          if (error) {
            return { error: { status: error.code, data: error.message } };
          }

          return { data: null };
        } catch (error: any) {
          return { error: { status: error.code, data: error.message } };
        }
      },

      async onQueryStarted(productId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          cartApi.util.updateQueryData('getCart', undefined as never, (draft) => {
            delete draft[productId];
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      }
    }),

    syncCart: builder.mutation<null, Record<number, CartData>>({
      queryFn: async (localCart) => {
        try {
          const { data: { user } } = await supabase.auth.getUser();

          if (!user) {
            return { error: { status: 'CUSTOM_ERROR', data: 'The user is not authorized' } };
          }

          const itemsToSync = Object.entries(localCart).map(([productId, data]) => ({
            user_id: user.id,
            product_id: Number(productId),
            quantity: data.quantity
          }));

          if (itemsToSync.length === 0) {
            return { data: null };
          }

          const { error } = await supabase
            .from('cart_items')
            .upsert(itemsToSync, { onConflict: 'user_id, product_id' });

          if (error) {
            return { error: { status: error.code, data: error.message } };
          }

          return { data: null };
        } catch (error: any) {
          return { error: { status: 'CUSTOM_ERROR', data: error.message } };
        }
      },
      invalidatesTags: ['Cart']
    }),

    clearCart: builder.mutation<null, void>({
      queryFn: async (_, { getState }) => {
        try {
          const { data: { user }, error: authError } = await supabase.auth.getUser();

          if (authError || !user) {
            return { error: { status: 'CUSTOM_ERROR', data: 'The user is not authorized' } };
          }

          const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', user.id);

          if (error) {
            return { error: { status: error.code, data: error.message } };
          }

          return { data: null };
        } catch (error: any) {
          return { error: { status: 'CUSTOM_ERROR', data: error.message } };
        }
      },

      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          cartApi.util.updateQueryData('getCart', undefined as never, (draft) => {
            Object.keys(draft).forEach((key) => delete draft[key as any]);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      }
    }),
  })
});

export const {
  useGetCartQuery,
  useUpsertCartItemMutation,
  useDeleteCartItemMutation,
  useClearCartMutation,
  useSyncCartMutation,
} = cartApi;