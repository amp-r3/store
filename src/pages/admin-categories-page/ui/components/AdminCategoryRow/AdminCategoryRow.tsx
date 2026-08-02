import { memo } from 'react';
import { LuPencil, LuTrash2 } from 'react-icons/lu';

import { AdminCategory } from '@/entities/admin';

import style from './admin-category-row.module.scss';

interface AdminCategoryRowProps {
    category: AdminCategory;
    onEdit: (category: AdminCategory) => void;
    onDelete: (category: AdminCategory) => void;
}

export const AdminCategoryRow = memo(({ category, onEdit, onDelete }: AdminCategoryRowProps) => (
    <article role="listitem" className={style['admin-category-row']}>
        <div className={style['admin-category-row__cell']}>
            <span className={style['admin-category-row__cell-label']}>Name</span>
            <span className={style['admin-category-row__name']}>{category.name}</span>
        </div>

        <div className={style['admin-category-row__cell']}>
            <span className={style['admin-category-row__cell-label']}>Slug</span>
            <span className={style['admin-category-row__slug']}>{category.slug}</span>
        </div>

        <div className={style['admin-category-row__cell']}>
            <span className={style['admin-category-row__cell-label']}>Products</span>
            {category.productsCount}
        </div>

        <div className={`${style['admin-category-row__cell']} ${style['admin-category-row__actions']}`}>
            <button
                type="button"
                className={style['admin-category-row__action']}
                onClick={() => onEdit(category)}
                aria-label={`Edit ${category.name}`}
            >
                <LuPencil />
            </button>
            <button
                type="button"
                className={`${style['admin-category-row__action']} ${style['admin-category-row__action--danger']}`}
                onClick={() => onDelete(category)}
                aria-label={`Delete ${category.name}`}
            >
                <LuTrash2 />
            </button>
        </div>
    </article>
));

AdminCategoryRow.displayName = 'AdminCategoryRow';
