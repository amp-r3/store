import { describe, it, expect } from 'vitest';
import { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createTestStore, AppStore } from '@test/renderWithProviders';
import { seedProductArray } from '@test/seedApi';
import { makeProduct } from '@test/fixtures';
import { OrderItem } from '@/entities/order/model/types';
import { useEnrichedOrderItems } from './useEnrichedOrderItems';

const wrapperFor = (store: AppStore) => {
  function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  }
  return Wrapper;
};

const orderItem = (overrides: Partial<OrderItem> = {}): OrderItem => ({
  id: 'item-1',
  orderId: 'order-1',
  productId: 10,
  sizeId: 1,
  quantity: 1,
  priceAtPurchase: 100,
  createdAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

const render = async (orderItems: OrderItem[], products: ReturnType<typeof makeProduct>[]) => {
  const store = createTestStore();
  const ids = orderItems.map((item) => item.productId);
  await seedProductArray(store, ids, products);
  return renderHook(() => useEnrichedOrderItems(orderItems), { wrapper: wrapperFor(store) });
};

describe('useEnrichedOrderItems', () => {
  it('joins order items with fetched product snapshots', async () => {
    const product = makeProduct({ id: 10, title: 'Sneaker' });
    const { result } = await render([orderItem({ productId: 10 })], [product]);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.items).toEqual([
      {
        ...orderItem({ productId: 10 }),
        product: {
          id: product.id,
          title: product.title,
          thumbnail: product.thumbnail,
          category: product.category,
        },
      },
    ]);
  });

  it('drops a line whose product no longer resolves', async () => {
    const { result } = await render([orderItem({ productId: 10 })], []);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.items).toEqual([]);
  });

  it('returns an empty list for no order items, without firing a request', async () => {
    const store = createTestStore();
    const { result } = renderHook(() => useEnrichedOrderItems([]), { wrapper: wrapperFor(store) });

    expect(result.current.items).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });
});
