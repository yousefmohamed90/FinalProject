import { Link } from "wouter";
import { Star, ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/types";

interface Props { product: Product; }

export function ProductCard({ product }: Props) {
  const img = product.images?.[0];

  return (
    <Link href={`/products/${product.slug}`}>
      <div className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg hover:border-primary/40 transition-all duration-200 cursor-pointer">
        {/* Image */}
        <div className="aspect-video w-full overflow-hidden bg-muted relative">
          {img ? (
            <img src={img} alt={product.title}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-4xl text-muted-foreground/30">
              {"</>"}
            </div>
          )}
          {product.salePrice && (
            <div className="absolute top-2 right-2 rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
              SALE
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="mb-1">
            <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
              {product.category}
            </span>
          </div>
          <h3 className="font-semibold text-sm leading-snug line-clamp-2 mt-2 group-hover:text-primary transition-colors">
            {product.title}
          </h3>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{product.rating?.toFixed(1) ?? "0.0"}</span>
              <span>({product.numReviews ?? 0})</span>
            </div>
            <div className="flex items-center gap-2">
              {product.salePrice ? (
                <>
                  <span className="text-xs line-through text-muted-foreground">${product.price}</span>
                  <span className="font-bold text-primary">${product.salePrice}</span>
                </>
              ) : (
                <span className="font-bold text-primary">${product.price}</span>
              )}
            </div>
          </div>

          <button className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors py-2 text-sm font-medium">
            <ShoppingCart className="h-4 w-4" />
            View Details
          </button>
        </div>
      </div>
    </Link>
  );
}
