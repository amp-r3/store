import { ReactNode } from 'react';
import style from './admin-product-form-section.module.scss';

interface AdminProductFormSectionProps {
    title: string;
    children: ReactNode;
}

export const AdminProductFormSection = ({ title, children }: AdminProductFormSectionProps) => (
    <section className={style.section}>
        <h2 className={style.title}>{title}</h2>
        <div className={style.grid}>{children}</div>
    </section>
);
