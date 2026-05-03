import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Filter, Loader2, PackageOpen, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductCard } from "@/components/ProductCard";
import { EmptyState } from "@/components/EmptyState";
import { useCategories, useProducts } from "@/hooks/useProducts";

function useQueryParams() {
  const [location] = useLocation();
  return useMemo(() => {
    const idx = location.indexOf("?");
    const search = idx >= 0 ? location.slice(idx) : "";
    return new URLSearchParams(search);
  }, [location]);
}

export default function Products() {
  const params = useQueryParams();
  const [, navigate] = useLocation();

  const [search, setSearch] = useState(params.get("search") ?? "");
  const [category, setCategory] = useState(params.get("category") ?? "all");
  const [sort, setSort] = useState(params.get("sort") ?? "popular");
  const [minPrice, setMinPrice] = useState(params.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(params.get("maxPrice") ?? "");
  const [page, setPage] = useState(Number(params.get("page") ?? "1"));

  useEffect(() => {
    setSearch(params.get("search") ?? "");
    setCategory(params.get("category") ?? "all");
    setSort(params.get("sort") ?? "popular");
  }, [params]);

  const { data, isLoading } = useProducts({
    search: search || undefined,
    category: category !== "all" ? category : undefined,
    sort,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    page,
    limit: 12,
  });
  const categoriesQ = useCategories();

  const productsList = data?.products ?? data?.data ?? [];
  const categoriesList = Array.isArray(categoriesQ.data) ? categoriesQ.data : (categoriesQ.data?.categories ?? categoriesQ.data?.data ?? []);

  function applyFilters(e?: React.FormEvent) {
    e?.preventDefault();
    const sp = new URLSearchParams();
    if (search) sp.set("search", search);
    if (category && category !== "all") sp.set("category", category);
    if (sort) sp.set("sort", sort);
    if (minPrice) sp.set("minPrice", minPrice);
    if (maxPrice) sp.set("maxPrice", maxPrice);
    if (page > 1) sp.set("page", String(page));
    const qs = sp.toString();
    navigate(qs ? `/products?${qs}` : "/products");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {data?.total ?? 0} products available
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* SIDEBAR FILTERS */}
        <aside className="space-y-6">
          <form onSubmit={applyFilters} className="space-y-5 rounded-xl border border-border/60 bg-card p-5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Search</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Find anything..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categoriesList.map((c: any) => (
                    <SelectItem key={c.name || c._id} value={c.name || c._id}>
                      {c.name || c._id} ({c.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Price range</label>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                <span className="text-muted-foreground">—</span>
                <Input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
              </div>
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              <Filter className="mr-2 h-4 w-4" /> Apply filters
            </Button>
          </form>
        </aside>

        {/* RESULTS */}
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">
              Page {data?.page ?? 1} of {data?.pages ?? 1}
            </span>
            <Select
              value={sort}
              onValueChange={(v) => {
                setSort(v);
                setTimeout(applyFilters, 0);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most popular</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="trending">Trending</SelectItem>
                <SelectItem value="price-asc">Price: low to high</SelectItem>
                <SelectItem value="price-desc">Price: high to low</SelectItem>
                <SelectItem value="rating">Top rated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="grid place-items-center py-24">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : productsList.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {productsList.map((p: any) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
              {(data?.pages ?? 0) > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => { setPage(page - 1); setTimeout(applyFilters, 0); }}>
                    Previous
                  </Button>
                  <span className="px-3 text-sm">Page {page} / {data?.pages ?? 1}</span>
                  <Button variant="outline" size="sm" disabled={page >= (data?.pages ?? 1)} onClick={() => { setPage(page + 1); setTimeout(applyFilters, 0); }}>
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              icon={PackageOpen}
              title="No products match your filters"
              description="Try adjusting your search or clearing some filters."
              action={
                <Button variant="outline" onClick={() => { setSearch(""); setCategory("all"); setMinPrice(""); setMaxPrice(""); setSort("popular"); setPage(1); navigate("/products"); }}>
                  Clear filters
                </Button>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
