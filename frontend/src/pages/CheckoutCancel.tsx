import { Link } from "wouter";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutCancel() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
      <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full bg-destructive/10 text-destructive">
        <XCircle className="h-8 w-8" />
      </div>
      <h1 className="text-3xl font-bold">Checkout cancelled</h1>
      <p className="mt-2 text-muted-foreground">No charge was made. Your cart is still saved.</p>
      <div className="mt-7 flex justify-center gap-3">
        <Link href="/cart"><Button>Back to cart</Button></Link>
        <Link href="/products"><Button variant="outline">Keep browsing</Button></Link>
      </div>
    </div>
  );
}
