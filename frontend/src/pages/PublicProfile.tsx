import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Package, User } from "lucide-react";
import { api } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";

export default function PublicProfile() {
  const { id } = useParams();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["user", id],
    queryFn: () => api(`/users/${id}`).catch(() => null),
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["products", "user", id],
    queryFn: () => api(`/products?author=${id}`),
  });

  if (userLoading || productsLoading) {
    return <div className="grid min-h-[60vh] place-items-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const userProducts = products?.products ?? products?.data ?? [];
  const profile = user?.user ?? user?.data ?? (userProducts.length > 0 ? userProducts[0].author : null);

  if (!profile) {
    return <div className="py-20 text-center text-muted-foreground">User not found or has no public projects.</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="rounded-2xl border border-border bg-card p-8 mb-8 flex flex-col items-center sm:flex-row sm:items-start gap-6">
        <div className="h-24 w-24 overflow-hidden rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary shrink-0">
          {profile.avatar ? (
            <img src={profile.avatar} alt={profile.name} className="h-full w-full object-cover" />
          ) : (
            profile.name?.[0]?.toUpperCase() ?? <User className="h-10 w-10" />
          )}
        </div>
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-bold">{profile.name}</h1>
          <p className="text-muted-foreground mt-1">{profile.email}</p>
          {profile.createdAt && (
            <p className="text-sm text-muted-foreground mt-3">Member since {new Date(profile.createdAt).toLocaleDateString()}</p>
          )}
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Package className="h-5 w-5 text-primary" />
        Projects by {profile.name}
      </h2>

      {userProducts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">This user hasn't listed any projects yet.</div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {userProducts.map((p: any) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
}