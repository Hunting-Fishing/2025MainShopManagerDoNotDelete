import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import WorkOrders from './pages/WorkOrders';
import Invoices from './pages/Invoices';
import Customers from './pages/Customers';
import Equipment from './pages/Equipment';
import Inventory from './pages/Inventory';
import Forms from './pages/Forms';
import Maintenance from './pages/Maintenance';
import Calendar from './pages/Calendar';
import Reminders from './pages/ServiceReminders';
import Chat from './pages/Chat';
import Shopping from './pages/Shopping';
import Reports from './pages/Reports';
import Team from './pages/Team';
import Settings from './pages/Settings';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Index from './pages/Index';
import WorkOrderCreate from './pages/WorkOrderCreate';
import WorkOrderDetails from './pages/WorkOrderDetails';
import CustomerDetails from './pages/CustomerDetails';
import CreateCustomer from './pages/CreateCustomer';
import EditCustomer from './pages/EditCustomer';
import VehicleDetails from './pages/VehicleDetails';
import InvoiceCreate from './pages/InvoiceCreate';
import InvoiceDetails from './pages/InvoiceDetails';
import CustomerServiceHistory from './pages/CustomerServiceHistory';
import CustomerFollowUps from './pages/CustomerFollowUps';
import CustomerAnalytics from './pages/CustomerAnalytics';
import RepairPlans from './pages/RepairPlans';
import RepairPlanDetails from './pages/RepairPlanDetails';
import CreateRepairPlan from './pages/CreateRepairPlan';
import TeamMemberProfile from './pages/TeamMemberProfile';
import TeamRoles from './pages/TeamRoles';
import TeamMemberCreate from './pages/TeamMemberCreate';
import EquipmentDetails from './pages/EquipmentDetails';
import InventoryAdd from './pages/InventoryAdd';
import MaintenanceDashboard from './pages/MaintenanceDashboard';
import Analytics from './pages/Analytics';
import EmailTemplates from './pages/EmailTemplates';
import EmailCampaigns from './pages/EmailCampaigns';
import EmailCampaignAnalytics from './pages/EmailCampaignAnalytics';
import EmailSequences from './pages/EmailSequences';
import EmailSequenceDetails from './pages/EmailSequenceDetails';
import SmsTemplates from './pages/SmsTemplates';
import SmsManagement from './pages/SmsManagement';
import ShoppingAdmin from './pages/ShoppingAdmin';
import FormPreview from './pages/FormPreview';
import FormEditor from './pages/FormEditor';
import FormBuilder from './pages/FormBuilder';
import VehicleInspectionForm from './pages/VehicleInspectionForm';

import FeedbackFormsPage from './pages/feedback/FeedbackFormsPage';
import FeedbackFormEditorPage from './pages/feedback/FeedbackFormEditorPage';
import FeedbackAnalyticsPage from './pages/feedback/FeedbackAnalyticsPage';

import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { NotificationsProvider } from '@/context/notifications';
import { checkSupabaseConnection, supabase } from './lib/supabase';

import './App.css';

const PageLoading = () => (
  <div className="flex items-center justify-center h-screen w-full">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
  </div>
);

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("App error caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center flex-col h-screen bg-slate-50 text-slate-800 p-6">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="mb-4">The application encountered an unexpected error.</p>
            <pre className="bg-slate-100 p-4 rounded text-sm overflow-auto max-h-64 mb-4">
              {this.state.error?.toString()}
            </pre>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/login', { state: { from: location.pathname } });
        } else {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        navigate('/login', { state: { from: location.pathname } });
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/login', { replace: true });
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, location]);
  
  if (isLoading) return <PageLoading />;
  
  return isAuthenticated ? <>{children}</> : <PageLoading />;
};

checkSupabaseConnection().then((isConnected) => {
  console.log("Supabase connection status:", isConnected ? "Connected" : "Connection failed");
});

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <NotificationsProvider>
            <Router>
              <Suspense fallback={<PageLoading />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  
                  <Route path="/" element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="work-orders" element={<WorkOrders />} />
                    <Route path="work-orders/create" element={<WorkOrderCreate />} />
                    <Route path="work-orders/:id" element={<WorkOrderDetails />} />
                    <Route path="invoices" element={<Invoices />} />
                    <Route path="invoices/create" element={<InvoiceCreate />} />
                    <Route path="invoices/:id" element={<InvoiceDetails />} />
                    <Route path="customers" element={<Customers />} />
                    <Route path="customers/create" element={<CreateCustomer />} />
                    <Route path="customers/:id" element={<CustomerDetails />} />
                    <Route path="customers/:id/edit" element={<EditCustomer />} />
                    <Route path="customers/:id/service-history" element={<CustomerServiceHistory />} />
                    <Route path="customers/:id/follow-ups" element={<CustomerFollowUps />} />
                    <Route path="customers/:id/analytics" element={<CustomerAnalytics />} />
                    <Route path="customers/:id/vehicles/:vehicleId" element={<VehicleDetails />} />
                    <Route path="equipment" element={<Equipment />} />
                    <Route path="equipment/:id" element={<EquipmentDetails />} />
                    <Route path="inventory" element={<Inventory />} />
                    <Route path="inventory/add" element={<InventoryAdd />} />
                    <Route path="forms" element={<Forms />} />
                    <Route path="forms/create" element={<FormBuilder />} />
                    <Route path="forms/:id" element={<FormPreview />} />
                    <Route path="forms/:id/edit" element={<FormEditor />} />
                    <Route path="vehicle-inspection" element={<VehicleInspectionForm />} />
                    <Route path="vehicle-inspection/:inspectionId" element={<VehicleInspectionForm />} />
                    <Route path="maintenance" element={<Maintenance />} />
                    <Route path="maintenance/dashboard" element={<MaintenanceDashboard />} />
                    <Route path="calendar" element={<Calendar />} />
                    <Route path="reminders" element={<Reminders />} />
                    <Route path="chat" element={<Chat />} />
                    <Route path="shopping" element={<Shopping />} />
                    <Route path="shopping/admin" element={<ShoppingAdmin />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="team" element={<Team />} />
                    <Route path="team/create" element={<TeamMemberCreate />} />
                    <Route path="team/roles" element={<TeamRoles />} />
                    <Route path="team/:id" element={<TeamMemberProfile />} />
                    <Route path="marketing/email-templates" element={<EmailTemplates />} />
                    <Route path="marketing/email-campaigns" element={<EmailCampaigns />} />
                    <Route path="marketing/email-campaigns/:id" element={<EmailCampaignAnalytics />} />
                    <Route path="marketing/email-sequences" element={<EmailSequences />} />
                    <Route path="marketing/email-sequences/:id" element={<EmailSequenceDetails />} />
                    <Route path="marketing/sms-templates" element={<SmsTemplates />} />
                    <Route path="marketing/sms-management" element={<SmsManagement />} />
                    <Route path="repair-plans" element={<RepairPlans />} />
                    <Route path="repair-plans/create" element={<CreateRepairPlan />} />
                    <Route path="repair-plans/:id" element={<RepairPlanDetails />} />
                    <Route path="feedback" element={<FeedbackFormsPage />} />
                    <Route path="feedback/:id/editor" element={<FeedbackFormEditorPage />} />
                    <Route path="feedback/:id/analytics" element={<FeedbackAnalyticsPage />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Toaster />
              </Suspense>
            </Router>
          </NotificationsProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
