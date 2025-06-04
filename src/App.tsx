
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { navItems } from "./nav-items";
import Layout from "./components/layout/Layout";
import { ReactErrorBoundary } from "./components/error/ReactErrorBoundary";
import { ConsoleErrorLogger } from "./components/debug/ConsoleErrorLogger";

// Import all developer pages
import Developer from "./pages/Developer";
import ServiceManagement from "./pages/developer/ServiceManagement";
import OrganizationManagement from "./pages/developer/OrganizationManagement";
import ShoppingControls from "./pages/developer/ShoppingControls";
import DeveloperPortal from "./pages/DeveloperPortal";
import ServiceDataDebugPage from "./pages/ServiceDataDebug";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error) => {
        console.error(`Query failed (attempt ${failureCount + 1}):`, error);
        return failureCount < 2;
      },
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ReactErrorBoundary>
      <ConsoleErrorLogger />
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Main application routes */}
            {navItems.map(({ to, page }) => (
              <Route key={to} path={to} element={<Layout>{page}</Layout>} />
            ))}
            
            {/* Developer Console Routes */}
            <Route path="/developer" element={<Layout><Developer /></Layout>} />
            <Route path="/developer/service-management" element={<Layout><ServiceManagement /></Layout>} />
            <Route path="/developer/organization-management" element={<Layout><OrganizationManagement /></Layout>} />
            <Route path="/developer/shopping-controls" element={<Layout><ShoppingControls /></Layout>} />
            <Route path="/developer-portal" element={<Layout><DeveloperPortal /></Layout>} />
            
            {/* Debug Routes */}
            <Route path="/debug/service-data" element={<Layout><ServiceDataDebugPage /></Layout>} />
            
            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ReactErrorBoundary>
  </QueryClientProvider>
);

export default App;
