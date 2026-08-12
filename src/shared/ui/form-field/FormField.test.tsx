import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormField } from './FormField';

describe('FormField', () => {
  it('associates the visible label with the input via htmlFor/id', () => {
    render(<FormField label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('does not point aria-describedby at a nonexistent element when error is a boolean', () => {
    render(<FormField label="Password" error />);
    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('aria-invalid', 'true');

    const describedBy = input.getAttribute('aria-describedby');
    if (describedBy) {
      for (const id of describedBy.split(' ')) {
        expect(document.getElementById(id)).not.toBeNull();
      }
    }
  });

  it('points aria-describedby at the rendered error message when error is a string', () => {
    render(<FormField label="Password" error="Password is required" />);
    const input = screen.getByLabelText('Password');
    const errorNode = screen.getByRole('alert');

    expect(errorNode).toHaveTextContent('Password is required');
    expect(input.getAttribute('aria-describedby')).toContain(errorNode.id);
  });
});
