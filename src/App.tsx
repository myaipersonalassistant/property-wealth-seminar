
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import Index from "./pages/Index";
import Disclaimer from "./pages/Disclaimer";
import Booking from "./pages/Booking";
import BookPurchase from "./pages/BookPurchase";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancelled from "./pages/PaymentCancelled";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRouteGuard from "./components/AdminRouteGuard";
import AdminMetrics from "./pages/AdminMetrics";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/disclaimer" element={<Disclaimer />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/book" element={<BookPurchase />} />
            {/* Payment success routes - support both /payment-success and /success */}
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/success" element={<PaymentSuccess />} />
            {/* Payment cancelled routes - support both /payment-cancelled and /cancelled */}
            <Route path="/payment-cancelled" element={<PaymentCancelled />} />
            <Route path="/cancelled" element={<PaymentCancelled />} />
            {/* Admin routes */}
            <Route
              path="/admin/login"
              element={
                <AdminRouteGuard requireAuth={false}>
                  <AdminLogin />
                </AdminRouteGuard>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <AdminRouteGuard requireAuth={true}>
                  <AdminDashboard />
                </AdminRouteGuard>
              }
            />
            <Route
              path="/admin/metrics"
              element={
                <AdminRouteGuard requireAuth={true}>
                  <AdminMetrics />
                </AdminRouteGuard>
              }
            />
            {/* Catch-all for other admin routes - redirect to dashboard if authenticated, login if not */}
            <Route
              path="/admin/*"
              element={
                <AdminRouteGuard requireAuth={true}>
                  <AdminDashboard />
                </AdminRouteGuard>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;