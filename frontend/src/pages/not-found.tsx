import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="grid min-h-[70vh] place-items-center text-center">
      <div>
        <div className="text-8xl font-black text-primary/20 select-none">404</div>
        <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
        <p className="mt-2 text-muted-foreground">The page you're looking for doesn't exist.</p>
        <Link href="/">
          <button className="mt-6 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
            Back to Shop
          </button>
        </Link>
      </div>
    </div>
  );
}
