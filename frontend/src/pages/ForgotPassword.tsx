import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { useForgotPassword } from "@/hooks/useAuth";

const schema = z.object({ email: z.string().email("Enter a valid email") });
type Form = z.infer<typeof schema>;

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const fp = useForgotPassword();
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  function onSubmit(values: Form) {
    fp.mutate(values, { onSuccess: () => setSent(true) });
  }

  return (
    <div className="grid min-h-[80vh] place-items-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center"><Logo size="lg" /></div>
        <div className="rounded-2xl border border-border/60 bg-card p-7 shadow-xl">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h1 className="text-xl font-semibold">Check your email</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">If that account exists, we sent a password reset link.</p>
              <Link href="/login"><Button className="mt-5">Back to sign in</Button></Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold">Reset your password</h1>
              <p className="mt-1 text-sm text-muted-foreground">Enter your email and we'll send you a reset link.</p>
              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...register("email")} />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>
                <Button type="submit" disabled={fp.isPending} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  {fp.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send reset link
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
