import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSeminar from "./pages/admin/AdminSeminar";
import AdminProgram from "./pages/admin/AdminProgram";
import AdminBenefits from "./pages/admin/AdminBenefits";
import AdminPromoCodes from "./pages/admin/AdminPromoCodes";
import AdminInscriptions from "./pages/admin/AdminInscriptions";
import AdminFooter from "./pages/admin/AdminFooter";
import { AdminLayout } from "./components/admin/AdminLayout";
import { ProtectedRoute } from "./components/admin/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="seminar" element={<AdminSeminar />} />
            <Route path="program" element={<AdminProgram />} />
            <Route path="benefits" element={<AdminBenefits />} />
            <Route path="promo-codes" element={<AdminPromoCodes />} />
            <Route path="inscriptions" element={<AdminInscriptions />} />
            <Route path="footer" element={<AdminFooter />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
