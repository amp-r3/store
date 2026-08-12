import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptyCart } from './EmptyCart';

describe('EmptyCart', () => {
  it('renders the empty-cart message and heading', () => {
    render(<EmptyCart onStartShopping={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Your cart is empty' })).toBeInTheDocument();
  });

  it('calls onStartShopping when the primary CTA is clicked', async () => {
    const user = userEvent.setup();
    const onStartShopping = vi.fn();
    render(<EmptyCart onStartShopping={onStartShopping} />);

    await user.click(screen.getByRole('button', { name: 'Start shopping' }));

    expect(onStartShopping).toHaveBeenCalledTimes(1);
  });

  it('passes the discovery tag id to onDiscoverClick when a chip is clicked', async () => {
    const user = userEvent.setup();
    const onDiscoverClick = vi.fn();
    render(<EmptyCart onStartShopping={vi.fn()} onDiscoverClick={onDiscoverClick} />);

    await user.click(screen.getByRole('button', { name: 'New Drops' }));

    expect(onDiscoverClick).toHaveBeenCalledWith('new-drops');
  });

  it('does not throw when a chip is clicked without an onDiscoverClick handler', async () => {
    const user = userEvent.setup();
    render(<EmptyCart onStartShopping={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Trending' }));
  });
});
