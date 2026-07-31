import { Product } from '@/entities/product';

import { AdminProductRow } from '../AdminProductRow/AdminProductRow';
import { AdminProductRowSkeleton } from '../AdminProductRow/AdminProductRowSkeleton';
import style from './admin-products-table.module.scss';

interface AdminProductsTableProps {
    products: Product[];
    isLoading: boolean;
    limit: number;
}

export const AdminProductsTable = ({ products, isLoading, limit }: AdminProductsTableProps) => (
    <div className={style['admin-products-table']} role="list">
        <div className={style['admin-products-table__header']} role="presentation" aria-hidden="true">
            <span>Product</span>
            <span>SKU</span>
            <span>Category</span>
            <span>Price</span>
            <span>Rating</span>
        </div>

        {isLoading ? (
            <AdminProductRowSkeleton count={limit} />
        ) : (
            products.map((product) => (
                <AdminProductRow key={product.id} product={product} />
            ))
        )}
    </div>
);
