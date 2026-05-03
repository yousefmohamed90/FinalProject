import { CreditCard, Loader2, Lock, ShieldCheck } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store";
import { clearCart } from "@/store/cartSlice";
import { useCheckout } from "@/hooks/useOrders";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function Checkout() {
  const items = useAppSelector((s) => s.cart.items);
  const dispatch = useAppDispatch();
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const checkout = useCheckout();

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <h1 className="mb-3 text-2xl font-bold">Your cart is empty</h1>
        <Link href="/products"><Button>Browse marketplace</Button></Link>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <Lock className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
        <h1 className="mb-2 text-2xl font-bold">Sign in to continue</h1>
        <p className="mb-5 text-muted-foreground">You need an account to complete checkout.</p>
        <div className="flex justify-center gap-3">
          <Link href="/login"><Button>Sign in</Button></Link>
          <Link href="/register"><Button variant="outline">Create account</Button></Link>
        </div>
      </div>
    );
  }

  async function onCheckout() {
    try {
      const res = await checkout.mutateAsync({
        items: items.map((i) => ({ productId: i.productId, qty: i.quantity })),
      });
      dispatch(clearCart());
      window.location.href = res.url;
    } catch (e: any) {
      toast.error(e?.message ?? "Checkout failed");
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Checkout</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          <h3 className="font-semibold">Order items</h3>
          {items.map((it) => (
            <div key={it.productId} className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4">
              <div className="h-16 w-24 overflow-hidden rounded-lg bg-muted">
                {it.image ? <img src={it.image} alt="" className="h-full w-full object-cover" /> : null}
              </div>
              <div className="flex-1">
                <div className="font-medium">{it.title}</div>
                <div className="text-xs text-muted-foreground">Qty: {it.quantity}</div>
              </div>
              <div className="font-semibold tabular-nums">${(it.price * it.quantity).toFixed(2)}</div>
            </div>
          ))}
        </div>
        <aside className="h-fit space-y-4 rounded-xl border border-border/60 bg-card p-5">
          <h3 className="font-semibold">Summary</h3>
          <div className="space-y-2 border-y border-border/60 py-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="tabular-nums">${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span className="tabular-nums">$0.00</span></div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-2xl font-bold tabular-nums">${subtotal.toFixed(2)}</span>
          </div>
          <Button onClick={onCheckout} disabled={checkout.isPending} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            {checkout.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
            Pay ${subtotal.toFixed(2)}
          </Button>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" /> Secure checkout
          </p>
        </aside>
      </div>
    </div>
  );
}
