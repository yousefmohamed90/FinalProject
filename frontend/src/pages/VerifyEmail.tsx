import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState<"pending" | "ok" | "error">("pending");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!token) return;
    api(`/auth/verify-email/${token}`)
      .then(() => setStatus("ok"))
      .catch((e) => {
        setStatus("error");
        setMessage(e?.message ?? "Verification link is invalid or expired.");
      });
  }, [token]);

  return (
    <div className="grid min-h-[70vh] place-items-center px-4 py-12 sm:px-6">
      <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-8 text-center shadow-xl">
        {status === "pending" && (
          <>
            <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-muted-foreground" />
            <h1 className="text-xl font-semibold">Verifying your email…</h1>
          </>
        )}
        {status === "ok" && (
          <>
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h1 className="text-xl font-semibold">Email verified</h1>
            <p className="mt-1 text-sm text-muted-foreground">You're all set. Welcome to CodeSource.</p>
            <Link href="/dashboard"><Button className="mt-5 bg-primary text-primary-foreground hover:bg-primary/90">Go to dashboard</Button></Link>
          </>
        )}
        {status === "error" && (
          <>
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-destructive/10 text-destructive">
              <XCircle className="h-7 w-7" />
            </div>
            <h1 className="text-xl font-semibold">Verification failed</h1>
            <p className="mt-1 text-sm text-muted-foreground">{message}</p>
            <Link href="/login"><Button className="mt-5">Back to sign in</Button></Link>
          </>
        )}
      </div>
    </div>
  );
}
