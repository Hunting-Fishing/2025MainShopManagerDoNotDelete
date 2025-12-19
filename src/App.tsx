import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AuthGate } from '@/components/AuthGate';
import { AuthDebugPanel } from '@/components/debug/AuthDebugPanel';
import { authMonitor } from '@/utils/authMonitoring';

// Pages
import Dashboard from '@/pages/Dashboard';
import Shopping from '@/pages/Shopping';
import ProductDetail from '@/pages/ProductDetail';
import CustomerPortal from '@/pages/CustomerPortal';
import WorkOrders from '@/pages/WorkOrders';
import Customers from '@/pages/Customers';
import Inventory from '@/pages/Inventory';
import InventoryAnalytics from '@/pages/InventoryAnalytics';
import InventoryManager from '@/pages/InventoryManager';
import InventoryAdd from '@/pages/InventoryAdd';
import ServicePackages from '@/pages/ServicePackages';
import AssetUsageTracking from '@/pages/AssetUsageTracking';
import ConsumptionTracking from '@/pages/ConsumptionTracking';
import MobileInventory from '@/pages/MobileInventory';
import MaintenancePlanning from '@/pages/MaintenancePlanning';
import Analytics from '@/pages/Analytics';
import Settings from '@/pages/Settings';
import Calendar from '@/pages/Calendar';
import Team from '@/pages/Team';
import CustomerComms from '@/pages/CustomerComms';
import CallLogger from '@/pages/CallLogger';
import Help from '@/pages/Help';
import ServiceReminders from '@/pages/ServiceReminders';
import Quotes from '@/pages/Quotes';
import Invoices from '@/pages/Invoices';
import ServiceBoard from '@/pages/ServiceBoard';
import Payments from '@/pages/Payments';
import CompanyProfile from '@/pages/CompanyProfile';
import Documents from '@/pages/Documents';
import Contacts from '@/pages/Contacts';
import ServiceCatalog from '@/pages/ServiceCatalog';
import RepairPlans from '@/pages/RepairPlans';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import About from '@/pages/About';
import { ArticleViewer } from '@/components/help/ArticleViewer';
import { LearningPathDetail } from '@/components/help/LearningPathDetail';
import { ServiceManagementPage } from '@/pages/developer/ServiceManagementPage';
import InvoiceDetails from '@/pages/InvoiceDetails';
import SignatureDemo from '@/pages/SignatureDemo';
import EquipmentManagement from '@/pages/EquipmentManagement';
import Equipment from '@/pages/Equipment';
import EquipmentDetails from '@/pages/EquipmentDetails';
import EquipmentDashboard from '@/pages/EquipmentDashboard';
import FleetManagement from '@/pages/FleetManagement';
import SafetyEquipment from '@/pages/SafetyEquipment';
import MaintenanceRequests from '@/pages/MaintenanceRequests';
import ShoppingCartPage from '@/pages/ShoppingCart';
import WishlistPage from '@/pages/WishlistPage';
import Orders from '@/pages/Orders';
import Security from '@/pages/Security';
import Profile from '@/pages/Profile';
import Notifications from '@/pages/Notifications';
import Reports from '@/pages/Reports';
import Projects from '@/pages/Projects';
import ProjectDetails from '@/pages/ProjectDetails';
import Forms from '@/pages/Forms';
import FormSubmissions from '@/pages/FormSubmissions';
import QuoteDetails from '@/pages/QuoteDetails';
import WorkOrderDetails from '@/pages/WorkOrderDetails';
import RepairPlanDetails from '@/pages/RepairPlanDetails';
import AIHub from '@/pages/AIHub';
import Chat from '@/pages/Chat';
import EmailCampaigns from '@/pages/EmailCampaigns';
import EmailSequences from '@/pages/EmailSequences';
import EmailTemplates from '@/pages/EmailTemplates';
import Feedback from '@/pages/Feedback';
import FeedbackFormsPage from '@/pages/feedback/FeedbackFormsPage';
import FeedbackFormEditorPage from '@/pages/feedback/FeedbackFormEditorPage';
import FeedbackAnalyticsPage from '@/pages/feedback/FeedbackAnalyticsPage';
import DeveloperPortal from '@/pages/DeveloperPortal';
import SmsManagement from '@/pages/SmsManagement';
import SmsTemplates from '@/pages/SmsTemplates';
import Timesheet from '@/pages/Timesheet';
import FeatureRequests from '@/pages/FeatureRequests';
import EquipmentTracking from '@/pages/EquipmentTracking';
import EmployeeScheduling from '@/pages/EmployeeScheduling';
import TrainingOverview from '@/pages/TrainingOverview';
import DailyLogs from '@/pages/DailyLogs';
import Insurance from '@/pages/Insurance';
import FuelManagement from '@/pages/FuelManagement';
import Warranties from '@/pages/Warranties';
import DriverManagement from '@/pages/DriverManagement';
import TireManagement from '@/pages/TireManagement';
import AccountingIntegration from '@/pages/AccountingIntegration';
import Safety from '@/pages/Safety';
import SafetyIncidents from '@/pages/SafetyIncidents';
import SafetyIncidentNew from '@/pages/SafetyIncidentNew';
import SafetyIncidentDetails from '@/pages/SafetyIncidentDetails';
import SafetyInspections from '@/pages/SafetyInspections';
import SafetyInspectionNew from '@/pages/SafetyInspectionNew';
import SafetyDVIR from '@/pages/SafetyDVIR';
import SafetyDVIRNew from '@/pages/SafetyDVIRNew';
import SafetyDVIRDetails from '@/pages/SafetyDVIRDetails';
import SafetyLiftInspections from '@/pages/SafetyLiftInspections';
import ForkliftInspection from '@/pages/ForkliftInspection';
import VesselInspection from '@/pages/VesselInspection';
import VesselInspectionHistoryPage from '@/pages/VesselInspectionHistoryPage';
import InspectionAnalytics from '@/pages/InspectionAnalytics';
import SafetyLiftInspectionNew from '@/pages/SafetyLiftInspectionNew';
import SafetyDocuments from '@/pages/SafetyDocuments';
import SafetyCertifications from '@/pages/SafetyCertifications';
import SafetySchedules from '@/pages/SafetySchedules';
import SafetyReports from '@/pages/SafetyReports';
import SafetyCorrectiveActions from '@/pages/SafetyCorrectiveActions';
import SafetyNearMiss from '@/pages/SafetyNearMiss';
import SafetyTraining from '@/pages/SafetyTraining';
import SafetyMeetings from '@/pages/SafetyMeetings';
import SafetyJSA from '@/pages/SafetyJSA';
import SafetyPPE from '@/pages/SafetyPPE';
import SafetyContractors from '@/pages/SafetyContractors';
import SafetyGamification from '@/pages/SafetyGamification';
import TechnicianPortal from '@/pages/TechnicianPortal';
import { GlobalUX } from '@/components/ux/GlobalUX';
import SetupBrianAuth from '@/pages/SetupBrianAuth';
import Onboarding from '@/pages/Onboarding';
import ShopSetup from '@/pages/ShopSetup';
import SecurityAudit from '@/pages/SecurityAudit';
import ResetPassword from '@/pages/ResetPassword';
import Planner from '@/pages/Planner';
import Payroll from '@/pages/Payroll';
import AdvancedAnalytics from '@/pages/AdvancedAnalytics';
import AffiliateTool from '@/pages/AffiliateTool';
import BoatInspection from '@/pages/BoatInspection';
import Checkout from '@/pages/Checkout';
import ClientBooking from '@/pages/ClientBooking';
import CustomerAnalytics from '@/pages/CustomerAnalytics';
import CustomerExperience from '@/pages/CustomerExperience';
import CustomerFollowUps from '@/pages/CustomerFollowUps';
import CustomerPortalLogin from '@/pages/CustomerPortalLogin';
import CustomerServiceHistory from '@/pages/CustomerServiceHistory';
import EmailCampaignAnalytics from '@/pages/EmailCampaignAnalytics';
import EmailSequenceDetails from '@/pages/EmailSequenceDetails';
import Enterprise from '@/pages/Enterprise';
import EnterpriseAdmin from '@/pages/EnterpriseAdmin';
import InventoryAutomation from '@/pages/InventoryAutomation';
import InventoryCategories from '@/pages/InventoryCategories';
import InventoryLocations from '@/pages/InventoryLocations';
import InventoryOrders from '@/pages/InventoryOrders';
import InventorySuppliers from '@/pages/InventorySuppliers';
import InvoiceCreate from '@/pages/InvoiceCreate';
import InvoiceScan from '@/pages/InvoiceScan';
import MaintenanceDashboard from '@/pages/MaintenanceDashboard';
import NotFound from '@/pages/NotFound';
import OrderConfirmation from '@/pages/OrderConfirmation';
import PartsTracking from '@/pages/PartsTracking';
import PurchaseOrders from '@/pages/PurchaseOrders';
import StockControl from '@/pages/StockControl';
import TeamMemberProfile from '@/pages/TeamMemberProfile';
import TeamRoles from '@/pages/TeamRoles';
import Unauthorized from '@/pages/Unauthorized';
import VehicleDetails from '@/pages/VehicleDetails';
import VehicleInspectionForm from '@/pages/VehicleInspectionForm';
import TermsOfService from '@/pages/legal/TermsOfService';
import PrivacyPolicy from '@/pages/legal/PrivacyPolicy';

