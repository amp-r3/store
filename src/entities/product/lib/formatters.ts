import { ProductsResponse } from "@/entities/product";
import { Product } from "@/entities/product";

export const getItemsToRender = (
  response: ProductsResponse,
  isLoading: boolean,
  itemsPerPage: number
): Product[] => {
  if (isLoading) return Array.from({ length: itemsPerPage });
  if (!response?.items || !response?.ids) return [];
  return response.ids.map((id: number) => response.items[id]);
};