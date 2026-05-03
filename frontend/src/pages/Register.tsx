import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Code2, Loader2 } from "lucide-react";
import { useRegister } from "@/hooks/useAuth";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().min(2, "At least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});
type Form = z.infer<typeof schema>;

export default function Register() {
  const [, navigate] = useLocation();
  const register2 = useRegister();
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  function onSubmit(values: Form) {
    register2.mutate(values, {
      onSuccess: () => {
        toast.success("Account created! Welcome to CodeHub 🎉");
        navigate("/");
      },
      onError: (e: any) => toast.error(e?.message ?? "Registration failed"),
    });
  }

  return (
    <div className="grid min-h-[80vh] place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Code2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Create account</h1>
            <p className="text-sm text-muted-foreground mt-1">Join CodeHub and start buying or selling</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Full name</label>
              <input {...register("name")} type="text" autoComplete="name"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" />
              {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <input {...register("email")} type="email" autoComplete="email"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" />
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Password</label>
              <input {...register("password")} type="password" autoComplete="new-password"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" />
              {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={register2.isPending}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors">
              {register2.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Create account
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
