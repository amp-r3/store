import { CSSProperties, ReactNode } from 'react';
import style from './admin-product-form-col.module.scss';

type ColSpan = 3 | 4 | 6 | 12;

interface AdminProductFormColProps {
    /** Column span on ≥1024px. */
    span?: ColSpan;
    /** Column span on 768–1024px — defaults to `span`. */
    spanMd?: ColSpan;
    children: ReactNode;
}

export const AdminProductFormCol = ({ span = 12, spanMd, children }: AdminProductFormColProps) => (
    <div
        className={style.col}
        style={{ '--col-span': span, '--col-span-md': spanMd ?? span } as CSSProperties}
    >
        {children}
    </div>
);
