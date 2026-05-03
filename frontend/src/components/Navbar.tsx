import { Link, useLocation } from "wouter";
import { ShoppingBag, Upload, LogOut, Menu, X, Code2, Moon, Sun, UserCircle } from "lucide-react";
import { useState } from "react";
import { useAuth, useLogout } from "@/hooks/useAuth";
import { useTheme } from "@/components/ThemeProvider";
import { toast } from "sonner";
import { useAppSelector } from "@/store";

export function Navbar() {
  const [, navigate] = useLocation();
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const logout = useLogout();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  const cartItems = useAppSelector((s) => s.cart.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  function handleLogout() {
    logout.mutate(undefined, {
      onSuccess: () => { toast.success("Logged out"); navigate("/"); },
    });
  }

  const links = [
    { href: "/", label: "Shop", icon: ShoppingBag },
    { href: "/sell", label: "Sell a Project", icon: Upload },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Code2 className="h-4 w-4" />
          </div>
          <span>CodeHub</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors
                ${location === href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
              <Icon className="h-4 w-4" />{label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-2">
          <button onClick={toggle}
            className="rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <Link href="/cart" className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {cartCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted transition-colors cursor-pointer">
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="h-6 w-6 rounded-full object-cover" />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <span className="font-medium">{user?.name}</span>
              </Link>
              <Link href="/profile"
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <UserCircle className="h-4 w-4" />Profile
              </Link>
              <button onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <LogOut className="h-4 w-4" />Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                Login
              </Link>
              <Link href="/register"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                Sign up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <button onClick={toggle} className="p-2 text-muted-foreground">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          
          <Link href="/cart" className="relative p-2 text-muted-foreground">
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {cartCount}
              </span>
            )}
          </Link>

          <button className="p-2" onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-background px-4 py-3 space-y-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium
                ${location === href ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
              <Icon className="h-4 w-4" />{label}
            </Link>
          ))}
          <div className="pt-2 border-t border-border">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" onClick={() => setOpen(false)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted">
                  <UserCircle className="h-4 w-4" /> Dashboard
                </Link>
                <Link href="/profile" onClick={() => setOpen(false)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted">
                  <UserCircle className="h-4 w-4" /> Edit Profile
                </Link>
                <button onClick={() => { handleLogout(); setOpen(false); }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted">
                  <LogOut className="h-4 w-4" /> Logout ({user?.name})
                </button>
              </>
            ) : (
              <div className="space-y-1">
                <Link href="/login" onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted">
                  Login
                </Link>
                <Link href="/register" onClick={() => setOpen(false)}
                  className="flex items-center justify-center rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
