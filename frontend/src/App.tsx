import { Suspense } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Provider as ReduxProvider } from "react-redux";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Layout } from "@/components/Layout";
import { Protected } from "@/components/Protected";
import { useSession } from "@/hooks/useAuth";
import { store } from "@/store";
import { queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

import Home from "@/pages/Home";
import Products from "@/pages/Products";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Sell from "@/pages/Sell";
import ProductDetail from "@/pages/ProductDetail";
import Profile from "@/pages/Profile";
import PublicProfile from "@/pages/PublicProfile";
import Dashboard from "@/pages/Dashboard";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import CheckoutSuccess from "@/pages/CheckoutSuccess";
import CheckoutCancel from "@/pages/CheckoutCancel";
import Library from "@/pages/Library";
import Orders from "@/pages/Orders";
import NotFound from "@/pages/not-found";

function PageFallback() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}

function SessionBootstrap({ children }: { children: React.ReactNode }) {
  useSession();
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Layout>
      <Suspense fallback={<PageFallback />}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/products" component={Products} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/products/:slug" component={ProductDetail} />
          <Route path="/sell">{() => <Protected><Sell /></Protected>}</Route>
          <Route path="/profile">{() => <Protected><Profile /></Protected>}</Route>
          <Route path="/user/:id" component={PublicProfile} />
          <Route path="/dashboard">{() => <Protected><Dashboard /></Protected>}</Route>
          <Route path="/cart" component={Cart} />
          <Route path="/checkout">{() => <Protected><Checkout /></Protected>}</Route>
          <Route path="/checkout/success">{() => <Protected><CheckoutSuccess /></Protected>}</Route>
          <Route path="/checkout/cancel">{() => <Protected><CheckoutCancel /></Protected>}</Route>
          <Route path="/library">{() => <Protected><Library /></Protected>}</Route>
          <Route path="/orders">{() => <Protected><Orders /></Protected>}</Route>
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </Layout>
  );
}

export default function App() {
  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <SessionBootstrap>
            <WouterRouter>
              <AppRoutes />
            </WouterRouter>
          </SessionBootstrap>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
}
