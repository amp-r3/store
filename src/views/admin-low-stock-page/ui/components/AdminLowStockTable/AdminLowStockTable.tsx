import { AdminLowStockItem } from '@/entities/admin';

import { AdminLowStockRow } from '../AdminLowStockRow/AdminLowStockRow';
import { AdminLowStockRowSkeleton } from '../AdminLowStockRow/AdminLowStockRowSkeleton';
import style from './admin-low-stock-table.module.scss';

interface AdminLowStockTableProps {
    items: AdminLowStockItem[];
    isLoading: boolean;
}

export const AdminLowStockTable = ({ items, isLoading }: AdminLowStockTableProps) => (
    <div className={style['admin-low-stock-table']} role="list">
        <div className={style['admin-low-stock-table__header']} role="presentation" aria-hidden="true">
            <span>Product</span>
            <span>Size</span>
            <span>Stock</span>
        </div>

        {isLoading ? (
            <AdminLowStockRowSkeleton count={6} />
        ) : (
            items.map((item) => <AdminLowStockRow key={item.sizeId} item={item} />)
        )}
    </div>
);
