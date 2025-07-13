import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthErrorBoundary } from '@/components/auth/AuthErrorBoundary';
import { DatabaseInitializer } from '@/components/database/DatabaseInitializer';
import { Layout } from '@/components/layout/Layout';
import { useAuthUser } from '@/hooks/useAuthUser';
import Dashboard from '@/pages/Dashboard';
import AuthRoutes from '@/pages/AuthRoutes';
import Profile from '@/pages/Profile';
import ServiceCatalog from '@/pages/ServiceCatalog';
import ServiceCategory from '@/pages/ServiceCategory';
import ServiceSubcategory from '@/pages/ServiceSubcategory';
import ServiceJob from '@/pages/ServiceJob';
import WorkOrders from '@/pages/WorkOrders';
import Customers from '@/pages/Customers';
import Inventory from '@/pages/Inventory';
import Invoices from '@/pages/Invoices';
import Calendar from '@/pages/Calendar';
import Quotes from '@/pages/Quotes';
import Team from '@/pages/Team';
import Documents from '@/pages/Documents';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import CustomerCommunications from '@/pages/CustomerCommunications';
import CallLogger from '@/pages/CallLogger';
import ServiceBoard from '@/pages/ServiceBoard';
import CompanyProfile from '@/pages/CompanyProfile';
import VehiclesPage from '@/pages/VehiclesPage';
import StockControl from '@/pages/StockControl';
import PurchaseOrders from '@/pages/PurchaseOrders';
import ServiceReminders from '@/pages/ServiceReminders';
import StaffMembers from '@/pages/StaffMembers';
import DeveloperPortal from '@/pages/DeveloperPortal';
import RepairPlans from '@/pages/RepairPlans';
import ToolDetailPage from '@/pages/ToolDetailPage';
import ToolCategoryPage from '@/pages/ToolCategoryPage';
import Analytics from '@/pages/Analytics';
import Equipment from '@/pages/Equipment';
import Maintenance from '@/pages/Maintenance';
import Feedback from '@/pages/Feedback';
import Forms from '@/pages/Forms';
import Chat from '@/pages/Chat';
import Notifications from '@/pages/Notifications';
import Shopping from '@/pages/Shopping';
import ProductDetail from '@/pages/ProductDetail';
import Checkout from '@/pages/Checkout';
import Help from '@/pages/Help';
import { ContextualHelpWidget } from '@/components/help/ContextualHelpWidget';
import Developer from '@/pages/Developer';
import { OrdersPage } from '@/components/shopping/orders/OrdersPage';
import { OrderDetailsPage } from '@/components/shopping/orders/OrderDetailsPage';
import { WishlistPage } from '@/components/shopping/wishlist/WishlistPage';
import AIHub from '@/pages/AIHub';

