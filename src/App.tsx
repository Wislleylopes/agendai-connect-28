import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { PublicRoute, ClientRoute, ProfessionalRoute, AdminRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import AdminDashboard from "./pages/AdminDashboard";
import ProfessionalDashboard from "./pages/ProfessionalDashboard";
import NotFound from "./pages/NotFound";
import ClientDashboard from "./pages/ClientDashboard";
import UserInfoPage from "./pages/UserInfoPage";
import { EnhancedClientDashboard } from "./pages/EnhancedClientDashboard";
import { EnhancedProfessionalDashboard } from "./pages/EnhancedProfessionalDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<PublicRoute><Index /></PublicRoute>} />
              <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
              <Route path="/signup" element={<PublicRoute><SignUpPage /></PublicRoute>} />
              <Route path="/dashboard" element={<ProfessionalRoute><Dashboard /></ProfessionalRoute>} />
              <Route path="/client-dashboard" element={<ClientRoute><EnhancedClientDashboard /></ClientRoute>} />
              <Route path="/professional-dashboard" element={<ProfessionalRoute><EnhancedProfessionalDashboard /></ProfessionalRoute>} />
              <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/user-info" element={<UserInfoPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
