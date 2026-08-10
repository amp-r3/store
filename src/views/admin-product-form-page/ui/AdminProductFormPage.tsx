import { useParams } from 'next/navigation';

import { getErrorMessage } from '@/shared/lib';
import { SectionHeader, Loader, Alert } from '@/shared/ui';
import { useGetAdminProductByIdQuery } from '@/entities/admin';
import { AdminProductForm } from '@/features/admin-product-form';

export const AdminProductFormPage = () => {
  const { id } = useParams<{ id?: string }>();
  const productId = id ? Number(id) : undefined;

  const {
    data: product,
    isLoading,
    error,
  } = useGetAdminProductByIdQuery(productId!, { skip: !productId });

  if (productId && isLoading) {
    return <Loader size="md" />;
  }

  if (productId && error) {
    return <Alert variant="error">{getErrorMessage(error)}</Alert>;
  }

  return (
    <>
      <SectionHeader
        title={productId ? 'Edit product' : 'New product'}
        subtitle={
          productId ? "Update this product's details." : 'Add a new product to the catalog.'
        }
      />

      <AdminProductForm product={product} />
    </>
  );
};
