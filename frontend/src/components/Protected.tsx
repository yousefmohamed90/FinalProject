import type { ReactNode } from "react";
import { Redirect, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export function Protected({ children }: { children: ReactNode }) {
  const { user, initialized } = useAuth();
  const [location] = useLocation();

  if (!initialized) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to={`/login?redirect=${encodeURIComponent(location)}`} />;
  }

  return <>{children}</>;
}
