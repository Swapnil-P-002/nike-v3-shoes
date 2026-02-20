import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { ThemeProvider } from "next-themes";
import { OrderProvider } from "@/context/OrderContext";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { AdminProvider } from "@/context/AdminContext";
import { useEffect, lazy, Suspense } from "react";
import { productService } from "@/services/productService";
import { Loader2 } from "lucide-react";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Shop = lazy(() => import("./pages/Shop"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Login = lazy(() => import("./pages/Login"));
const Profile = lazy(() => import("./pages/Profile"));
const Orders = lazy(() => import("./pages/Orders"));
const NotFound = lazy(() => import("./pages/NotFound"));

const PageLoader = () => (
  <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-[100]">
    <div className="relative">
      <Loader2 className="w-12 h-12 text-accent animate-spin" />
      <div className="absolute inset-0 blur-xl bg-accent/20 animate-pulse" />
    </div>
    <p className="mt-4 font-black italic uppercase tracking-widest text-xs animate-pulse">Initializing Elite Gear...</p>
  </div>
);

const queryClient = new QueryClient();

const App = () => {


  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <TooltipProvider>
          <AdminProvider>
            <AuthProvider>
              <WishlistProvider>
                <OrderProvider>
                  <CartProvider>
                    <Toaster />
                    <Sonner />
                    <BrowserRouter>
                      <ScrollToTop />
                      <Suspense fallback={<PageLoader />}>
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/shop" element={<Shop />} />
                          <Route path="/about" element={<About />} />
                          <Route path="/contact" element={<Contact />} />
                          <Route path="/login" element={<Login />} />
                          <Route
                            path="/profile"
                            element={
                              <ProtectedRoute>
                                <Profile />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/orders"
                            element={
                              <ProtectedRoute>
                                <Orders />
                              </ProtectedRoute>
                            }
                          />
                          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </Suspense>
                    </BrowserRouter>
                  </CartProvider>
                </OrderProvider>
              </WishlistProvider>
            </AuthProvider>
          </AdminProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
