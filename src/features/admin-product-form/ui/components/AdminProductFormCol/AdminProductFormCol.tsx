import { CSSProperties, ReactNode } from 'react';
import style from './admin-product-form-col.module.scss';

type ColSpan = 3 | 4 | 6 | 12;

interface AdminProductFormColProps {
    /** Column span on ≥1024px. */
    span?: ColSpan;
    /** Column span on 768–1024px — defaults to `span`. */
    spanMd?: ColSpan;
    /**
     * Vertical position within the row's track. `FormField`'s label floats
     * inside its input box, but `Select`/`Textarea` stack a static label
     * above theirs — same nominal height (56px control) but a taller total
     * box, so a shorter neighbor sharing the row reads as glued to the top
     * with a lopsided gap below it. `center` balances that; only needed on
     * the shorter column of a mismatched pair.
     */
    align?: 'start' | 'center';
    children: ReactNode;
}

export const AdminProductFormCol = ({ span = 12, spanMd, align = 'start', children }: AdminProductFormColProps) => (
    <div
        className={style.col}
        style={{ '--col-span': span, '--col-span-md': spanMd ?? span, '--col-align': align } as CSSProperties}
    >
        {children}
    </div>
);
