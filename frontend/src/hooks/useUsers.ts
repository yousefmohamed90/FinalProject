import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";

export const userKeys = { all: ["users"] as const };

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; input: Partial<User> }) =>
      (await api<{ success: boolean; user: User }>(`/users/${vars.id}`, {
        method: "PUT",
        body: JSON.stringify(vars.input),
      })).user,
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  });
}
