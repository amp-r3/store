import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders, createTestStore } from '@test/renderWithProviders';
import { seedSizes } from '@test/seedApi';
import { makeCartItemDetails, makeSize } from '@test/fixtures';
import { CartItem } from './CartItem';

describe('CartItem', () => {
  it('renders the line total, unit price only above quantity 1, and the discount badge', async () => {
    const product = makeCartItemDetails({
      id: 1,
      title: 'Test Jacket',
      price: 50,
      quantity: 3,
      discountPercentage: 20,
    });
    const size = makeSize({ id: product.sizeId, value: 'M', stock: 10 });
    const store = createTestStore();
    await seedSizes(store, product.id, [size]);
    renderWithProviders(<CartItem product={product} />, { store });

    expect(screen.getByText('$150.00')).toBeInTheDocument();
    expect(screen.getByText('$50.00 / pc.')).toBeInTheDocument();
    expect(screen.getByText('-20%')).toBeInTheDocument();
  });

  it('hides unit price and discount badge for a single, non-discounted unit', async () => {
    const product = makeCartItemDetails({ id: 2, price: 30, quantity: 1, discountPercentage: 0 });
    const size = makeSize({ id: product.sizeId, stock: 10 });
    const store = createTestStore();
    await seedSizes(store, product.id, [size]);
    renderWithProviders(<CartItem product={product} />, { store });

    expect(screen.queryByText(/\/ pc\./)).not.toBeInTheDocument();
    expect(screen.queryByText(/^-\d+%$/)).not.toBeInTheDocument();
  });

  it('calls onDecrease, onIncrease and onRemove with (sizeId, productId[, extra])', async () => {
    const product = makeCartItemDetails({ id: 3, sizeId: 33, quantity: 2 });
    const size = makeSize({ id: 33, stock: 10 });
    const store = createTestStore();
    await seedSizes(store, product.id, [size]);
    const onDecrease = vi.fn();
    const onIncrease = vi.fn();
    const onRemove = vi.fn();
    const { user } = renderWithProviders(
      <CartItem
        product={product}
        onDecrease={onDecrease}
        onIncrease={onIncrease}
        onRemove={onRemove}
      />,
      { store },
    );

    await user.click(screen.getByRole('button', { name: 'Decrease quantity' }));
    expect(onDecrease).toHaveBeenCalledWith(33, 3);

    await user.click(screen.getByRole('button', { name: 'Increase quantity' }));
    expect(onIncrease).toHaveBeenCalledWith(33, 3, 10);

    await user.click(screen.getByRole('button', { name: 'Remove item' }));
    expect(onRemove).toHaveBeenCalledWith(33, 3, 2);
  });

  it('disables Increase and shows a Max hint once quantity reaches the seeded stock', async () => {
    const product = makeCartItemDetails({ id: 4, sizeId: 44, quantity: 5 });
    const size = makeSize({ id: 44, stock: 5 });
    const store = createTestStore();
    await seedSizes(store, product.id, [size]);
    renderWithProviders(<CartItem product={product} />, { store });

    expect(screen.getByRole('button', { name: 'Increase quantity' })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('Max');
  });

  it('does not show the Max hint while stock remains', async () => {
    const product = makeCartItemDetails({ id: 5, sizeId: 55, quantity: 1 });
    const size = makeSize({ id: 55, stock: 5 });
    const store = createTestStore();
    await seedSizes(store, product.id, [size]);
    renderWithProviders(<CartItem product={product} />, { store });

    expect(screen.getByRole('button', { name: 'Increase quantity' })).not.toBeDisabled();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('hides all quantity/remove controls in readonly mode', async () => {
    const product = makeCartItemDetails({ id: 6 });
    const store = createTestStore();
    await seedSizes(store, product.id, []);
    renderWithProviders(<CartItem product={product} readonly />, { store });

    expect(screen.queryByRole('button', { name: 'Decrease quantity' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Increase quantity' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Remove item' })).not.toBeInTheDocument();
  });

  it('links to the product page and labels the product image', async () => {
    const product = makeCartItemDetails({ id: 7, title: 'Wool Scarf' });
    const store = createTestStore();
    await seedSizes(store, product.id, []);
    renderWithProviders(<CartItem product={product} />, { store });

    expect(screen.getByRole('link', { name: 'View details for Wool Scarf' })).toHaveAttribute(
      'href',
      '/product/7',
    );
    expect(screen.getByRole('img', { name: 'Wool Scarf' })).toBeInTheDocument();
  });
});
