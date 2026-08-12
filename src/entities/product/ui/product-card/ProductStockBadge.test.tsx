import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductStockBadge } from './ProductStockBadge';

describe('ProductStockBadge', () => {
  it('renders nothing while loading, regardless of stock', () => {
    const { container } = render(
      <ProductStockBadge sizes={[{ id: 1, value: 'M', stock: 0 }]} isLoading />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows Out of Stock when the summed stock across sizes is zero', () => {
    render(
      <ProductStockBadge
        sizes={[
          { id: 1, value: 'S', stock: 0 },
          { id: 2, value: 'M', stock: 0 },
        ]}
        isLoading={false}
      />,
    );
    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
  });

  it('shows a low-stock hint when the summed stock is 10 or fewer', () => {
    render(
      <ProductStockBadge
        sizes={[
          { id: 1, value: 'S', stock: 4 },
          { id: 2, value: 'M', stock: 6 },
        ]}
        isLoading={false}
      />,
    );
    expect(screen.getByText('There are a few left')).toBeInTheDocument();
  });

  it('renders nothing once stock is comfortably above the low-stock threshold', () => {
    const { container } = render(
      <ProductStockBadge sizes={[{ id: 1, value: 'M', stock: 50 }]} isLoading={false} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('treats an empty size list as out of stock', () => {
    render(<ProductStockBadge sizes={[]} isLoading={false} />);
    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
  });
});
