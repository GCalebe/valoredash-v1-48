import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import MetricsDashboard from "./pages/MetricsDashboard";
import KnowledgeManager from "./pages/KnowledgeManager";
import KnowledgeBase from "./pages/KnowledgeBase";
import ClientsDashboard from "./pages/ClientsDashboard";
import Disparador from './pages/Disparador';
import Prospectar from './pages/Prospectar';

import Evolution from "./pages/Evolution";
import Schedule from "./pages/Schedule";
import ThemeSettings from "./pages/ThemeSettings";
import AdminDashboard from "./pages/AdminDashboard";
import AIStore from "./pages/AIStore";
import Pricing from "./pages/Pricing";
import Subscription from "./pages/Subscription";
import UserManagement from "./pages/UserManagement";
import Profile from "./pages/Profile";
import Conversations from "./pages/Conversations";
import Reports from "./pages/Reports";
import Connections from "./pages/Connections";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ThemeSettingsProvider } from "./context/ThemeSettingsContext";
import AppLayout from "./components/AppLayout";
import { QueryProviderWithErrorBoundary } from "./providers/QueryProvider";

const App = () => (
  <QueryProviderWithErrorBoundary>
    <ThemeProvider defaultTheme="dark">
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
                  <Route path="/chats" element={<Conversations />} />
                  <Route path="/knowledge" element={<KnowledgeManager />} />
                  <Route path="/knowledge-base" element={<KnowledgeBase />} />
                  <Route path="/disparador" element={<Disparador />} />
            <Route path="/prospectar" element={<Prospectar />} />
                  <Route path="/clients" element={<ClientsDashboard />} />
                  <Route path="/evolution" element={<Evolution />} />
                  <Route path="/schedule" element={<Schedule />} />
                  {/* ScheduleTestComponent route was removed */}
                  <Route path="/theme-settings" element={<ThemeSettings />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/user-management" element={<UserManagement />} />
                  <Route path="/profile" element={<Profile />} />
                  {/* Temporariamente redirecionando a loja IA para o dashboard */}
                  <Route path="/ai-store" element={<Navigate to="/dashboard" replace />} />
                  {/* Redirecionando contratos para o dashboard */}
                  <Route path="/contracts" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/subscription" element={<Subscription />} />

                  <Route path="/reports" element={<Reports />} />
                  <Route path="/connections" element={<Connections />} />
                  <Route path="/settings" element={<Settings />} />
                  {/* PersonalityConfigDemo route was removed */}
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