import { Link, useLocation } from "wouter";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { useAppDispatch, useAppSelector } from "@/store";
import { removeItem, updateQuantity } from "@/store/cartSlice";

export default function Cart() {
  const [, navigate] = useLocation();
  const items = useAppSelector((s) => s.cart.items);
  const dispatch = useAppDispatch();

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = +(subtotal * 0.0).toFixed(2);
  const total = subtotal + tax;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="mb-6 text-3xl font-bold">Your cart</h1>
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Browse the marketplace to find your next great find."
          action={<Link href="/products"><Button>Browse marketplace</Button></Link>}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Your cart</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {items.map((it) => (
            <div key={it.productId} className="flex gap-4 rounded-xl border border-border/60 bg-card p-4">
              <Link href={`/products/${it.slug}`} className="block h-20 w-28 overflow-hidden rounded-lg bg-muted">
                {it.image ? <img src={it.image} alt="" className="h-full w-full object-cover" /> : null}
              </Link>
              <div className="flex flex-1 flex-col justify-between">
                <Link href={`/products/${it.slug}`} className="font-semibold hover:text-primary">{it.title}</Link>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => dispatch(updateQuantity({ productId: it.productId, quantity: it.quantity - 1 }))}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center font-mono text-sm tabular-nums">{it.quantity}</span>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => dispatch(updateQuantity({ productId: it.productId, quantity: it.quantity + 1 }))}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold tabular-nums">${(it.price * it.quantity).toFixed(2)}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => dispatch(removeItem(it.productId))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <aside className="h-fit space-y-3 rounded-xl border border-border/60 bg-card p-5">
          <h3 className="font-semibold">Order summary</h3>
          <div className="space-y-2 border-y border-border/60 py-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="tabular-nums">${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span className="tabular-nums">${tax.toFixed(2)}</span></div>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-2xl font-bold tabular-nums">${total.toFixed(2)}</span>
          </div>
          <Button onClick={() => navigate("/checkout")} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            Proceed to checkout
          </Button>
        </aside>
      </div>
    </div>
  );
}
