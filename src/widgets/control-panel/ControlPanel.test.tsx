import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { sortingOptions } from '@/entities/product';
import { ControlPanel } from './ControlPanel';

const categoryOptions = [
  { slug: 'apparel', name: 'Apparel' },
  { slug: 'shoes', name: 'Shoes' },
];

const defaultProps = {
  clearAll: vi.fn(),
  changeSort: vi.fn(),
  sortingOptions,
  activeSortOption: sortingOptions[0],
  changeCategory: vi.fn(),
  categoryOptions,
  activeCategoryOption: null,
  isFetching: false,
  isDealsActive: false,
  toggleDeals: vi.fn(),
};

describe('ControlPanel', () => {
  it('labels the sort and category triggers with the active option, defaulting category to "All"', () => {
    render(<ControlPanel {...defaultProps} />);

    expect(
      screen.getByRole('button', { name: `Sort by: ${sortingOptions[0].label}` }),
    ).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('button', { name: 'Category: All' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('reflects a selected category in the trigger label', () => {
    render(<ControlPanel {...defaultProps} activeCategoryOption={categoryOptions[1]} />);
    expect(screen.getByRole('button', { name: 'Category: Shoes' })).toBeInTheDocument();
  });

  it('expands the category panel on click', async () => {
    const user = userEvent.setup();
    render(<ControlPanel {...defaultProps} />);

    const categoryButton = screen.getByRole('button', { name: 'Category: All' });
    await user.click(categoryButton);

    expect(categoryButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('reflects and toggles the deals filter', async () => {
    const user = userEvent.setup();
    const toggleDeals = vi.fn();
    render(<ControlPanel {...defaultProps} isDealsActive toggleDeals={toggleDeals} />);

    const dealsButton = screen.getByRole('button', { name: 'Deals filter on' });
    expect(dealsButton).toHaveAttribute('aria-pressed', 'true');

    await user.click(dealsButton);
    expect(toggleDeals).toHaveBeenCalledTimes(1);
  });

  it('hides Reset all filters when no filter is active', () => {
    render(<ControlPanel {...defaultProps} />);
    expect(screen.queryByRole('button', { name: 'Reset all filters' })).not.toBeInTheDocument();
  });

  it('shows Reset all filters once a category is active, and calls clearAll', async () => {
    const user = userEvent.setup();
    const clearAll = vi.fn();
    render(
      <ControlPanel
        {...defaultProps}
        activeCategoryOption={categoryOptions[0]}
        clearAll={clearAll}
      />,
    );

    const resetButton = screen.getByRole('button', { name: 'Reset all filters' });
    await user.click(resetButton);

    expect(clearAll).toHaveBeenCalledTimes(1);
  });

  it('shows Reset all filters once a non-default sort is active', () => {
    render(<ControlPanel {...defaultProps} activeSortOption={sortingOptions[1]} />);
    expect(screen.getByRole('button', { name: 'Reset all filters' })).toBeInTheDocument();
  });

  it('shows Reset all filters once the deals filter is active', () => {
    render(<ControlPanel {...defaultProps} isDealsActive />);
    expect(screen.getByRole('button', { name: 'Reset all filters' })).toBeInTheDocument();
  });
});
