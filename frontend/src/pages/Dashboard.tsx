import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Loader2, Package, Plus, UserCircle, Trash2, Edit, Library } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { useMyOrders } from "@/hooks/useOrders";
import { toast } from "sonner";

export default function Dashboard() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["products", "author", user?._id],
    queryFn: () => api(`/products?author=${user?._id}`),
    enabled: !!user?._id,
  });

  const products = data?.products ?? data?.data ?? [];

  const orders = useMyOrders();
  const rawPurchasedItems = (orders.data ?? [])
    .filter((o) => o.paymentStatus === "paid")
    .flatMap((o) => (o.orderItems || []).map((i) => ({ order: o, item: i })));

  const seen = new Set<string>();
  const purchasedItems = rawPurchasedItems.filter(({ item }) => {
    const pId = item.product?._id;
    if (!pId || seen.has(pId)) return false;
    seen.add(pId);
    return true;
  });

  async function onDeleteProduct(id: string) {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await api(`/products/${id}`, { method: "DELETE" });
      toast.success("Project deleted successfully");
      qc.invalidateQueries({ queryKey: ["products", "author", user?._id] });
    } catch (e: any) {
      toast.error(e?.message || "Failed to delete project");
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your uploaded projects and see your stats.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/profile">
            <button className="flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors">
              <UserCircle className="h-4 w-4" /> My Profile
            </button>
          </Link>
          <Link href="/sell">
            <button className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
              <Plus className="h-4 w-4" /> Add New Project
            </button>
          </Link>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Package className="h-5 w-5 text-primary" />
        My Projects ({products.length})
      </h2>

      {isLoading ? (
        <div className="grid min-h-[40vh] place-items-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-20 text-center text-muted-foreground">
          <p className="mb-4">You haven't uploaded any projects yet.</p>
          <Link href="/sell" className="text-primary font-medium hover:underline">Start selling your code</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p: any) => (
            <div key={p._id} className="relative group">
              <ProductCard product={p} />
              <div className="absolute top-3 right-3 z-10 flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <Link href={`/sell?edit=${p._id}`}>
                  <button className="p-2 bg-background border border-border text-foreground rounded-lg hover:bg-muted shadow-sm" title="Edit Project">
                    <Edit className="w-4 h-4" />
                  </button>
                </Link>
                <button onClick={() => onDeleteProduct(p._id)} className="p-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 shadow-sm" title="Delete Project">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Purchased Projects Section */}
      <div className="mt-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Library className="h-5 w-5 text-primary" />
            My Purchased Projects ({purchasedItems.length})
          </h2>
          <Link href="/library" className="text-sm font-medium text-primary hover:underline">
            View Library
          </Link>
        </div>
        {orders.isLoading ? (
          <div className="grid min-h-[20vh] place-items-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : purchasedItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-12 text-center text-muted-foreground">
            <p>You haven't bought any projects yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {purchasedItems.slice(0, 3).map(({ item }) => <ProductCard key={item.product?._id} product={item.product as any} />)}
          </div>
        )}
      </div>
    </div>
  );
}