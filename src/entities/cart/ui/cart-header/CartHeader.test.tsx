import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartHeader } from './CartHeader';

describe('CartHeader', () => {
  it('hides the Clear cart button when the cart is empty', () => {
    render(<CartHeader totalQuantity={0} onClose={vi.fn()} onClearCart={vi.fn()} />);
    expect(screen.queryByRole('button', { name: 'Clear cart' })).not.toBeInTheDocument();
  });

  it('shows Clear cart once the cart has items and calls onClearCart when clicked', async () => {
    const user = userEvent.setup();
    const onClearCart = vi.fn();
    render(<CartHeader totalQuantity={3} onClose={vi.fn()} onClearCart={onClearCart} />);

    const clearButton = screen.getByRole('button', { name: 'Clear cart' });
    await user.click(clearButton);

    expect(onClearCart).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Close cart is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<CartHeader totalQuantity={0} onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'Close cart' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('exposes the item count to assistive tech via visually hidden text', () => {
    render(<CartHeader totalQuantity={5} onClose={vi.fn()} />);
    expect(screen.getByText('5 items in cart')).toBeInTheDocument();
  });
});
