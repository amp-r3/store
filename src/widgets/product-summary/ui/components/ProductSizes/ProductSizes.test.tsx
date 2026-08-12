import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductSizes } from './ProductSizes';

const sizes = [
  { id: 1, value: 'S', stock: 5 },
  { id: 2, value: 'M', stock: 0 },
  { id: 3, value: 'L', stock: 3 },
];

describe('ProductSizes', () => {
  it('renders the size list under an accessible name', () => {
    render(<ProductSizes sizes={sizes} activeSizeId={null} onSizeSelect={vi.fn()} />);
    expect(screen.getByRole('list', { name: 'Select product size' })).toBeInTheDocument();
  });

  it('marks the active size as pressed', () => {
    render(<ProductSizes sizes={sizes} activeSizeId={1} onSizeSelect={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Size S' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Size L' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('disables an out-of-stock size and names it accordingly', () => {
    render(<ProductSizes sizes={sizes} activeSizeId={null} onSizeSelect={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Size M, out of stock' })).toBeDisabled();
  });

  it('calls onSizeSelect with the clicked size id', async () => {
    const user = userEvent.setup();
    const onSizeSelect = vi.fn();
    render(<ProductSizes sizes={sizes} activeSizeId={null} onSizeSelect={onSizeSelect} />);

    await user.click(screen.getByRole('button', { name: 'Size L' }));

    expect(onSizeSelect).toHaveBeenCalledWith(3);
  });

  it('renders nothing for an empty size list', () => {
    const { container } = render(
      <ProductSizes sizes={[]} activeSizeId={null} onSizeSelect={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing and auto-selects a lone "One Size" option', () => {
    const onSizeSelect = vi.fn();
    const { container } = render(
      <ProductSizes
        sizes={[{ id: 9, value: 'One Size', stock: 10 }]}
        activeSizeId={null}
        onSizeSelect={onSizeSelect}
      />,
    );

    expect(container).toBeEmptyDOMElement();
    expect(onSizeSelect).toHaveBeenCalledWith(9);
  });
});