function App() {
  const { isAuthenticated, isLoading } = useAuthUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <DatabaseInitializer>
      <AuthErrorBoundary>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/auth/*" element={<AuthRoutes />} />
            
            {/* Protected routes - all wrapped with Layout */}
            <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth" replace />} />
            <Route path="/dashboard" element={isAuthenticated ? <Layout><Dashboard /></Layout> : <Navigate to="/auth" replace />} />
            <Route path="/profile" element={isAuthenticated ? <Layout><Profile /></Layout> : <Navigate to="/auth" replace />} />
            
            {/* Work Orders */}
            <Route path="/work-orders/*" element={isAuthenticated ? <Layout><WorkOrders /></Layout> : <Navigate to="/auth" replace />} />
            
            {/* Services */}
            <Route path="/services" element={isAuthenticated ? <Layout><ServiceCatalog /></Layout> : <Navigate to="/auth" replace />} />
            <Route path="/service-library" element={isAuthenticated ? <Layout><ServiceCatalog /></Layout> : <Navigate to="/auth" replace />} />
            <Route path="/services/category/:categoryId" element={isAuthenticated ? <Layout><ServiceCategory /></Layout> : <Navigate to="/auth" replace />} />
            <Route path="/services/category/:categoryId/subcategory/:subcategoryId" element={isAuthenticated ? <Layout><ServiceSubcategory /></Layout> : <Navigate to="/auth" replace />} />
            <Route path="/services/job/:jobId" element={isAuthenticated ? <Layout><ServiceJob /></Layout> : <Navigate to="/auth" replace />} />
            
            {/* Real application routes */}
            <Route path="/customers/*" element={isAuthenticated ? <Layout><Customers /></Layout> : <Navigate to="/auth" replace />} />
            <Route path="/inventory/*" element={isAuthenticated ? <Layout><Inventory /></Layout> : <Navigate to="/auth" replace />} />
            <Route path="/invoices/*" element={isAuthenticated ? <Layout><Invoices /></Layout> : <Navigate to="/auth" replace />} />
            <Route path="/calendar" element={isAuthenticated ? <Layout><Calendar /></Layout> : <Navigate to="/auth" replace />} />
            <Route path="/quotes/*" element={isAuthenticated ? <Layout><Quotes /></Layout> : <Navigate to="/auth" replace />} />
            <Route path="/team/*" element={isAuthenticated ? <Layout><Team /></Layout> : <Navigate to="/auth" replace />} />
            <Route path="/documents" element={isAuthenticated ? <Layout><Documents /></Layout> : <Navigate to="/auth" replace />} />
            <Route path="/reports" element={isAuthenticated ? <Layout><Reports /></Layout> : <Navigate to="/auth" replace />} />
            
            {/* Settings - comprehensive functionality exists */}
            <Route path="/settings/*" element={isAuthenticated ? <Layout><Settings /></Layout> : <Navigate to="/auth" replace />} />
            
            {/* Missing functionality routes */}
            <Route path="/customer-comms" element={isAuthenticated ? <Layout><CustomerCommunications /></Layout> : <Navigate to="/auth" replace />} />
            <Route path="/call-logger" element={isAuthenticated ? <Layout><CallLogger /></Layout> : <Navigate to="/auth" replace />} />
            <Route path="/service-board" element={isAuthenticated ? <Layout><ServiceBoard /></Layout> : <Navigate to="/auth" replace />} />
            <Route path="/company-profile" element={isAuthenticated ? <Layout><CompanyProfile /></Layout> : <Navigate to="/auth" replace />} />
            <Route path="/vehicles" element={isAuthenticated ? <Layout><VehiclesPage /></Layout> : <Navigate to="/auth" replace />} />
            <Route path="/stock-control" element={isAuthenticated ? <Layout><StockControl /></Layout> : <Navigate to="/auth" replace />} />
            <Route path="/purchase-orders" element={isAuthenticated ? <Layout><PurchaseOrders /></Layout> : <Navigate to="/auth" replace />} />
            <Route path="/service-reminders" element={isAuthenticated ? <Layout><ServiceReminders /></Layout> : <Navigate to="/auth" replace />} />
            <Route path="/staff-members" element={isAuthenticated ? <Layout><StaffMembers /></Layout> : <Navigate to="/auth" replace />} />
            
            {/* Developer Portal - Admin access required */}
            <Route path="/developer/*" element={isAuthenticated ? <Layout><DeveloperPortal /></Layout> : <Navigate to="/auth" replace />} />
            
            {/* Additional pages */}
            <Route path="/repair-plans" element={isAuthenticated ? <Layout><RepairPlans /></Layout> : <Navigate to="/auth" replace />} />
            <Route path="/tools/:category/:toolId" element={isAuthenticated ? <Layout><ToolDetailPage /></Layout> : <Navigate to="/auth" replace />} />
            <Route path="/analytics" element={isAuthenticated ? <Layout><Analytics /></Layout> : <Navigate to="/auth" replace />} />
            <Route path="/equipment" element={isAuthenticated ? <Layout><Equipment /></Layout> : <Navigate to="/auth" replace />} />
            <Route path="/maintenance" element={isAuthenticated ? <Layout><Maintenance /></Layout> : <Navigate to="/auth" replace />} />
            <Route path="/feedback" element={isAuthenticated ? <Layout><Feedback /></Layout> : <Navigate to="/auth" replace />} />
            <Route path="/forms" element={isAuthenticated ? <Layout><Forms /></Layout> : <Navigate to="/auth" replace />} />
            <Route path="/chat" element={isAuthenticated ? <Layout><Chat /></Layout> : <Navigate to="/auth" replace />} />
            <Route path="/notifications" element={isAuthenticated ? <Layout><Notifications /></Layout> : <Navigate to="/auth" replace />} />
            
            {/* Shopping/Store */}
            <Route path="/shopping" element={isAuthenticated ? <Layout><Shopping /></Layout> : <Navigate to="/auth" replace />} />
            <Route path="/product/:productId" element={isAuthenticated ? <Layout><ProductDetail /></Layout> : <Navigate to="/auth" replace />} />
            <Route path="/checkout" element={isAuthenticated ? <Layout><Checkout /></Layout> : <Navigate to="/auth" replace />} />
            <Route path="/orders" element={isAuthenticated ? <Layout><OrdersPage /></Layout> : <Navigate to="/auth" replace />} />
            <Route path="/orders/:orderId" element={isAuthenticated ? <Layout><OrderDetailsPage /></Layout> : <Navigate to="/auth" replace />} />
            <Route path="/wishlist" element={isAuthenticated ? <Layout><WishlistPage /></Layout> : <Navigate to="/auth" replace />} />
            <Route path="/tools/:category" element={isAuthenticated ? <Layout><ToolCategoryPage /></Layout> : <Navigate to="/auth" replace />} />
            
            
            {/* Service Editor - actual route for editing */}
            <Route path="/service-editor" element={isAuthenticated ? <Layout><ServiceCatalog /></Layout> : <Navigate to="/auth" replace />} />
            
            {/* Missing routes that are in SidebarContent */}
            <Route path="/inventory/suppliers" element={isAuthenticated ? <Layout><Inventory /></Layout> : <Navigate to="/auth" replace />} />
            
            {/* AI & Automation */}
            <Route path="/ai" element={isAuthenticated ? <Layout><AIHub /></Layout> : <Navigate to="/auth" replace />} />
            
            {/* Help and Security routes */}
            <Route path="/help" element={isAuthenticated ? <Layout><Help /></Layout> : <Navigate to="/auth" replace />} />
            <Route path="/security" element={isAuthenticated ? <Navigate to="/settings/security" replace /> : <Navigate to="/auth" replace />} />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/auth"} replace />} />
          </Routes>
          <Toaster />
          
          {/* Contextual Help Widget - only show when authenticated */}
          {isAuthenticated && <ContextualHelpWidget />}
        </div>
      </AuthErrorBoundary>
    </DatabaseInitializer>
  );
}

export default App;
