import { Product, ProductSize, Category } from '@/entities/product';
import { CartItemDetails } from '@/entities/cart';
import { DeliveryMethod } from '@/entities/order';

let nextId = 1;
const uniqueId = () => nextId++;

export const makeProduct = (overrides: Partial<Product> = {}): Product => {
  const id = overrides.id ?? uniqueId();
  return {
    id,
    title: `Test Product ${id}`,
    description: 'A product used in component tests.',
    category: 'apparel',
    basePrice: 100,
    price: 100,
    discountPercentage: 0,
    rating: 4.5,
    tags: [],
    brand: 'TestBrand',
    sku: `SKU-${id}`,
    weight: 1,
    dimensions: { width: 10, height: 10, depth: 10 },
    warrantyInformation: '1 year',
    shippingInformation: 'Ships in 3-5 days',
    availabilityStatus: 'In Stock',
    returnPolicy: '30 days',
    reviewsCount: 0,
    minimumOrderQuantity: 1,
    meta: {
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      barcode: '000000000000',
      qrCode: 'https://example.com/qr',
    },
    thumbnail: `https://stub.supabase.co/storage/v1/object/public/products/product-${id}-thumb.webp`,
    images: [],
    ...overrides,
  };
};

export const makeSize = (overrides: Partial<ProductSize> = {}): ProductSize => ({
  id: uniqueId(),
  value: 'M',
  stock: 10,
  ...overrides,
});

export const makeCartItemDetails = (overrides: Partial<CartItemDetails> = {}): CartItemDetails => ({
  ...makeProduct(),
  sizeId: uniqueId(),
  quantity: 1,
  ...overrides,
});

export const makeDeliveryMethod = (overrides: Partial<DeliveryMethod> = {}): DeliveryMethod => ({
  id: `delivery-${uniqueId()}`,
  code: 'standard',
  label: 'Standard',
  price: 5,
  duration: '3-5 business days',
  isActive: true,
  freeFromPrice: 100,
  ...overrides,
});

export const makeCategory = (overrides: Partial<Category> = {}): Category => ({
  slug: 'apparel',
  name: 'Apparel',
  ...overrides,
});
