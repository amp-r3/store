import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { checkoutMasterSchema, CheckoutFormValues } from '../../model/checkoutMasterSchema';
import { useCheckoutContext } from '../../model/CheckoutContext';
import { CheckoutContacts } from './CheckoutContacts';

// CheckoutContacts only reads applyPreviousAddress/hasPreviousAddress/
// showPreviousAddressChip off the context — mocking it sidesteps needing a
// full CheckoutProvider (Redux cart, delivery/payment RTK Query, the
// stepper) for a component that doesn't touch any of that itself.
vi.mock('../../model/CheckoutContext', () => ({
  useCheckoutContext: vi.fn(),
}));

const mockedUseCheckoutContext = vi.mocked(useCheckoutContext);

const CONTACT_FIELDS = ['firstName', 'lastName', 'email', 'phone'] as const;

const setContext = (overrides: Partial<ReturnType<typeof useCheckoutContext>> = {}) => {
  mockedUseCheckoutContext.mockReturnValue({
    hasPreviousAddress: false,
    showPreviousAddressChip: false,
    applyPreviousAddress: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useCheckoutContext>);
};

// Mirrors how useCheckoutStepper's goNext() actually validates a step: one
// shared master-schema resolver, but `trigger` scoped to that step's field
// list — not a full handleSubmit, and not a step-local schema.
const Harness = () => {
  const methods = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutMasterSchema),
    mode: 'onSubmit',
  });
  return (
    <FormProvider {...methods}>
      <CheckoutContacts />
      <button type="button" onClick={() => methods.trigger(CONTACT_FIELDS)}>
        Validate
      </button>
    </FormProvider>
  );
};

describe('CheckoutContacts', () => {
  it('shows validation errors for invalid values in every contact field', async () => {
    // Phone is Controller-driven with no `defaultValues.phone`
    // (useCheckoutForm.ts) — validating it truly untouched produces Zod's
    // generic "expected string, received undefined" rather than the regex
    // message, so type a too-short value instead. That's also more
    // representative: a user who typed something invalid, not one who
    // never touched the field.
    setContext();
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByLabelText('First name'), 'J');
    await user.type(screen.getByLabelText('Last name'), 'D');
    await user.type(screen.getByLabelText('Email'), 'not-an-email');
    await user.type(screen.getByLabelText('Phone'), '123');
    await user.click(screen.getByRole('button', { name: 'Validate' }));

    expect(await screen.findByLabelText('First name')).toHaveAccessibleDescription(
      'The first name is too short',
    );
    expect(screen.getByLabelText('Last name')).toHaveAccessibleDescription(
      'The last name is too short',
    );
    expect(screen.getByLabelText('Email')).toHaveAccessibleDescription('Incorrect email format');
    expect(screen.getByLabelText('Phone')).toHaveAccessibleDescription('Incorrect phone number');
  });

  it('clears the errors once every contact field is filled in validly', async () => {
    setContext();
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'Validate' }));
    expect(await screen.findByLabelText('First name')).toHaveAttribute('aria-invalid', 'true');

    await user.type(screen.getByLabelText('First name'), 'Jane');
    await user.type(screen.getByLabelText('Last name'), 'Doe');
    await user.type(screen.getByLabelText('Email'), 'jane@example.com');
    await user.type(screen.getByLabelText('Phone'), '+15551234567');
    await user.click(screen.getByRole('button', { name: 'Validate' }));

    expect(await screen.findByLabelText('First name')).toHaveAttribute('aria-invalid', 'false');
    expect(screen.getByLabelText('Last name')).toHaveAttribute('aria-invalid', 'false');
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'false');
    expect(screen.getByLabelText('Phone')).toHaveAttribute('aria-invalid', 'false');
  });

  it('hides the previous-address chip unless both flags are set', () => {
    setContext({ hasPreviousAddress: true, showPreviousAddressChip: false });
    render(<Harness />);
    expect(
      screen.queryByRole('button', { name: 'Use my previous address' }),
    ).not.toBeInTheDocument();
  });

  it('shows the previous-address chip and applies it on click', async () => {
    const applyPreviousAddress = vi.fn();
    setContext({
      hasPreviousAddress: true,
      showPreviousAddressChip: true,
      applyPreviousAddress,
    });
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'Use my previous address' }));

    expect(applyPreviousAddress).toHaveBeenCalledTimes(1);
  });
});
