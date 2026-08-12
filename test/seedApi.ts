import { productsApi } from '@/entities/product';
import { orderApi } from '@/entities/order';
import { reviewApi } from '@/entities/review';
import { Product, ProductSize } from '@/entities/product';
import { DeliveryMethod } from '@/entities/order';
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
