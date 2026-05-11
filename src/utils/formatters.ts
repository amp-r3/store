import { ProductsResponse } from "@/services/productsApi";
import { Product } from "@/types/products";

export const getItemsToRender = (
  response: ProductsResponse,
  isLoading: boolean,
  itemsPerPage: number
): Product[] => {
  if (isLoading) return Array.from({ length: itemsPerPage });
  if (!response?.items || !response?.ids) return [];
  return response.ids.map((id: number) => response.items[id]);
};