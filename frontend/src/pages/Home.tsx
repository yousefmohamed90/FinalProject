import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { useProducts, useCategories } from "@/hooks/useProducts";

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "price", label: "Price ↑" },
  { value: "-price", label: "Price ↓" },
  { value: "rating", label: "Top Rated" },
];

export default function Home() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useProducts({ search, category, sort, page, limit: 12 });
  const { data: catData } = useCategories();

  const products = data?.products ?? data?.data ?? [];
  const totalPages = data?.pages ?? 1;
  const total = data?.total ?? 0;
  const categories = Array.isArray(catData) ? catData : (catData?.categories ?? catData?.data ?? []);

  function clearFilters() {
    setSearch(""); setCategory(""); setSort("newest"); setPage(1);
  }
  const hasFilters = !!(search || category || sort !== "newest");

  return (
    <div>
      {/* Hero */}
      <div className="mb-8 rounded-2xl bg-gradient-to-br from-primary/10 via-accent to-background border border-primary/20 px-6 py-10 text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">Buy & Sell Source Code</h1>
        <p className="mt-2 text-muted-foreground">
          Discover ready-made projects — dashboards, chatbots, SaaS templates & more
        </p>
        <div className="mx-auto mt-6 flex max-w-xl items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-primary">
          <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <input value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search projects..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
          {search && (
            <button onClick={() => setSearch("")} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <SlidersHorizontal className="h-4 w-4" />
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => { setCategory(""); setPage(1); }}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors
              ${!category ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
            All
          </button>
          {categories.map(c => (
            <button key={c.name || c._id} onClick={() => { setCategory(c.name || c._id); setPage(1); }}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors
                ${category === (c.name || c._id) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
              {c.name || c._id} <span className="opacity-60">({c.count})</span>
            </button>
          ))}
        </div>
        <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}
          className="ml-auto rounded-lg border border-border bg-background px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary">
          {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        {hasFilters && (
          <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <X className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      {total > 0 && (
        <p className="mb-4 text-sm text-muted-foreground">{total} project{total !== 1 ? "s" : ""} found</p>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden animate-pulse">
              <div className="aspect-video bg-muted" />
              <div className="p-4 space-y-2">
                <div className="h-3 w-16 rounded bg-muted" />
                <div className="h-4 w-3/4 rounded bg-muted" />
                <div className="h-3 w-1/2 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          <div className="text-5xl mb-4">🔍</div>
          <p className="font-medium">No projects found</p>
          <p className="text-sm mt-1">Try a different search or category</p>
          {hasFilters && (
            <button onClick={clearFilters}
              className="mt-4 rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-40 hover:bg-muted transition-colors">
            ← Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
            <button key={n} onClick={() => setPage(n)}
              className={`rounded-lg px-4 py-2 text-sm transition-colors ${n === page ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted"}`}>
              {n}
            </button>
          ))}
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
            className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-40 hover:bg-muted transition-colors">
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