function App() {
  useEffect(() => {
    // Initialize auth monitoring
    console.log('🚀 App initialized with auth monitoring');
  }, []);

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/about" element={<About />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/setup-brian" element={<SetupBrianAuth />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/shop-setup" element={<ShopSetup />} />
        
        {/* Protected routes */}
        <Route
          path="/*"
          element={
            <AuthGate>
              <Layout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  
                  {/* Store */}
                  <Route path="/shopping" element={<Shopping />} />
                  <Route path="/shopping/:id" element={<ProductDetail />} />
                  <Route path="/customer-portal" element={<CustomerPortal />} />
                  
                  {/* Work Management */}
                  <Route path="/work-orders" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'service_advisor', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <WorkOrders />
                    </ProtectedRoute>
                  } />
                  <Route path="/work-orders/:id" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'service_advisor', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <WorkOrderDetails />
                    </ProtectedRoute>
                  } />
                  
                  {/* Customer Management */}
                  <Route path="/customers/*" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'service_advisor', 'reception', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <Customers />
                    </ProtectedRoute>
                  } />
                  
                   {/* Inventory */}
                   <Route path="/inventory/*" element={
                     <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'inventory_manager', 'yard_manager', 'mechanic_manager', 'owner']}>
                       <Inventory />
                     </ProtectedRoute>
                   } />
                   
                   {/* Inventory Analytics */}
                   <Route path="/inventory-analytics" element={
                     <ProtectedRoute allowedRoles={['admin', 'manager', 'yard_manager', 'mechanic_manager', 'owner']}>
                       <InventoryAnalytics />
                     </ProtectedRoute>
                   } />
                   
                   {/* Inventory Manager */}
                   <Route path="/inventory-manager" element={
                     <ProtectedRoute allowedRoles={['admin', 'manager', 'inventory_manager', 'yard_manager', 'mechanic_manager', 'owner']}>
                       <InventoryManager />
                     </ProtectedRoute>
                   } />
                   
                    {/* Service Packages */}
                    <Route path="/service-packages" element={
                      <ProtectedRoute allowedRoles={['admin', 'manager', 'yard_manager', 'mechanic_manager', 'owner']}>
                        <ServicePackages />
                      </ProtectedRoute>
                    } />
                    
                    {/* Asset Usage Tracking */}
                    <Route path="/asset-usage" element={
                      <ProtectedRoute allowedRoles={['admin', 'manager', 'yard_manager', 'mechanic_manager', 'owner']}>
                        <AssetUsageTracking />
                      </ProtectedRoute>
                    } />
                    
                    {/* Consumption Tracking */}
                    <Route path="/consumption-tracking" element={
                      <ProtectedRoute allowedRoles={['admin', 'manager', 'yard_manager', 'mechanic_manager', 'owner']}>
                        <ConsumptionTracking />
                      </ProtectedRoute>
                    } />

                    {/* Mobile Inventory Scanner */}
                    <Route path="/mobile-inventory" element={
                      <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'yard_manager', 'mechanic_manager', 'owner']}>
                        <MobileInventory />
                      </ProtectedRoute>
                    } />

                    {/* Maintenance Planning */}
                    <Route path="/maintenance-planning" element={
                      <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'yard_manager', 'mechanic_manager', 'owner']}>
                        <MaintenancePlanning />
                      </ProtectedRoute>
                    } />
                  
                  {/* Analytics */}
                  <Route path="/analytics" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <Analytics />
                    </ProtectedRoute>
                  } />
                  
                  {/* Settings */}
                  <Route path="/settings/*" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'owner']}>
                      <Settings />
                    </ProtectedRoute>
                  } />
                  
                  {/* Security Audit - Admin Only */}
                  <Route path="/security-audit" element={
                    <ProtectedRoute allowedRoles={['admin', 'owner']}>
                      <SecurityAudit />
                    </ProtectedRoute>
                  } />
                  
                  {/* Calendar */}
                  <Route path="/calendar" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'service_advisor', 'reception', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <Calendar />
                    </ProtectedRoute>
                  } />
                  
                  {/* Planner */}
                  <Route path="/planner" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'service_advisor', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <Planner />
                    </ProtectedRoute>
                  } />
                  
                  {/* Service Reminders */}
                  <Route path="/service-reminders" element={<ServiceReminders />} />
                  
                  {/* Customer Communications */}
                  <Route path="/customer-comms" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'service_advisor', 'reception', 'owner']}>
                      <CustomerComms />
                    </ProtectedRoute>
                  } />
                  
                  {/* Call Logger */}
                  <Route path="/call-logger" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'service_advisor', 'reception', 'owner']}>
                      <CallLogger />
                    </ProtectedRoute>
                  } />
                  
                  {/* Team Chat */}
                  <Route path="/chat" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'service_advisor', 'reception', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <Chat />
                    </ProtectedRoute>
                  } />
                  
                  {/* Email Marketing */}
                  <Route path="/email-campaigns" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'service_advisor', 'owner']}>
                      <EmailCampaigns />
                    </ProtectedRoute>
                  } />
                  <Route path="/email-sequences" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'service_advisor', 'owner']}>
                      <EmailSequences />
                    </ProtectedRoute>
                  } />
                  <Route path="/email-templates" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'service_advisor', 'owner']}>
                      <EmailTemplates />
                    </ProtectedRoute>
                  } />
                  
                  {/* SMS Communications */}
                  <Route path="/sms-management" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'service_advisor', 'owner']}>
                      <SmsManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="/sms-templates" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'service_advisor', 'owner']}>
                      <SmsTemplates />
                    </ProtectedRoute>
                  } />
                  
                  {/* Operations */}
                  <Route path="/quotes" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'service_advisor', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <Quotes />
                    </ProtectedRoute>
                  } />
                  <Route path="/quotes/:id" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'service_advisor', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <QuoteDetails />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/invoices" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'service_advisor', 'reception', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <Invoices />
                    </ProtectedRoute>
                  } />
                  <Route path="/invoices/:id" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'service_advisor', 'reception', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <InvoiceDetails />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/service-board" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'service_advisor', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <ServiceBoard />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/payments" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'service_advisor', 'reception', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <Payments />
                    </ProtectedRoute>
                  } />
                  
                  {/* Project Budgets */}
                  <Route path="/projects" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <Projects />
                    </ProtectedRoute>
                  } />
                  <Route path="/projects/:id" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <ProjectDetails />
                    </ProtectedRoute>
                  } />
                  
                  {/* Company */}
                  <Route path="/company-profile" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <CompanyProfile />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/vehicles" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'service_advisor', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <Equipment />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/documents" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'service_advisor', 'reception', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <Documents />
                    </ProtectedRoute>
                  } />
                  
                  {/* Contacts & Resources */}
                  <Route path="/contacts" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'service_advisor', 'reception', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <Contacts />
                    </ProtectedRoute>
                  } />
                  
                  {/* Team Management */}
                  <Route path="/team/*" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <Team />
                    </ProtectedRoute>
                  } />
                  
                  {/* Training Overview */}
                  <Route path="/training-overview" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <TrainingOverview />
                    </ProtectedRoute>
                  } />
                  
                  {/* Timesheet */}
                  <Route path="/timesheet" element={
                    <ProtectedRoute>
                      <Timesheet />
                    </ProtectedRoute>
                  } />
                  
                  {/* Payroll & Time Tracking */}
                  <Route path="/payroll" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'owner']}>
                      <Payroll />
                    </ProtectedRoute>
                  } />
                  
                  {/* Technician Portal */}
                  <Route path="/technician-portal" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <TechnicianPortal />
                    </ProtectedRoute>
                  } />
                  
                  {/* Services */}
                  <Route path="/services" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'service_advisor', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <ServiceCatalog />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/service-editor/*" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <ServiceManagementPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/repair-plans" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'service_advisor', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <RepairPlans />
                    </ProtectedRoute>
                  } />
                  <Route path="/repair-plans/:id" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'service_advisor', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <RepairPlanDetails />
                    </ProtectedRoute>
                  } />
                  
                  {/* Help & Support */}
                  <Route path="/help" element={<Help />} />
                  <Route path="/help/article/:articleId" element={<ArticleViewer />} />
                  <Route path="/help/path/:pathId" element={<LearningPathDetail />} />
                  
                  {/* Signature Demo */}
                  <Route path="/signature-demo" element={<SignatureDemo />} />
                  
                  {/* Equipment & Tools */}
                  <Route path="/equipment-management" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <EquipmentManagement />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/equipment" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <Equipment />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/equipment/:id" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <EquipmentDetails />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/fleet-management" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <FleetManagement />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/equipment/dashboard" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <EquipmentDashboard />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/maintenance-requests" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <MaintenanceRequests />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/safety-equipment" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <SafetyEquipment />
                    </ProtectedRoute>
                  } />
                  
                  {/* Daily Logs */}
                  <Route path="/daily-logs" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <DailyLogs />
                    </ProtectedRoute>
                  } />
                  
                  {/* Shopping Cart & Orders */}
                  <Route path="/shopping/cart" element={<ShoppingCartPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/orders" element={<Orders />} />
                  
                  {/* Security */}
                  <Route path="/security" element={<Security />} />
                  
                  {/* User Pages */}
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/notifications" element={<Notifications />} />
                  
                  {/* Reports & Forms */}
                  <Route path="/reports" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <Reports />
                    </ProtectedRoute>
                  } />
                  <Route path="/forms" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <Forms />
                    </ProtectedRoute>
                  } />
                  <Route path="/form-submissions" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <FormSubmissions />
                    </ProtectedRoute>
                  } />
                  
                  {/* AI & Automation */}
                  <Route path="/ai-hub" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <AIHub />
                    </ProtectedRoute>
                  } />
                  
                  {/* Customer Feedback */}
                  <Route path="/feedback" element={<Feedback />} />
                  <Route path="/feedback/forms" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'owner']}>
                      <FeedbackFormsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/feedback/forms/new" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'owner']}>
                      <FeedbackFormEditorPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/feedback/forms/:formId/edit" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'owner']}>
                      <FeedbackFormEditorPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/feedback/forms/:formId/analytics" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'owner']}>
                      <FeedbackAnalyticsPage />
                    </ProtectedRoute>
                  } />
                  
          {/* Feature Requests */}
          <Route path="/feature-requests" element={<FeatureRequests />} />
                  
                  {/* Equipment Tracking */}
                  <Route path="/equipment-tracking" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'deckhand', 'captain', 'mate', 'chief_engineer', 'marine_engineer', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <EquipmentTracking />
                    </ProtectedRoute>
                  } />
                  
                  {/* Insurance Management */}
                  <Route path="/insurance" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <Insurance />
                    </ProtectedRoute>
                  } />
                  
                  {/* Fleet Operations */}
                  <Route path="/fuel-management" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <FuelManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="/warranties" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <Warranties />
                    </ProtectedRoute>
                  } />
                  <Route path="/driver-management" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <DriverManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="/tire-management" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <TireManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="/accounting-integration" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <AccountingIntegration />
                    </ProtectedRoute>
                  } />
                  
                  {/* Safety & Compliance */}
                  <Route path="/safety" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <Safety />
                    </ProtectedRoute>
                  } />
                  <Route path="/safety/incidents" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <SafetyIncidents />
                    </ProtectedRoute>
                  } />
                  <Route path="/safety/incidents/new" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <SafetyIncidentNew />
                    </ProtectedRoute>
                  } />
                  <Route path="/safety/incidents/:id" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <SafetyIncidentDetails />
                    </ProtectedRoute>
                  } />
                  <Route path="/safety/inspections" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <SafetyInspections />
                    </ProtectedRoute>
                  } />
                  <Route path="/safety/inspections/new" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <SafetyInspectionNew />
                    </ProtectedRoute>
                  } />
                  <Route path="/safety/dvir" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <SafetyDVIR />
                    </ProtectedRoute>
                  } />
                  <Route path="/safety/dvir/new" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <SafetyDVIRNew />
                    </ProtectedRoute>
                  } />
                  <Route path="/safety/dvir/:id" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <SafetyDVIRDetails />
                    </ProtectedRoute>
                  } />
                  <Route path="/safety/equipment" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <SafetyLiftInspections />
                    </ProtectedRoute>
                  } />
                  <Route path="/safety/equipment/inspect" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <SafetyLiftInspectionNew />
                    </ProtectedRoute>
                  } />
                  <Route path="/safety/equipment/forklift" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <ForkliftInspection />
                    </ProtectedRoute>
                  } />
                  <Route path="/safety/vessels" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'yard_manager', 'boat_manager', 'mechanic_manager', 'owner']}>
                      <VesselInspection />
                    </ProtectedRoute>
                  } />
                  <Route path="/safety/vessels/:vesselId/history" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'yard_manager', 'boat_manager', 'mechanic_manager', 'owner']}>
                      <VesselInspectionHistoryPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/safety/analytics" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'yard_manager', 'boat_manager', 'mechanic_manager', 'owner']}>
                      <InspectionAnalytics />
                    </ProtectedRoute>
                  } />
                  {/* Redirect old scheduling route to consolidated schedules page */}
                  <Route path="/safety/scheduling" element={<Navigate to="/safety/schedules" replace />} />
                  <Route path="/safety/documents" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <SafetyDocuments />
                    </ProtectedRoute>
                  } />
                  <Route path="/safety/certifications" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <SafetyCertifications />
                    </ProtectedRoute>
                  } />
                  <Route path="/safety/schedules" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <SafetySchedules />
                    </ProtectedRoute>
                  } />
                  <Route path="/safety/reports" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <SafetyReports />
                    </ProtectedRoute>
                  } />
                  <Route path="/safety/corrective-actions" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <SafetyCorrectiveActions />
                    </ProtectedRoute>
                  } />
                  <Route path="/safety/near-miss" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <SafetyNearMiss />
                    </ProtectedRoute>
                  } />
                  <Route path="/safety/training" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <SafetyTraining />
                    </ProtectedRoute>
                  } />
                  <Route path="/safety/meetings" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <SafetyMeetings />
                    </ProtectedRoute>
                  } />
                  <Route path="/safety/jsa" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <SafetyJSA />
                    </ProtectedRoute>
                  } />
                  <Route path="/safety/ppe" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <SafetyPPE />
                    </ProtectedRoute>
                  } />
                  <Route path="/safety/contractors" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <SafetyContractors />
                    </ProtectedRoute>
                  } />
                  <Route path="/safety/rewards" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <SafetyGamification />
                    </ProtectedRoute>
                  } />
                  
                  {/* Employee Scheduling */}
                  <Route path="/scheduling" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <EmployeeScheduling />
                    </ProtectedRoute>
                  } />
                  
                  {/* Developer Portal */}
                  <Route path="/developer/*" element={
                    <ProtectedRoute requireAdmin={true}>
                      <DeveloperPortal />
                    </ProtectedRoute>
                  } />
                  
                  {/* Advanced Analytics */}
                  <Route path="/advanced-analytics" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <AdvancedAnalytics />
                    </ProtectedRoute>
                  } />
                  
                  {/* Affiliate Tool */}
                  <Route path="/affiliate-tool" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'owner']}>
                      <AffiliateTool />
                    </ProtectedRoute>
                  } />
                  
                  {/* Boat Inspection */}
                  <Route path="/boat-inspection" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'yard_manager', 'boat_manager', 'mechanic_manager', 'owner']}>
                      <BoatInspection />
                    </ProtectedRoute>
                  } />
                  
                  {/* Checkout */}
                  <Route path="/checkout" element={<Checkout />} />
                  
                  {/* Client Booking */}
                  <Route path="/booking" element={<ClientBooking />} />
                  
                  {/* Customer Analytics */}
                  <Route path="/customer-analytics" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <CustomerAnalytics />
                    </ProtectedRoute>
                  } />
                  
                  {/* Customer Experience */}
                  <Route path="/customer-experience" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'service_advisor', 'owner']}>
                      <CustomerExperience />
                    </ProtectedRoute>
                  } />
                  
                  {/* Customer Follow-ups */}
                  <Route path="/customer-followups" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'service_advisor', 'owner']}>
                      <CustomerFollowUps />
                    </ProtectedRoute>
                  } />
                  
                  {/* Customer Portal Login */}
                  <Route path="/customer-portal-login" element={<CustomerPortalLogin />} />
                  
                  {/* Customer Service History */}
                  <Route path="/customer-service-history/:customerId" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'service_advisor', 'technician', 'owner']}>
                      <CustomerServiceHistory />
                    </ProtectedRoute>
                  } />
                  
                  {/* Email Campaign Analytics */}
                  <Route path="/email-campaigns/:id/analytics" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'service_advisor', 'owner']}>
                      <EmailCampaignAnalytics />
                    </ProtectedRoute>
                  } />
                  
                  {/* Email Sequence Details */}
                  <Route path="/email-sequences/:id" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'service_advisor', 'owner']}>
                      <EmailSequenceDetails />
                    </ProtectedRoute>
                  } />
                  
                  {/* Enterprise */}
                  <Route path="/enterprise" element={
                    <ProtectedRoute allowedRoles={['admin', 'owner']}>
                      <Enterprise />
                    </ProtectedRoute>
                  } />
                  
                  {/* Enterprise Admin */}
                  <Route path="/enterprise-admin" element={
                    <ProtectedRoute allowedRoles={['admin', 'owner']}>
                      <EnterpriseAdmin />
                    </ProtectedRoute>
                  } />
                  
                  {/* Inventory Automation */}
                  <Route path="/inventory-automation" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'inventory_manager', 'owner']}>
                      <InventoryAutomation />
                    </ProtectedRoute>
                  } />
                  
                  {/* Inventory Categories */}
                  <Route path="/inventory-categories" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'inventory_manager', 'owner']}>
                      <InventoryCategories />
                    </ProtectedRoute>
                  } />
                  
                  {/* Inventory Locations */}
                  <Route path="/inventory-locations" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'inventory_manager', 'owner']}>
                      <InventoryLocations />
                    </ProtectedRoute>
                  } />
                  
                  {/* Inventory Orders */}
                  <Route path="/inventory-orders" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'inventory_manager', 'owner']}>
                      <InventoryOrders />
                    </ProtectedRoute>
                  } />
                  
                  {/* Inventory Suppliers */}
                  <Route path="/inventory-suppliers" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'inventory_manager', 'owner']}>
                      <InventorySuppliers />
                    </ProtectedRoute>
                  } />
                  
                  {/* Invoice Create */}
                  <Route path="/invoices/create" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'service_advisor', 'owner']}>
                      <InvoiceCreate />
                    </ProtectedRoute>
                  } />
                  
                  {/* Invoice Scan */}
                  <Route path="/invoice-scan" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'service_advisor', 'owner']}>
                      <InvoiceScan />
                    </ProtectedRoute>
                  } />
                  
                  {/* Maintenance Dashboard */}
                  <Route path="/maintenance-dashboard" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <MaintenanceDashboard />
                    </ProtectedRoute>
                  } />
                  
                  {/* Order Confirmation */}
                  <Route path="/order-confirmation" element={<OrderConfirmation />} />
                  
                  {/* Parts Tracking */}
                  <Route path="/parts-tracking" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'inventory_manager', 'owner']}>
                      <PartsTracking />
                    </ProtectedRoute>
                  } />
                  
                  {/* Purchase Orders */}
                  <Route path="/purchase-orders" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'inventory_manager', 'owner']}>
                      <PurchaseOrders />
                    </ProtectedRoute>
                  } />
                  
                  {/* Stock Control */}
                  <Route path="/stock-control" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'inventory_manager', 'owner']}>
                      <StockControl />
                    </ProtectedRoute>
                  } />
                  
                  {/* Team Member Profile */}
                  <Route path="/team/member/:id" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <TeamMemberProfile />
                    </ProtectedRoute>
                  } />
                  
                  {/* Team Roles */}
                  <Route path="/team/roles" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'owner']}>
                      <TeamRoles />
                    </ProtectedRoute>
                  } />
                  
                  {/* Vehicle Details */}
                  <Route path="/vehicles/:id" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'service_advisor', 'owner']}>
                      <VehicleDetails />
                    </ProtectedRoute>
                  } />
                  
                  {/* Vehicle Inspection Form */}
                  <Route path="/vehicle-inspection/:vehicleId" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'yard_manager', 'mechanic_manager', 'owner']}>
                      <VehicleInspectionForm />
                    </ProtectedRoute>
                  } />
                  
                  {/* Unauthorized */}
                  <Route path="/unauthorized" element={<Unauthorized />} />
                  
                  {/* Not Found - Catch all */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            </AuthGate>
          }
        />
      </Routes>
      <Toaster />
      <AuthDebugPanel />
      {/* Global UX enhancements */}
      <GlobalUX />
    </>
  );
}

export default App;