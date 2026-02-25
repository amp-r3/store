export type CategoryId =
  | 'beauty'
  | 'fragrances'
  | 'furniture'
  | 'groceries'
  | 'home-decoration'
  | 'kitchen-accessories'
  | 'laptops'
  | 'mens-shirts'
  | 'mens-shoes'
  | 'mens-watches'
  | 'mobile-accessories'
  | 'motorcycle'
  | 'skin-care'
  | 'smartphones'
  | 'sports-accessories'
  | 'sunglasses'
  | 'tablets'
  | 'tops'
  | 'vehicle'
  | 'womens-bags'
  | 'womens-dresses'
  | 'womens-jewellery'
  | 'womens-shoes'
  | 'womens-watches';

export interface CategoryOption {
    id: CategoryId;
    label: string;
}

export const categoryOptions: CategoryOption[] = [
    { id: 'beauty', label: 'Beauty' },
    { id: 'fragrances', label: 'Fragrances' },
    { id: 'furniture', label: 'Furniture' },
    { id: 'groceries', label: 'Groceries' },
    { id: 'home-decoration', label: 'Home Decoration' },
    { id: 'kitchen-accessories', label: 'Kitchen Accessories' },
    { id: 'laptops', label: 'Laptops' },
    { id: 'mens-shirts', label: "Men's Shirts" },
    { id: 'mens-shoes', label: "Men's Shoes" },
    { id: 'mens-watches', label: "Men's Watches" },
    { id: 'mobile-accessories', label: 'Mobile Accessories' },
    { id: 'motorcycle', label: 'Motorcycle' },
    { id: 'skin-care', label: 'Skin Care' },
    { id: 'smartphones', label: 'Smartphones' },
    { id: 'sports-accessories', label: 'Sports Accessories' },
    { id: 'sunglasses', label: 'Sunglasses' },
    { id: 'tablets', label: 'Tablets' },
    { id: 'tops', label: 'Tops' },
    { id: 'vehicle', label: 'Vehicle' },
    { id: 'womens-bags', label: "Women's Bags" },
    { id: 'womens-dresses', label: "Women's Dresses" },
    { id: 'womens-jewellery', label: "Women's Jewellery" },
    { id: 'womens-shoes', label: "Women's Shoes" },
    { id: 'womens-watches', label: "Women's Watches" }
] as const;