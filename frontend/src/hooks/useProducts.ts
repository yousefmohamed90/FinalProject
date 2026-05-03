import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Product, Review } from "@/lib/types";

export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

function qs(filters: ProductFilters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== "" && v !== null) params.set(k, String(v));
  });
  const s = params.toString();
  return s ? `?${s}` : "";
}

export const productKeys = {
  all: ["products"] as const,
  list: (f: ProductFilters) => ["products", "list", f] as const,
  categories: () => ["products", "categories"] as const,
  detail: (slug: string) => ["products", "detail", slug] as const,
};

// Backend returns: { success, products, total, page, pages }
interface ProductsResponse {
  success: boolean;
  products: Product[];
  total: number;
  page: number;
  pages: number;
}
// Backend returns: { success, categories: [{name, count}] }
interface CategoriesResponse {
  success: boolean;
  categories: { name: string; count: number }[];
}

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => api<ProductsResponse>(`/products${qs(filters)}`),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: productKeys.categories(),
    queryFn: () => api<CategoriesResponse>("/products/categories"),
  });
}

export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: productKeys.detail(slug ?? ""),
    queryFn: async () => {
      const res = await api<{ success: boolean; product: Product & { reviews?: Review[] } }>(`/products/${slug}`);
      return res.product;
    },
    enabled: !!slug,
  });
}

export function useCreateReview(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { rating: number; comment: string }) => {
      const res = await api<{ success: boolean; review: Review }>(`/products/${productId}/reviews`, {
        method: "POST",
        body: JSON.stringify(vars),
      });
      return res.review;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all }),
  });
}

export function useDownloadProduct() {
  return useMutation({
    mutationFn: async (productId: string) => {
      const res = await api<{ success: boolean; sourceCodeUrl: string }>(`/products/${productId}/download`);
      return res;
    },
  });
}

export function usePurchaseProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (productId: string) => {
      const res = await api<{ success: boolean; message: string; product: Product }>(`/products/${productId}/purchase`, {
        method: "POST",
      });
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export interface ProductInput {
  title: string;
  description: string;
  category: string;
  price: number;
  technologies?: string[];
  images?: string[];
  demoUrl?: string;
  sourceCodeUrl?: string;
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ProductInput) => {
      const res = await api<{ success: boolean; product: Product }>("/products", {
        method: "POST",
        body: JSON.stringify(input),
      });
      return res.product;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all }),
  });
}
