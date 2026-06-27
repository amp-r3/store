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
          const { data: { user }, error: authError } = await supabase.auth.getUser();
          if (authError || !user) {
            return { error: { status: 'CUSTOM_ERROR', data: 'The user is not authorized' } };
          }

          const { data, error } = await supabase
            .from('cart_items')
            .select(`
              size_id, 
              quantity,
              product_sizes (
                product_id
              )
            `)
            .eq('user_id', user.id);

          if (error) {
            return { error: { status: error.code, data: error.message } };
          }

          const formattedCart: Record<number, CartData> = {};

          if (data) {
            data.forEach((item: any) => {
              formattedCart[item.size_id] = {
                quantity: item.quantity,
                productId: item.product_sizes?.product_id || item.product_sizes?.[0]?.product_id
              };
            });
          }

          return { data: formattedCart };
        } catch (error: any) {
          return { error: { status: 'CUSTOM_ERROR', data: error.message } };
        }
      },
      providesTags: ['Cart']
    }),

    upsertCartItem: builder.mutation<null, { sizeId: number; productId: number; action: QuantityAction }>({
      queryFn: async ({ sizeId, productId, action }, { getState }) => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
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

          const finalQty = targetQty ? calcQty(targetQty, action) : (action === 'inc' ? 1 : 0);

          if (finalQty === 0) {
            return { data: null };
          }

          const { error } = await supabase
            .from('cart_items')
            .upsert(
              { user_id: user.id, size_id: sizeId, quantity: finalQty },
              { onConflict: 'user_id, size_id' }
            );

          if (error) {
            return { error: { status: error.code, data: error.message } };
          }

          return { data: null };
        } catch (error: any) {
          return { error: { status: 'CUSTOM_ERROR', data: error.message } };
        }
      },

      async onQueryStarted({ sizeId, productId, action }, { dispatch, queryFulfilled, getState }) {
        const state = getState() as unknown as RootState;
        const cartData = cartApi.endpoints.getCart.select()(state).data;
        const currentQty = cartData?.[sizeId]?.quantity ?? 0;

        if (action === 'dec' && currentQty <= 1) {
          const patchResult = dispatch(
            cartApi.util.updateQueryData('getCart', undefined as never, (draft: Record<number, CartData>) => {
              delete draft[sizeId];
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
          cartApi.util.updateQueryData('getCart', undefined as never, (draft) => {
            draft[sizeId] = { quantity: newQuantity, productId };
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
      queryFn: async (sizeId) => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
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
        } catch (error: any) {
          return { error: { status: error.code, data: error.message } };
        }
      },

      async onQueryStarted(sizeId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          cartApi.util.updateQueryData('getCart', undefined as never, (draft) => {
            delete draft[sizeId];
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
          const { data: { session } } = await supabase.auth.getSession();
          const user = session?.user;
          if (!user) {
            return { error: { status: 'CUSTOM_ERROR', data: 'Not authorized' } };
          }

          const itemsToSync = Object.entries(localCart).map(([sizeId, data]) => ({
            user_id: user.id,
            size_id: Number(sizeId),
            quantity: data.quantity
          }));

          if (itemsToSync.length === 0) {
            return { data: null };
          }

          const { error } = await supabase
            .from('cart_items')
            .upsert(itemsToSync, { onConflict: 'user_id, size_id' });

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
      queryFn: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const user = session?.user;

          if (!user) {
            return { error: { status: 'CUSTOM_ERROR', data: 'Not authorized' } };
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