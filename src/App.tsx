import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import MetricsDashboard from "./pages/MetricsDashboard";
import ChatsDashboard from "./pages/ChatsDashboard";
import KnowledgeManager from "./pages/KnowledgeManager";
import ClientsDashboard from "./pages/ClientsDashboard";
import Evolution from "./pages/Evolution";
import Schedule from "./pages/Schedule";
import ThemeSettings from "./pages/ThemeSettings";
import AdminDashboard from "./pages/AdminDashboard";
import AIStore from "./pages/AIStore";
import Pricing from "./pages/Pricing";
import Subscription from "./pages/Subscription";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ThemeSettingsProvider } from "./context/ThemeSettingsContext";
import AppLayout from "./components/AppLayout";
import { QueryProviderWithErrorBoundary } from "./providers/QueryProvider";

const App = () => (
  <QueryProviderWithErrorBoundary>
    <ThemeProvider defaultTheme="light">
      <ThemeSettingsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/metrics" element={<MetricsDashboard />} />
                  <Route path="/analytics-portals" element={<Navigate to="/metrics" replace />} />
                  <Route path="/chats" element={<ChatsDashboard />} />
                  <Route path="/knowledge" element={<KnowledgeManager />} />
                  <Route path="/clients" element={<ClientsDashboard />} />
                  <Route path="/evolution" element={<Evolution />} />
                  <Route path="/schedule" element={<Schedule />} />
                  <Route path="/theme-settings" element={<ThemeSettings />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  {/* Temporariamente redirecionando a loja IA para o dashboard */}
                  <Route path="/ai-store" element={<Navigate to="/dashboard" replace />} />
                  {/* Redirecionando contratos para o dashboard */}
                  <Route path="/contracts" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/subscription" element={<Subscription />} />
                </Route>
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeSettingsProvider>
    </ThemeProvider>
  </QueryProviderWithErrorBoundary>
);

export default App;