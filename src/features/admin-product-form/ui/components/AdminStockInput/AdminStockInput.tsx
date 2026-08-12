import { useRef } from 'react';
import { LuMinus, LuPlus } from 'react-icons/lu';

import { useSetAdminStockMutation } from '@/entities/admin';
import { getErrorMessage } from '@/shared/lib';
import { showToast } from '@/shared/ui';
import style from './admin-stock-input.module.scss';

const LOW_STOCK_THRESHOLD = 5;

interface AdminStockInputProps {
  sizeId: number;
  productId: number;
  stock: number;
  ariaLabel: string;
}

export const AdminStockInput = ({ sizeId, productId, stock, ariaLabel }: AdminStockInputProps) => {
  const [setStock] = useSetAdminStockMutation();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCommit = (value: string) => {
    const next = Math.max(0, Math.trunc(Number(value) || 0));
    if (next === stock) return;
    // The optimistic cache patch already rolls back on failure — which
    // remounts this input (key={stock}) back to the pre-edit value — so
    // only the error itself needs surfacing here.
    setStock({ sizeId, productId, stock: next })
      .unwrap()
      .catch((err) => {
        showToast('error', "Couldn't update stock", { description: getErrorMessage(err) });
      });
  };

  // preventDefault on mousedown keeps focus on the input (a plain click
  // would blur it first, committing the pre-step value before stepUp/Down
  // even runs) — the step is then committed directly, not via onBlur.
  const handleStep = (direction: 1 | -1) => (event: React.MouseEvent) => {
    event.preventDefault();
    const node = inputRef.current;
    if (!node) return;
    if (direction === 1) node.stepUp();
    else node.stepDown();
    handleCommit(node.value);
  };

  const tone = stock === 0 ? 'empty' : stock <= LOW_STOCK_THRESHOLD ? 'low' : null;

  return (
    <div
      className={`${style.wrapper} ${tone === 'empty' ? style.wrapperEmpty : tone === 'low' ? style.wrapperLow : ''}`}
    >
      <button
        type="button"
        className={style.stepButton}
        tabIndex={-1}
        onMouseDown={handleStep(-1)}
        aria-label={`Decrease ${ariaLabel}`}
      >
        <LuMinus aria-hidden="true" />
      </button>

      <input
        type="number"
        min={0}
        step="1"
        defaultValue={stock}
        // Remounts when an optimistic update lands (or is undone) so the
        // uncontrolled input's displayed value stays in sync.
        key={stock}
        ref={inputRef}
        aria-label={ariaLabel}
        className={`${style.input} ${tone === 'empty' ? style.inputEmpty : tone === 'low' ? style.inputLow : ''}`}
        onBlur={(event) => handleCommit(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') event.currentTarget.blur();
        }}
      />

      <button
        type="button"
        className={style.stepButton}
        tabIndex={-1}
        onMouseDown={handleStep(1)}
        aria-label={`Increase ${ariaLabel}`}
      >
        <LuPlus aria-hidden="true" />
      </button>
    </div>
  );
};
