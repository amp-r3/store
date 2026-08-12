import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { sortingOptions } from '@/entities/product';
import { SortOptionsList } from './SortOptionsList';

describe('SortOptionsList', () => {
  it('renders every sorting option label', () => {
    render(
      <SortOptionsList
        sortingOptions={sortingOptions}
        activeSortOption={sortingOptions[0]}
        changeSort={vi.fn()}
      />,
    );

    sortingOptions.forEach((option) => {
      expect(screen.getByRole('button', { name: option.label })).toBeInTheDocument();
    });
  });

  it('marks the active option as pressed', () => {
    render(
      <SortOptionsList
        sortingOptions={sortingOptions}
        activeSortOption={sortingOptions[2]}
        changeSort={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: sortingOptions[2].label })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: sortingOptions[0].label })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it("calls changeSort with the option's sortBy/order after the debounce", async () => {
    const user = userEvent.setup();
    const changeSort = vi.fn();
    render(
      <SortOptionsList
        sortingOptions={sortingOptions}
        activeSortOption={sortingOptions[0]}
        changeSort={changeSort}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Lowest Price' }));

    expect(changeSort).not.toHaveBeenCalled();
    await waitFor(() => expect(changeSort).toHaveBeenCalledWith('price', 'asc'));
  });

  it('shows a fallback message for an empty options list', () => {
    render(
      <SortOptionsList
        sortingOptions={[]}
        activeSortOption={sortingOptions[0]}
        changeSort={vi.fn()}
      />,
    );
    expect(screen.getByText('No sort options available.')).toBeInTheDocument();
  });
});
