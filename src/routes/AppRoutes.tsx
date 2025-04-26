
import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import NotFound from '@/pages/NotFound';
import WorkOrdersPage from '@/pages/WorkOrdersPage';
import WorkOrderDetail from '@/pages/WorkOrderDetail';
import WorkOrderCreate from '@/pages/WorkOrderCreate';
import Invoices from '@/pages/Invoices';
import Dashboard from '@/pages/Dashboard';
import Customers from '@/pages/Customers';
import CreateCustomer from '@/pages/CreateCustomer';
import EditCustomer from '@/pages/EditCustomer';
import Team from '@/pages/Team';
import CreateTeamMember from '@/pages/CreateTeamMember';
import Chat from '@/pages/Chat';
import Calendar from '@/pages/Calendar';
import Analytics from '@/pages/Analytics';
import EmailTemplates from '@/pages/EmailTemplates';
import EmailSequenceDetails from '@/pages/EmailSequenceDetails';
import CreateRepairPlan from '@/pages/CreateRepairPlan';
import Inventory from '@/pages/Inventory';
import Maintenance from '@/pages/Maintenance';
import MaintenanceDashboard from '@/pages/MaintenanceDashboard';
import Forms from '@/pages/Forms';
import Shopping from '@/pages/Shopping';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import ServiceReminders from '@/pages/ServiceReminders';
import Equipment from '@/pages/Equipment';

import { CustomerPortalLayout } from '@/components/customer-portal/CustomerPortalLayout';
import CustomerPortal from '@/pages/customer-portal/CustomerPortal';
import WorkOrdersList from '@/pages/customer-portal/WorkOrdersList';
import CustomerWorkOrderDetail from '@/pages/customer-portal/WorkOrderDetail';
import VehicleDetail from '@/pages/customer-portal/VehicleDetail';
import Messages from '@/pages/customer-portal/Messages';
import { supabase } from '@/lib/supabase';

const AppRoutes = () => {
  const [currentCustomerId, setCurrentCustomerId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Fetch the current customer ID when the component mounts
  useEffect(() => {
    const fetchCustomerId = async () => {
      try {
        setLoading(true);
        // Get the current authenticated user
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user) {
          // Get customer data associated with this user
          const { data: customerData } = await supabase
            .from('customers')
            .select('id')
            .eq('auth_user_id', authData.user.id)
            .single();

          if (customerData?.id) {
            setCurrentCustomerId(customerData.id);
          }
        }
      } catch (error) {
        console.error("Error fetching customer ID:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerId();
  }, []);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        <Route path="/work-orders" element={<WorkOrdersPage />} />
        <Route path="/work-orders/:id" element={<WorkOrderDetail />} />
        <Route path="/work-orders/new" element={<WorkOrderCreate />} />
        <Route path="/work-orders/:id/edit" element={<WorkOrderCreate />} />
        
        <Route path="/customers" element={<Customers />} />
        <Route path="/customers/new" element={<CreateCustomer />} />
        <Route path="/customers/:customerId/edit" element={<EditCustomer />} />
        
        <Route path="/invoices" element={<Invoices />} />
        
        <Route path="/team" element={<Team />} />
        <Route path="/team/create" element={<CreateTeamMember />} />
        
        <Route path="/calendar" element={<Calendar />} />
        
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:roomId" element={<Chat />} />
        
        <Route path="/reports" element={<Reports />} />
        <Route path="/analytics" element={<Analytics />} />
        
        <Route path="/email-templates" element={<EmailTemplates />} />
        <Route path="/email-sequences/:id" element={<EmailSequenceDetails />} />
        <Route path="/email-sequences" element={<EmailTemplates />} />
        <Route path="/email-campaigns" element={<EmailTemplates />} />
        <Route path="/sms-templates" element={<EmailTemplates />} />
        <Route path="/marketing" element={<EmailTemplates />} />
        
        <Route path="/inventory" element={<Inventory />} />
        
        <Route path="/equipment" element={<Equipment />} />
        <Route path="/equipment/repair-plans/create" element={<CreateRepairPlan />} />
        
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/maintenance/dashboard" element={<MaintenanceDashboard />} />
        
        <Route path="/reminders" element={<ServiceReminders />} />
        
        <Route path="/forms" element={<Forms />} />
        <Route path="/shopping" element={<Shopping />} />
        <Route path="/settings" element={<Settings />} />
        
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route element={<CustomerPortalLayout />}>
        <Route path="/customer-portal" element={<CustomerPortal />} />
        <Route 
          path="/customer-portal/work-orders" 
          element={
            loading ? (
              <div className="flex items-center justify-center h-40">
                <p>Loading work orders...</p>
              </div>
            ) : (
              <WorkOrdersList customerId={currentCustomerId} />
            )
          } 
        />
        <Route path="/customer-portal/work-orders/:id" element={<CustomerWorkOrderDetail />} />
        <Route path="/customer-portal/vehicles/:id" element={<VehicleDetail />} />
        <Route path="/customer-portal/messages" element={<Messages />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
