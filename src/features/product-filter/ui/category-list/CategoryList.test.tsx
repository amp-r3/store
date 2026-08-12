import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategoryList } from './CategoryList';

const categoryOptions = [
  { slug: 'shoes', name: 'Shoes' },
  { slug: 'all', name: 'All' },
  { slug: 'apparel', name: 'Apparel' },
];

describe('CategoryList', () => {
  it('renders every category option, sorted with "all" first', () => {
    render(
      <CategoryList
        categoryOptions={categoryOptions}
        activeCategoryOption={null}
        changeCategory={vi.fn()}
      />,
    );

    const items = within(screen.getByRole('list')).getAllByRole('button');
    expect(items.map((item) => item.textContent)).toEqual(['All', 'Shoes', 'Apparel']);
  });

  it('marks the active category as pressed', () => {
    render(
      <CategoryList
        categoryOptions={categoryOptions}
        activeCategoryOption={{ slug: 'apparel', name: 'Apparel' }}
        changeCategory={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Apparel' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Shoes' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls changeCategory with the clicked slug after the debounce', async () => {
    const user = userEvent.setup();
    const changeCategory = vi.fn();
    render(
      <CategoryList
        categoryOptions={categoryOptions}
        activeCategoryOption={null}
        changeCategory={changeCategory}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Shoes' }));

    expect(changeCategory).not.toHaveBeenCalled();
    await waitFor(() => expect(changeCategory).toHaveBeenCalledWith('shoes'));
  });

  it('shows a fallback message for an empty category list', () => {
    render(
      <CategoryList categoryOptions={[]} activeCategoryOption={null} changeCategory={vi.fn()} />,
    );
    expect(screen.getByText('No categories available.')).toBeInTheDocument();
  });
});
