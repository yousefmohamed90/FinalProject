import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import type { User } from "@/lib/types";
import { useAppDispatch, useAppSelector } from "@/store";
import { logoutLocal, setInitialized, setUser } from "@/store/authSlice";

// Backend auth responses: { success, user } — NOT { success, data }
interface AuthResponse { success: boolean; user: User; token?: string; }

export function useSession() {
  const dispatch = useAppDispatch();
  const query = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      try {
        const res = await api<AuthResponse>("/auth/me");
        return res.user ?? null;
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) return null;
        throw e;
      }
    },
    staleTime: 60_000,
    retry: false,
  });

  useEffect(() => {
    if (query.isSuccess) dispatch(setUser(query.data ?? null));
    else if (query.isError) dispatch(setInitialized(true));
  }, [query.isSuccess, query.isError, query.data, dispatch]);

  return query;
}

export function useAuth() {
  const user = useAppSelector((s) => s.auth.user);
  const initialized = useAppSelector((s) => s.auth.initialized);
  return { user, initialized, isAuthenticated: !!user, isAdmin: user?.role === "admin" };
}

export function useLogin() {
  const dispatch = useAppDispatch();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { email: string; password: string }) => {
      const res = await api<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(vars),
      });
      return res.user;
    },
    onSuccess: (user) => {
      dispatch(setUser(user));
      qc.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}

export function useRegister() {
  const dispatch = useAppDispatch();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { name: string; email: string; password: string }) => {
      const res = await api<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(vars),
      });
      return res.user;
    },
    onSuccess: (user) => {
      dispatch(setUser(user));
      qc.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}

export function useLogout() {
  const dispatch = useAppDispatch();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api("/auth/logout", { method: "POST" });
    },
    onSuccess: () => {
      dispatch(logoutLocal());
      qc.clear();
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (vars: { email: string }) =>
      api("/auth/forgot-password", { method: "POST", body: JSON.stringify(vars) }),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async (vars: { token: string; password: string }) =>
      api(`/auth/reset-password/${vars.token}`, {
        method: "PUT",
        body: JSON.stringify({ password: vars.password }),
      }),
  });
}
