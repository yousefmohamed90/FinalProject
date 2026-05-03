import { useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/store";
import { clearCart } from "@/store/cartSlice";
import { useQueryClient } from "@tanstack/react-query";

export default function CheckoutSuccess() {
  const dispatch = useAppDispatch();
  const qc = useQueryClient();

  useEffect(() => {
    dispatch(clearCart());
    qc.invalidateQueries({ queryKey: ["orders"] });
  }, [dispatch, qc]);

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
      <motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 15 }} className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
        <CheckCircle2 className="h-8 w-8" />
      </motion.div>
      <h1 className="text-3xl font-bold">Thank you!</h1>
      <p className="mt-2 text-muted-foreground">Your order is being processed. You'll receive a confirmation email shortly.</p>
      <div className="mt-7 flex justify-center gap-3">
        <Link href="/library"><Button className="bg-primary text-primary-foreground hover:bg-primary/90">Go to library</Button></Link>
        <Link href="/products"><Button variant="outline">Keep browsing</Button></Link>
      </div>
    </div>
  );
}
