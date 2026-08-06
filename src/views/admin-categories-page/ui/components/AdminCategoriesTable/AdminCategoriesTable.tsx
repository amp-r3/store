import { AdminCategory } from '@/entities/admin';

import { AdminCategoryRow } from '../AdminCategoryRow/AdminCategoryRow';
import { AdminCategoryRowSkeleton } from '../AdminCategoryRow/AdminCategoryRowSkeleton';
import style from './admin-categories-table.module.scss';

interface AdminCategoriesTableProps {
    categories: AdminCategory[];
    isLoading: boolean;
    onEdit: (category: AdminCategory) => void;
    onDelete: (category: AdminCategory) => void;
}

export const AdminCategoriesTable = ({ categories, isLoading, onEdit, onDelete }: AdminCategoriesTableProps) => (
    <div className={style['admin-categories-table']} role="list">
        <div className={style['admin-categories-table__header']} role="presentation" aria-hidden="true">
            <span>Name</span>
            <span>Slug</span>
            <span>Products</span>
            <span />
        </div>

        {isLoading ? (
            <AdminCategoryRowSkeleton count={5} />
        ) : (
            categories.map((category) => (
                <AdminCategoryRow key={category.id} category={category} onEdit={onEdit} onDelete={onDelete} />
            ))
        )}
    </div>
);
