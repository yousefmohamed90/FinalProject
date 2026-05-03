import { Link } from "wouter";
import { Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { useMyOrders } from "@/hooks/useOrders";

const statusStyle: Record<string, string> = {
  paid: "bg-primary/10 text-primary",
  pending: "bg-amber-500/10 text-amber-500",
  failed: "bg-destructive/10 text-destructive",
  refunded: "bg-muted text-muted-foreground",
};

export default function Orders() {
  const orders = useMyOrders();

  if (orders.isLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Order history</h1>
      {(orders.data ?? []).length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders yet"
          description="Your purchase history will appear here."
          action={<Link href="/products"><Button>Browse marketplace</Button></Link>}
        />
      ) : (
        <div className="space-y-4">
          {(orders.data ?? []).map((o) => (
            <div key={o._id} className="rounded-xl border border-border/60 bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
                <div>
                  <div className="font-mono text-xs text-muted-foreground">Order #{o._id.slice(-8).toUpperCase()}</div>
                  <div className="text-sm text-muted-foreground">{new Date(o.createdAt).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide ${statusStyle[o.paymentStatus] ?? statusStyle.pending}`}>{o.paymentStatus}</span>
                  <span className="text-lg font-bold tabular-nums">${o.totalAmount.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-3 space-y-2">
              {(o.orderItems || []).map((it, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="h-12 w-16 overflow-hidden rounded-md bg-muted">
                      {it.product?.images?.[0] ? <img src={it.product.images[0]} alt="" className="h-full w-full object-cover" /> : null}
                    </div>
                    <Link href={`/products/${it.product?.slug}`} className="flex-1 font-medium hover:text-primary">{it.product?.title}</Link>
                  <span className="text-muted-foreground">×{it.qty}</span>
                  <span className="w-20 text-right tabular-nums">${(it.price * it.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
