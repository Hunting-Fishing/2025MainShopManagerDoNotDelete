
import React, { Suspense, useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import { useAuthUser } from '@/hooks/useAuthUser';
import { checkSupabaseConnection } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Import pages (lazy-loaded)
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Customers = React.lazy(() => import('./pages/Customers'));
const CustomerDetails = React.lazy(() => import('./pages/CustomerDetails'));
const CustomerEdit = React.lazy(() => import('./pages/CustomerEdit'));
const CustomerVehicleDetails = React.lazy(() => import('./pages/CustomerVehicleDetails'));
const WorkOrders = React.lazy(() => import('./pages/WorkOrders'));
const WorkOrderDetails = React.lazy(() => import('./pages/WorkOrderDetails'));
const WorkOrderEdit = React.lazy(() => import('./pages/WorkOrderEdit'));
const Calendar = React.lazy(() => import('./pages/Calendar'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Team = React.lazy(() => import('./pages/Team'));
const Equipment = React.lazy(() => import('./pages/Equipment'));
const Notifications = React.lazy(() => import('./pages/Notifications'));
const Reports = React.lazy(() => import('./pages/Reports'));
const Chat = React.lazy(() => import('./pages/Chat'));
const RepairPlans = React.lazy(() => import('./pages/RepairPlans'));
const Invoices = React.lazy(() => import('./pages/Invoices'));
const InvoiceDetails = React.lazy(() => import('./pages/InvoiceDetails'));
const InvoiceEdit = React.lazy(() => import('./pages/InvoiceEdit'));
const Documents = React.lazy(() => import('./pages/Documents'));
const Feedback = React.lazy(() => import('./pages/Feedback'));
const EmailTemplates = React.lazy(() => import('./pages/EmailTemplates'));
const Forms = React.lazy(() => import('./pages/Forms'));
const Payments = React.lazy(() => import('./pages/Payments'));
const Login = React.lazy(() => import('./pages/Login'));
const StaffLogin = React.lazy(() => import('./pages/StaffLogin'));
const CustomerPortal = React.lazy(() => import('./pages/CustomerPortal'));

// Import components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import { AuthGate } from './components/AuthGate';

// Define a functional component to check Supabase connection status
const SupabaseStatusChecker: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      const status = await checkSupabaseConnection();
      setIsConnected(status);
    };

    checkConnection();
  }, []);

  if (isConnected === null) {
    return null; // Still checking
  }

  if (isConnected) {
    return null; // Connection is good
  }

  return (
    <Dialog open={!isConnected}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supabase Connection Error</DialogTitle>
          <DialogDescription>
            Could not connect to Supabase. Please check your internet connection and Supabase configuration.
          </DialogDescription>
        </DialogHeader>
        <Button onClick={() => window.location.reload()}>
          Retry Connection
        </Button>
      </DialogContent>
    </Dialog>
  );
};

function AppContent() {
  const { isAuthenticated } = useAuthUser();
  const location = useLocation();

  // Define routes that don't require the sidebar and navbar
  const isPublicPage = ['/login', '/staff-login'].includes(location.pathname);

  return (
    <>
      <SupabaseStatusChecker />
      <div className="flex h-screen bg-gray-50">
        {!isPublicPage && isAuthenticated && <Sidebar />}

        <div className={`flex flex-col flex-1 overflow-hidden ${!isPublicPage && isAuthenticated ? "" : ""}`}>
          {!isPublicPage && isAuthenticated && <Navbar />}

          <main className={`flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 ${!isPublicPage && isAuthenticated ? "p-4 md:p-6" : ""}`}>
            <Suspense fallback={<Skeleton className="w-60 h-10" />}>
              <Routes>
                <Route path="/" element={<AuthGate><Dashboard /></AuthGate>} />
                <Route path="/dashboard" element={<AuthGate><Dashboard /></AuthGate>} />

                <Route path="/customers" element={<AuthGate><Customers /></AuthGate>} />
                <Route path="/customers/:id" element={<AuthGate><CustomerDetails /></AuthGate>} />
                <Route path="/customers/:id/edit" element={<AuthGate><CustomerEdit /></AuthGate>} />
                <Route path="/customers/:id/vehicles/:vehicleId" element={<AuthGate><CustomerVehicleDetails /></AuthGate>} />

                <Route path="/work-orders" element={<AuthGate><WorkOrders /></AuthGate>} />
                <Route path="/work-orders/:id" element={<AuthGate><WorkOrderDetails /></AuthGate>} />
                <Route path="/work-orders/:id/edit" element={<AuthGate><WorkOrderEdit /></AuthGate>} />

                <Route path="/calendar" element={<AuthGate><Calendar /></AuthGate>} />
                <Route path="/settings" element={<AuthGate><Settings /></AuthGate>} />
                <Route path="/team" element={<AuthGate><Team /></AuthGate>} />
                <Route path="/equipment" element={<AuthGate><Equipment /></AuthGate>} />
                <Route path="/notifications" element={<AuthGate><Notifications /></AuthGate>} />
                <Route path="/reports" element={<AuthGate><Reports /></AuthGate>} />
                <Route path="/chat" element={<AuthGate><Chat /></AuthGate>} />
                <Route path="/repair-plans" element={<AuthGate><RepairPlans /></AuthGate>} />

                <Route path="/invoices" element={<AuthGate><Invoices /></AuthGate>} />
                <Route path="/invoices/:id" element={<AuthGate><InvoiceDetails /></AuthGate>} />
                <Route path="/invoices/:id/edit" element={<AuthGate><InvoiceEdit /></AuthGate>} />

                <Route path="/documents" element={<AuthGate><Documents /></AuthGate>} />
                <Route path="/feedback" element={<AuthGate><Feedback /></AuthGate>} />
                <Route path="/email-templates" element={<AuthGate><EmailTemplates /></AuthGate>} />
                <Route path="/forms" element={<AuthGate><Forms /></AuthGate>} />
                <Route path="/payments" element={<AuthGate><Payments /></AuthGate>} />
                
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/staff-login" element={<StaffLogin />} />
                <Route path="/customer-portal" element={<CustomerPortal />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </div>
      <Toaster />
    </>
  );
}

function App() {
  return (
    <HelmetProvider>
      <Router>
        <AppContent />
      </Router>
    </HelmetProvider>
  );
}

export default App;
