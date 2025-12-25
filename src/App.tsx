import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PaymentCallback from "./pages/PaymentCallback";
import { AdminLayout } from "./components/admin/AdminLayout";
import { ProtectedRoute } from "./components/admin/ProtectedRoute";

// Lazy load admin pages
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminSeminar = lazy(() => import("./pages/admin/AdminSeminar"));
const AdminProgram = lazy(() => import("./pages/admin/AdminProgram"));
const AdminBenefits = lazy(() => import("./pages/admin/AdminBenefits"));
const AdminPromoCodes = lazy(() => import("./pages/admin/AdminPromoCodes"));
const AdminInscriptions = lazy(() => import("./pages/admin/AdminInscriptions"));
const AdminFooter = lazy(() => import("./pages/admin/AdminFooter"));
const AdminFiles = lazy(() => import("./pages/admin/AdminFiles"));
const AdminLogos = lazy(() => import("./pages/admin/AdminLogos"));

// Loading fallback component
const AdminPageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Retry jusqu'à 3 fois pour les erreurs réseau
        if (failureCount < 3) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
            return true;
          }
        }
        return false;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/payment-callback" element={<PaymentCallback />} />
          <Route 
            path="/admin/login" 
            element={
              <Suspense fallback={<AdminPageLoader />}>
                <AdminLogin />
              </Suspense>
            } 
          />
          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route 
              index 
              element={
                <Suspense fallback={<AdminPageLoader />}>
                  <AdminDashboard />
                </Suspense>
              } 
            />
            <Route 
              path="seminar" 
              element={
                <Suspense fallback={<AdminPageLoader />}>
                  <AdminSeminar />
                </Suspense>
              } 
            />
            <Route 
              path="program" 
              element={
                <Suspense fallback={<AdminPageLoader />}>
                  <AdminProgram />
                </Suspense>
              } 
            />
            <Route 
              path="benefits" 
              element={
                <Suspense fallback={<AdminPageLoader />}>
                  <AdminBenefits />
                </Suspense>
              } 
            />
            <Route 
              path="promo-codes" 
              element={
                <Suspense fallback={<AdminPageLoader />}>
                  <AdminPromoCodes />
                </Suspense>
              } 
            />
            <Route 
              path="inscriptions" 
              element={
                <Suspense fallback={<AdminPageLoader />}>
                  <AdminInscriptions />
                </Suspense>
              } 
            />
            <Route 
              path="footer" 
              element={
                <Suspense fallback={<AdminPageLoader />}>
                  <AdminFooter />
                </Suspense>
              } 
            />
            <Route 
              path="files" 
              element={
                <Suspense fallback={<AdminPageLoader />}>
                  <AdminFiles />
                </Suspense>
              } 
            />
            <Route 
              path="logos" 
              element={
                <Suspense fallback={<AdminPageLoader />}>
                  <AdminLogos />
                </Suspense>
              } 
            />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
