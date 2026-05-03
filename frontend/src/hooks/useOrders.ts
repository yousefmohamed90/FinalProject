import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Order } from "@/lib/types";

export const orderKeys = {
  all: ["orders"] as const,
  me: () => ["orders", "me"] as const,
};

export function useMyOrders() {
  return useQuery({
    queryKey: orderKeys.me(),
    queryFn: async () => (await api<{ success: boolean; orders: Order[] }>("/orders/me")).orders,
  });
}

export interface CheckoutItem { productId: string; qty: number; }

export function useCheckout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { items: CheckoutItem[] }) =>
      await api<{ success: boolean; url: string; id: string }>("/orders/checkout", {
        method: "POST",
        body: JSON.stringify(vars),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: orderKeys.all }),
  });
}
