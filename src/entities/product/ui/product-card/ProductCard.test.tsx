import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders, createTestStore } from '@test/renderWithProviders';
import { seedSizes } from '@test/seedApi';
import { makeProduct } from '@test/fixtures';
import { ProductCard } from './ProductCard';

const renderCard = async (overrides: Parameters<typeof makeProduct>[0] = {}) => {
  const product = makeProduct(overrides);
  const store = createTestStore();
  await seedSizes(store, product.id, []);
  renderWithProviders(<ProductCard product={product} />, { store });
  return product;
};

describe('ProductCard', () => {
  it('renders a very long title in full', async () => {
    const longTitle =
      'An Extremely Long Product Title That Keeps Going And Going To Test Wrapping Behavior';
    await renderCard({ title: longTitle });

    expect(screen.getByText(longTitle)).toBeInTheDocument();
  });

  it('shows only the current price when there is no discount', async () => {
    await renderCard({ basePrice: 80, price: 80, discountPercentage: 0 });

    expect(screen.getByText('$80.00')).toBeInTheDocument();
  });

  it('shows both the old and current price, plus a discount badge, when discounted', async () => {
    await renderCard({ basePrice: 100, price: 75, discountPercentage: 25 });

    expect(screen.getByText('$100.00')).toBeInTheDocument();
    expect(screen.getByText('$75.00')).toBeInTheDocument();
    expect(screen.getByText('-25%')).toBeInTheDocument();
  });

  it('uses the singular form for exactly one review', async () => {
    await renderCard({ reviewsCount: 1 });
    expect(screen.getByText(/1 review$/)).toBeInTheDocument();
  });

  it('uses the plural form for any other review count', async () => {
    await renderCard({ reviewsCount: 2 });
    expect(screen.getByText(/2 reviews$/)).toBeInTheDocument();
  });

  it('links to the product detail page and labels the product image', async () => {
    const product = await renderCard({ id: 42, title: 'Denim Jacket' });

    expect(screen.getByRole('link', { name: 'View details for Denim Jacket' })).toHaveAttribute(
      'href',
      `/product/${product.id}`,
    );
    expect(screen.getByRole('img', { name: 'Denim Jacket' })).toBeInTheDocument();
  });
});
