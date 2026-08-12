import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useCheckoutContext } from '../../model/CheckoutContext';
import { CheckoutStepActions } from './CheckoutStepActions';

vi.mock('../../model/CheckoutContext', () => ({
  useCheckoutContext: vi.fn(),
}));

const mockedUseCheckoutContext = vi.mocked(useCheckoutContext);

const setContext = (overrides: Partial<ReturnType<typeof useCheckoutContext>> = {}) => {
  mockedUseCheckoutContext.mockReturnValue({
    step: 'contacts',
    stepIndex: 0,
    isLastStep: false,
    isSubmitting: false,
    goNext: vi.fn().mockResolvedValue(undefined),
    goToStep: vi.fn(),
    orderTotals: { finalTotalPrice: 0 },
    ...overrides,
  } as ReturnType<typeof useCheckoutContext>);
};

describe('CheckoutStepActions', () => {
  it('labels the CTA per step', () => {
    setContext({ step: 'contacts', stepIndex: 0, isLastStep: false });
    const { rerender } = render(<CheckoutStepActions />);
    expect(screen.getByRole('button', { name: 'Continue to Delivery' })).toBeInTheDocument();

    setContext({ step: 'delivery', stepIndex: 1, isLastStep: false });
    rerender(<CheckoutStepActions />);
    expect(screen.getByRole('button', { name: 'Continue to Payment' })).toBeInTheDocument();

    setContext({ step: 'payment', stepIndex: 2, isLastStep: true });
    rerender(<CheckoutStepActions />);
    expect(screen.getByRole('button', { name: 'Place Order' })).toBeInTheDocument();
  });

  it('renders a submit button wired to the checkout form only on the last step', () => {
    setContext({ step: 'contacts', stepIndex: 0, isLastStep: false });
    const { rerender } = render(<CheckoutStepActions />);
    let cta = screen.getByRole('button', { name: 'Continue to Delivery' });
    expect(cta).toHaveAttribute('type', 'button');
    expect(cta).not.toHaveAttribute('form');

    setContext({ step: 'payment', stepIndex: 2, isLastStep: true });
    rerender(<CheckoutStepActions />);
    cta = screen.getByRole('button', { name: 'Place Order' });
    expect(cta).toHaveAttribute('type', 'submit');
    expect(cta).toHaveAttribute('form', 'checkout-form');
  });

  it('calls goNext when the non-last-step CTA is clicked', async () => {
    const goNext = vi.fn().mockResolvedValue(undefined);
    setContext({ goNext });
    const user = userEvent.setup();
    render(<CheckoutStepActions />);

    await user.click(screen.getByRole('button', { name: 'Continue to Delivery' }));

    expect(goNext).toHaveBeenCalledTimes(1);
  });

  it('calls goToStep with the previous step when Back is clicked', async () => {
    const goToStep = vi.fn();
    setContext({ step: 'delivery', stepIndex: 1, isLastStep: false, goToStep });
    const user = userEvent.setup();
    render(<CheckoutStepActions />);

    await user.click(screen.getByRole('button', { name: 'Back' }));

    expect(goToStep).toHaveBeenCalledWith('contacts');
  });

  it('does not render Back on the first step', () => {
    setContext({ step: 'contacts', stepIndex: 0 });
    render(<CheckoutStepActions />);
    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument();
  });

  it('disables the CTA and preserves its accessible name while busy (isSubmitting)', () => {
    setContext({ step: 'payment', stepIndex: 2, isLastStep: true, isSubmitting: true });
    render(<CheckoutStepActions />);

    const cta = screen.getByRole('button', { name: 'Place Order' });
    expect(cta).toBeDisabled();
    expect(cta).toHaveAttribute('aria-busy', 'true');
  });

  it('guards against a double-click firing goNext twice before the first call settles', async () => {
    let resolveGoNext: () => void = () => {};
    const goNext = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveGoNext = resolve;
        }),
    );
    setContext({ goNext });
    const user = userEvent.setup();
    render(<CheckoutStepActions />);

    const cta = screen.getByRole('button', { name: 'Continue to Delivery' });
    await user.click(cta);
    await user.click(cta);

    expect(goNext).toHaveBeenCalledTimes(1);
    resolveGoNext();
  });

  it('prevents default on mousedown, so a focused masked field is not blurred before the click lands', () => {
    // Regression test for the checkout CTA blur race: a masked field
    // (Phone, ZIP) left focused blurs on mousedown by default, which
    // triggers onTouched revalidation and a re-render between mousedown and
    // click — silently losing the click. onMouseDown={e =>
    // e.preventDefault()} on the CTA is the fix; assert it's still wired.
    setContext();
    render(<CheckoutStepActions />);

    const cta = screen.getByRole('button', { name: 'Continue to Delivery' });
    const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    cta.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });
});
