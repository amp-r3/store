import { productsApi } from '@/entities/product';
import { orderApi } from '@/entities/order';
import { reviewApi } from '@/entities/review';
import { cartApi, CartData } from '@/entities/cart';
import { wishlistApi } from '@/entities/wishlist';
import {
  Product,
  ProductSize,
  ProductParams,
  ProductsResponse,
  Categories,
} from '@/entities/product';
import { DeliveryMethod, PaymentMethod, ShippingAddress } from '@/entities/order';
import { ProductReview } from '@/entities/review';
import { AppStore as TestStore } from '@/app/store';

// Seeds RTK Query's cache directly via `upsertQueryData` so a component's
// `useXQuery(arg)` finds data already present and never fires its `queryFn`
// — no network, no act()-wrapped async wait, no reliance on the Supabase
// stub for data these tests don't care about faking end to end.

export const seedSizes = (store: TestStore, productId: number, sizes: ProductSize[]) =>
  store.dispatch(productsApi.util.upsertQueryData('getSizes', productId, sizes));

export const seedProductArray = (store: TestStore, ids: number[], products: Product[]) =>
  store.dispatch(productsApi.util.upsertQueryData('getProductArrayById', ids, products));

export const seedDeliveryMethods = (store: TestStore, methods: DeliveryMethod[]) =>
  store.dispatch(orderApi.util.upsertQueryData('getDeliveryMethods', undefined, methods));

export const seedMyReviews = (store: TestStore, reviews: ProductReview[]) =>
  store.dispatch(reviewApi.util.upsertQueryData('getMyReviews', undefined, reviews));

export const seedCart = (store: TestStore, cart: Record<number, CartData>) =>
  store.dispatch(cartApi.util.upsertQueryData('getCart', undefined, cart));

export const seedPaymentMethods = (store: TestStore, methods: PaymentMethod[]) =>
  store.dispatch(orderApi.util.upsertQueryData('getPaymentMethods', undefined, methods));

export const seedProducts = (store: TestStore, params: ProductParams, response: ProductsResponse) =>
  store.dispatch(productsApi.util.upsertQueryData('getProducts', params, response));

export const seedCategories = (store: TestStore, categories: Categories) =>
  store.dispatch(productsApi.util.upsertQueryData('getCategories', undefined, categories));

export const seedProductById = (store: TestStore, id: number, product: Product) =>
  store.dispatch(productsApi.util.upsertQueryData('getProductById', id, product));

export const seedWishlist = (store: TestStore, wishlist: Record<number, boolean>) =>
  store.dispatch(wishlistApi.util.upsertQueryData('getWishlist', undefined, wishlist));

export const seedLastShippingAddress = (store: TestStore, address: ShippingAddress | null) =>
  store.dispatch(orderApi.util.upsertQueryData('getLastShippingAddress', undefined, address));
