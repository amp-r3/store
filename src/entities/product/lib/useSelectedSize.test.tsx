import { describe, it, expect, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useSelectedSize, resetSelectedSize } from './useSelectedSize';
import { ProductSize } from '../model/types';

const sizeM: ProductSize = { id: 1, value: 'M', stock: 5 };
const sizeL: ProductSize = { id: 2, value: 'L', stock: 3 };

afterEach(() => {
  // The selection lives in module-level state, outside React — it outlives
  // any single renderHook instance and leaks into the next test otherwise.
  resetSelectedSize();
});

describe('useSelectedSize', () => {
  it('starts with no size selected', () => {
    const { result } = renderHook(() => useSelectedSize([sizeM, sizeL]));
    expect(result.current.selectedSizeId).toBeUndefined();
  });

  it('reflects a selection once it matches one of the given sizes', () => {
    const { result } = renderHook(() => useSelectedSize([sizeM, sizeL]));

    act(() => result.current.setSelectedSizeId(sizeM.id));

    expect(result.current.selectedSizeId).toBe(sizeM.id);
  });

  it('reports undefined when the stored selection is not among the current sizes', () => {
    const { result } = renderHook(() => useSelectedSize([sizeL]));

    act(() => result.current.setSelectedSizeId(sizeM.id));

    expect(result.current.selectedSizeId).toBeUndefined();
  });

  it('reports undefined whenever no sizes list is supplied, regardless of a stored selection', () => {
    const { result } = renderHook(() => useSelectedSize(undefined));

    act(() => result.current.setSelectedSizeId(sizeM.id));

    expect(result.current.selectedSizeId).toBeUndefined();
  });

  it('syncs a selection across independent hook instances (e.g. page + purchase bar)', () => {
    const page = renderHook(() => useSelectedSize([sizeM, sizeL]));
    const purchaseBar = renderHook(() => useSelectedSize([sizeM, sizeL]));

    act(() => page.result.current.setSelectedSizeId(sizeL.id));

    expect(purchaseBar.result.current.selectedSizeId).toBe(sizeL.id);
  });

  it('clearing the selection (undefined) propagates to other instances too', () => {
    const page = renderHook(() => useSelectedSize([sizeM, sizeL]));
    const purchaseBar = renderHook(() => useSelectedSize([sizeM, sizeL]));

    act(() => page.result.current.setSelectedSizeId(sizeM.id));
    act(() => page.result.current.setSelectedSizeId(undefined));

    expect(purchaseBar.result.current.selectedSizeId).toBeUndefined();
  });
});
