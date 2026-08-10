import { AdminProductListItem } from '@/entities/admin';

import { AdminProductRow } from '../AdminProductRow/AdminProductRow';
import { AdminProductRowSkeleton } from '../AdminProductRow/AdminProductRowSkeleton';
import style from './admin-products-table.module.scss';

interface AdminProductsTableProps {
  products: AdminProductListItem[];
  isLoading: boolean;
  limit: number;
  onArchive: (product: AdminProductListItem) => void;
  onRestore: (product: AdminProductListItem) => void;
}

export const AdminProductsTable = ({
  products,
  isLoading,
  limit,
  onArchive,
  onRestore,
}: AdminProductsTableProps) => (
  <div className={style['admin-products-table']} role="list">
    <div className={style['admin-products-table__header']} role="presentation" aria-hidden="true">
      <span>Product</span>
      <span>SKU</span>
      <span>Category</span>
      <span>Price</span>
      <span>Rating</span>
      <span />
    </div>

    {isLoading ? (
      <AdminProductRowSkeleton count={limit} />
    ) : (
      products.map((product) => (
        <AdminProductRow
          key={product.id}
          product={product}
          onArchive={onArchive}
          onRestore={onRestore}
        />
      ))
    )}
  </div>
);
