import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartFooter } from './CartFooter';

const baseProps = {
  subtotal: 100,
  total: 90,
  discountAmount: 0,
  discountPercent: 0,
  shippingProgress: 50,
  remainingForFreeShipping: 20,
  isLoading: false,
  isFetching: false,
  isUpdating: false,
};

describe('CartFooter', () => {
  it('renders subtotal and total via formatPrice', () => {
    render(<CartFooter {...baseProps} />);
    expect(screen.getByText('$100.00')).toBeInTheDocument();
    expect(screen.getByTestId('cart-total')).toHaveTextContent('$90.00');
  });

  it('shows the discount row only when discountAmount is positive', () => {
    const { rerender } = render(<CartFooter {...baseProps} />);
    expect(screen.queryByText(/Discount/)).not.toBeInTheDocument();

    rerender(<CartFooter {...baseProps} discountAmount={10} discountPercent={10} />);
    expect(screen.getByText('Discount (10%)')).toBeInTheDocument();
    expect(screen.getByText('-$10.00')).toBeInTheDocument();
  });

  it('prompts for more spend when short of free shipping, and celebrates once unlocked', () => {
    const { rerender } = render(<CartFooter {...baseProps} remainingForFreeShipping={20} />);
    expect(screen.getByText(/for free shipping/)).toBeInTheDocument();
    expect(screen.getByText('$20.00')).toBeInTheDocument();

    rerender(<CartFooter {...baseProps} remainingForFreeShipping={0} />);
    expect(screen.getByText('Free shipping unlocked!')).toBeInTheDocument();
  });

  it('calls onCheckout when Proceed to Checkout is clicked', async () => {
    const user = userEvent.setup();
    const onCheckout = vi.fn();
    render(<CartFooter {...baseProps} onCheckout={onCheckout} />);

    await user.click(screen.getByRole('button', { name: /Proceed to Checkout/ }));

    expect(onCheckout).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['isLoading', { isLoading: true }],
    ['isFetching', { isFetching: true }],
    ['isUpdating', { isUpdating: true }],
  ])('disables the checkout button and drops its accessible name while %s', (_label, flag) => {
    render(<CartFooter {...baseProps} {...flag} />);

    expect(screen.queryByRole('button', { name: /Proceed to Checkout/ })).not.toBeInTheDocument();
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});
