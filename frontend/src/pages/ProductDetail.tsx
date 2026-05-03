import { useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { ChevronLeft, Download, Loader2, ShoppingCart, Star, Check, User } from "lucide-react";
import { useCreateReview, useDownloadProduct, useProduct, usePurchaseProduct } from "@/hooks/useProducts";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useAppDispatch } from "@/store";
import { addItem } from "@/store/cartSlice";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function ProductDetail() {
  const { slug } = useParams();
  const [, navigate] = useLocation();
  const { data: product, isLoading } = useProduct(slug);
  const { isAuthenticated, user } = useAuth();
  const download = useDownloadProduct();
  const purchase = usePurchaseProduct();
  const review = useCreateReview(product?._id ?? "");
  const dispatch = useAppDispatch();
  const qc = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [tab, setTab] = useState<"description" | "reviews">("description");
  const [editingReview, setEditingReview] = useState<any>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold">Project not found</h2>
        <Link href="/">
          <button className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Back to Shop
          </button>
        </Link>
      </div>
    );
  }

  const price = product.salePrice ?? product.price;
  const reviews = (product as any).reviews ?? [];

  async function onPurchase() {
    try {
      if (!isAuthenticated) {
        toast.error("Sign in to purchase");
        navigate("/login");
        return;
      }
      
      const authorId = typeof product?.author === "object" ? product.author?._id : product?.author;
      if (authorId && user?._id && String(authorId) === String(user._id)) {
        toast.error("You cannot purchase your own product!");
        return;
      }

      dispatch(addItem({
        productId: product?._id || "",
        slug: product?.slug || "",
        title: product?.title || "",
        price: price || 0,
        image: product?.images?.[0] || "",
        quantity: 1
      }));
      toast.success("Added to cart!");
      navigate("/cart");
    } catch (error: any) {
      console.error("Cart error:", error);
      toast.error(error?.message || "Failed to add to cart. Check console.");
    }
  }

  async function onDownload() {
    if (!isAuthenticated) {
      toast.error("Sign in to download");
      navigate("/login");
      return;
    }
    try {
      const res = await download.mutateAsync(product!._id);
      const finalUrl = res.sourceCodeUrl || res.url;

      // جلب الملف وإجبار المتصفح على حفظه بصيغة Zip
      try {
        const fileRes = await fetch(finalUrl);
        const blob = await fileRes.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = `${product?.slug || "source-code"}.zip`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      } catch (err) {
        window.open(finalUrl, "_blank"); // بديل في حالة فشل الجلب
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Download failed");
    }
  }

  async function onSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!isAuthenticated) { toast.error("Sign in to leave a review"); return; }
    try {
      await review.mutateAsync({ rating, comment });
      toast.success("Review posted!");
      setComment("");
    } catch (e: any) {
      toast.error(e?.message ?? "Could not post review");
    }
  }

  async function onDeleteReview(reviewId: string) {
    try {
      await api(`/reviews/${reviewId}`, { method: "DELETE" });
      toast.success("Review deleted");
      qc.invalidateQueries({ queryKey: ["products"] });
      setReviewToDelete(null);
    } catch (e: any) {
      toast.error(e?.message || "Failed to delete review");
    }
  }

  async function onSubmitEditReview(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api(`/reviews/${editingReview._id}`, {
        method: "PUT",
        body: JSON.stringify({ rating: editRating, comment: editComment }),
      });
      toast.success("Review updated successfully!");
      setEditingReview(null);
      qc.invalidateQueries({ queryKey: ["products"] });
    } catch (e: any) {
      toast.error(e?.message || "Failed to update review");
    }
  }

  return (
    <div>
      <Link href="/" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Back to Shop
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-video w-full overflow-hidden rounded-2xl border border-border bg-muted">
            {product.images?.[activeImage] ? (
              <img src={product.images[activeImage]} alt={product.title}
                className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full place-items-center text-5xl text-muted-foreground/20">{"</>"}</div>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((src, i) => (
                <button key={i} onClick={() => setActiveImage(i)}
                  className={`overflow-hidden rounded-xl border-2 transition-all flex-shrink-0
                    ${i === activeImage ? "border-primary" : "border-transparent opacity-50 hover:opacity-100"}`}>
                  <img src={src} alt="" className="h-16 w-24 object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div>
            <span className="rounded-full bg-accent text-accent-foreground px-3 py-1 text-xs font-medium">
              {product.category}
            </span>
            <h1 className="mt-3 text-2xl font-bold leading-tight">{product.title}</h1>
            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-foreground">{product.rating?.toFixed(1) ?? "0.0"}</span>
                <span>({product.numReviews ?? 0})</span>
              </span>
              <span className="flex items-center gap-1">
                <Download className="h-4 w-4" /> {product.downloads ?? 0} downloads
              </span>
            </div>
          </div>

          {/* Price & Actions */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-primary">${price}</span>
              {product.salePrice && product.price > product.salePrice && (
                <span className="text-lg text-muted-foreground line-through">${product.price}</span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={onPurchase}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                <ShoppingCart className="h-4 w-4" /> Add to Cart
              </button>
              <button onClick={onDownload}
                className="flex items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-medium hover:bg-muted transition-colors">
                <Download className="h-4 w-4" /> Download (if purchased)
              </button>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground pt-2 border-t border-border">
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Lifetime access</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Full source code</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Commercial license</li>
            </ul>
          </div>

          {/* Tech Stack */}
          {product.techStack?.length ? (
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Tech Stack</h4>
              <div className="flex flex-wrap gap-1.5">
                {product.techStack.map(t => (
                  <span key={t} className="rounded-lg border border-border bg-muted px-2.5 py-1 font-mono text-xs">{t}</span>
                ))}
              </div>
            </div>
          ) : null}

          {/* Seller Info */}
          {product.author && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h4 className="mb-4 text-sm font-semibold flex items-center gap-2">
                <User className="h-4 w-4" /> About the seller
              </h4>
        <div className="flex items-start gap-4">
          {product.author.avatar ? (
            <img src={product.author.avatar} alt={product.author.name} className="h-12 w-12 rounded-full object-cover" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
              {product.author.name?.[0]?.toUpperCase()}
            </div>
          )}
          <div className="space-y-1">
            <Link href={`/user/${product.author._id}`} className="font-semibold text-foreground hover:underline cursor-pointer block">
              {product.author.name}
            </Link>
            <p className="font-mono text-xs text-muted-foreground">{product.author.email}</p>
            {product.author.createdAt && (
              <p className="text-xs text-muted-foreground">Joined: {new Date(product.author.createdAt).toLocaleDateString()}</p>
            )}
          </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-10">
        <div className="flex border-b border-border gap-1 mb-6">
          {(["description", "reviews"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px
                ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {t} {t === "reviews" && `(${reviews.length})`}
            </button>
          ))}
        </div>

        {tab === "description" && (
          <div className="rounded-2xl border border-border bg-card p-6 whitespace-pre-wrap text-sm leading-relaxed">
            {product.description}
          </div>
        )}

        {tab === "reviews" && (
          <div className="space-y-5">
            <form onSubmit={onSubmitReview}
              className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <h4 className="font-semibold">Leave a review</h4>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} type="button" onClick={() => setRating(n)}>
                    <Star className={`h-6 w-6 transition-colors ${n <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                  </button>
                ))}
              </div>
              <textarea value={comment} onChange={e => setComment(e.target.value)}
                rows={3} placeholder="What did you think?"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary resize-none" />
              <button type="submit" disabled={review.isPending || !comment.trim()}
                className="rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                {review.isPending ? "Posting..." : "Post review"}
              </button>
            </form>

            {reviews.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card/40 py-12 text-center text-sm text-muted-foreground">
                No reviews yet — be the first!
              </div>
            ) : reviews.map((r: any) => (
              <div key={r._id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
                    {r.user?.name?.[0]?.toUpperCase() ?? "U"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{r.user?.name ?? "Anonymous"}</span>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} className={`h-3.5 w-3.5 ${i <= r.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
                        ))}
                      </div>
                    </div>
                    {editingReview?._id === r._id ? (
                      <form onSubmit={onSubmitEditReview} className="mt-3 space-y-3">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(n => (
                            <button key={n} type="button" onClick={() => setEditRating(n)}>
                              <Star className={`h-4 w-4 transition-colors ${n <= editRating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                            </button>
                          ))}
                        </div>
                        <textarea value={editComment} onChange={e => setEditComment(e.target.value)} rows={2} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary resize-none" />
                        <div className="flex gap-2">
                          <button type="submit" className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">Save Changes</button>
                          <button type="button" onClick={() => setEditingReview(null)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted">Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>
                        {user?._id === r.user?._id && (
                          <div className="mt-3 flex gap-3 text-xs font-medium">
                            {reviewToDelete === r._id ? (
                              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-1.5 text-destructive">
                                <span>Are you sure?</span>
                                <button onClick={() => onDeleteReview(r._id)} className="font-bold hover:underline">Yes, delete</button>
                                <button onClick={() => setReviewToDelete(null)} className="hover:underline text-muted-foreground">Cancel</button>
                              </div>
                            ) : (
                              <>
                                <button onClick={() => { setEditingReview(r); setEditRating(r.rating); setEditComment(r.comment); }} className="text-primary hover:underline">Edit</button>
                                <button onClick={() => setReviewToDelete(r._id)} className="text-destructive hover:underline">Delete</button>
                              </>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
