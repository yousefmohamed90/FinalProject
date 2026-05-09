import { Link } from "wouter";
import { Download, Loader2, Library as LibraryIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/EmptyState";
import { useMyOrders } from "@/hooks/useOrders";
import { useDownloadProduct } from "@/hooks/useProducts";
import { toast } from "sonner";

export default function Library() {
  const orders = useMyOrders();
  const download = useDownloadProduct();

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

  async function onDownload(productId: string) {
    try {
      const res = await download.mutateAsync(productId);
      const finalUrl = res.sourceCodeUrl || res.url;

      // جلب الملف وإجبار المتصفح على حفظه بصيغة Zip
      try {
        const fileRes = await fetch(finalUrl, { mode: 'cors' });
        if (!fileRes.ok) throw new Error("Fetch failed");
        
        const blob = await fileRes.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = "project-source-code.zip";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      } catch (err) {
        // Fallback: Use a hidden anchor to trigger download if fetch fails (e.g. CORS)
        const a = document.createElement("a");
        a.href = finalUrl;
        a.setAttribute("download", "project-source-code.zip");
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Download failed");
    }
  }

  if (orders.isLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Your library</h1>
        <p className="mt-1 text-sm text-muted-foreground">{purchasedItems.length} purchased products</p>
      </div>

      {purchasedItems.length === 0 ? (
        <EmptyState
          icon={LibraryIcon}
          title="Your library is empty"
          description="Once you purchase products, they'll appear here for instant download."
          action={<Link href="/products"><Button>Browse marketplace</Button></Link>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {purchasedItems.map(({ order, item }, i) => {
            const p = item.product;
            return (
              <div key={`${order._id}-${i}`} className="flex gap-4 rounded-xl border border-border/60 bg-card p-4">
                <div className="h-24 w-32 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {p?.images?.[0] ? <img src={p.images[0]} alt="" className="h-full w-full object-cover" /> : null}
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link href={`/products/${p?.slug}`} className="font-semibold hover:text-primary">{p?.title}</Link>
                      <div className="mt-0.5 text-xs text-muted-foreground">Purchased on {new Date(order.createdAt).toLocaleDateString()}</div>
                    </div>
                    <Badge variant="secondary" className="font-mono text-[10px]">v{p?.version ?? "1.0.0"}</Badge>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <span className="text-xs text-muted-foreground">{p?.category}</span>
                    <Button size="sm" onClick={() => onDownload(p._id)} disabled={download.isPending} className="bg-primary text-primary-foreground hover:bg-primary/90">
                      <Download className="mr-2 h-3.5 w-3.5" /> Download
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
