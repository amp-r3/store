import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddToCartButton } from './AddToCartButton';

const noop = () => {};

describe('AddToCartButton', () => {
  it('defaults to "Add to Cart" and calls onAddToCart when clicked', async () => {
    const user = userEvent.setup();
    const onAddToCart = vi.fn();
    render(
      <AddToCartButton
        quantity={0}
        onAddToCart={onAddToCart}
        onIncrement={noop}
        onDecrement={noop}
      />,
    );

    const addButton = screen.getByRole('button', { name: 'Add to Cart' });
    await user.click(addButton);

    expect(onAddToCart).toHaveBeenCalledTimes(1);
  });

  it('uses a caller-supplied buttonText', () => {
    render(
      <AddToCartButton
        quantity={0}
        onAddToCart={noop}
        onIncrement={noop}
        onDecrement={noop}
        buttonText="Select Size"
      />,
    );
    expect(screen.getByRole('button', { name: 'Select Size' })).toBeInTheDocument();
  });

  it('shows outOfStockText only when out of stock and no units are in the cart yet', () => {
    render(
      <AddToCartButton
        quantity={0}
        onAddToCart={noop}
        onIncrement={noop}
        onDecrement={noop}
        inStock={false}
        outOfStockText="Sold Out"
      />,
    );
    expect(screen.getByRole('button', { name: 'Sold Out' })).toBeDisabled();
  });

  it('disables the add button when isMaxReached at zero quantity', () => {
    render(
      <AddToCartButton
        quantity={0}
        onAddToCart={noop}
        onIncrement={noop}
        onDecrement={noop}
        isMaxReached
      />,
    );
    expect(screen.getByRole('button', { name: 'Add to Cart' })).toBeDisabled();
  });

  it('fires onIncrement/onDecrement from the counter once a quantity is active', async () => {
    const user = userEvent.setup();
    const onIncrement = vi.fn();
    const onDecrement = vi.fn();
    render(
      <AddToCartButton
        quantity={2}
        onAddToCart={noop}
        onIncrement={onIncrement}
        onDecrement={onDecrement}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Add more' }));
    expect(onIncrement).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Remove from cart' }));
    expect(onDecrement).toHaveBeenCalledTimes(1);

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it("disables the counter's increment button once isMaxReached", () => {
    render(
      <AddToCartButton
        quantity={2}
        onAddToCart={noop}
        onIncrement={noop}
        onDecrement={noop}
        isMaxReached
      />,
    );
    expect(screen.getByRole('button', { name: 'Add more' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Remove from cart' })).not.toBeDisabled();
  });

  it('disables every control while isLoading', () => {
    render(
      <AddToCartButton
        quantity={1}
        onAddToCart={noop}
        onIncrement={noop}
        onDecrement={noop}
        isLoading
      />,
    );
    expect(screen.getByRole('button', { name: 'Add to Cart' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Add more' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Remove from cart' })).toBeDisabled();
  });
});
