import { useState } from "react";
import { Link, useParams } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { useResetPassword } from "@/hooks/useAuth";

const schema = z
  .object({
    password: z.string().min(6, "At least 6 characters"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Passwords don't match" });
type Form = z.infer<typeof schema>;

export default function ResetPassword() {
  const { token } = useParams();
  const [done, setDone] = useState(false);
  const reset = useResetPassword();
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  function onSubmit(values: Form) {
    if (!token) return;
    reset.mutate({ token, password: values.password }, { onSuccess: () => setDone(true) });
  }

  return (
    <div className="grid min-h-[80vh] place-items-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center"><Logo size="lg" /></div>
        <div className="rounded-2xl border border-border/60 bg-card p-7 shadow-xl">
          {done ? (
            <div className="text-center">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h1 className="text-xl font-semibold">Password updated</h1>
              <p className="mt-1 text-sm text-muted-foreground">You can now sign in with your new password.</p>
              <Link href="/login"><Button className="mt-5 bg-primary text-primary-foreground hover:bg-primary/90">Go to sign in</Button></Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold">Set a new password</h1>
              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="password">New password</Label>
                  <Input id="password" type="password" {...register("password")} />
                  {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirm">Confirm password</Label>
                  <Input id="confirm" type="password" {...register("confirm")} />
                  {errors.confirm && <p className="text-xs text-destructive">{errors.confirm.message}</p>}
                </div>
                <Button type="submit" disabled={reset.isPending} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  {reset.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update password
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
