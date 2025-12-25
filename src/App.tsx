import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PaymentCallback from "./pages/PaymentCallback";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSeminar from "./pages/admin/AdminSeminar";
import AdminProgram from "./pages/admin/AdminProgram";
import AdminBenefits from "./pages/admin/AdminBenefits";
import AdminPromoCodes from "./pages/admin/AdminPromoCodes";
import AdminInscriptions from "./pages/admin/AdminInscriptions";
import AdminFooter from "./pages/admin/AdminFooter";
import AdminFiles from "./pages/admin/AdminFiles";
import AdminLogos from "./pages/admin/AdminLogos";
import { AdminLayout } from "./components/admin/AdminLayout";
import { ProtectedRoute } from "./components/admin/ProtectedRoute";

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
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/payment-callback" element={<PaymentCallback />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="seminar" element={<AdminSeminar />} />
            <Route path="program" element={<AdminProgram />} />
            <Route path="benefits" element={<AdminBenefits />} />
              <Route path="promo-codes" element={<AdminPromoCodes />} />
              <Route path="inscriptions" element={<AdminInscriptions />} />
              <Route path="footer" element={<AdminFooter />} />
              <Route path="files" element={<AdminFiles />} />
              <Route path="logos" element={<AdminLogos />} />
            </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
