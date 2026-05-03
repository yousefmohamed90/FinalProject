import { Link } from "wouter";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-sidebar/40">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="space-y-3">
          <Logo size="md" />
          <p className="text-sm text-muted-foreground">
            The premium marketplace for production-ready source code, themes, and developer tools.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Marketplace</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/products" className="hover:text-foreground">Browse all</Link></li>
            <li><Link href="/products?sort=trending" className="hover:text-foreground">Trending</Link></li>
            <li><Link href="/products?sort=newest" className="hover:text-foreground">New arrivals</Link></li>
            <li><Link href="/products?category=themes" className="hover:text-foreground">Themes</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Account</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/login" className="hover:text-foreground">Sign in</Link></li>
            <li><Link href="/register" className="hover:text-foreground">Create account</Link></li>
            <li><Link href="/library" className="hover:text-foreground">My library</Link></li>
            <li><Link href="/orders" className="hover:text-foreground">My orders</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><span>About</span></li>
            <li><span>Terms</span></li>
            <li><span>Privacy</span></li>
            <li><span>Contact</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 px-4 py-5 text-center text-xs text-muted-foreground sm:px-6">
        © {new Date().getFullYear()} CodeSource. Crafted for developers.
      </div>
    </footer>
  );
}
