import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AuthGate } from '@/components/AuthGate';
import { authMonitor } from '@/utils/authMonitoring';
import { GlobalUX } from '@/components/ux/GlobalUX';
import Index from '@/pages/Index';

// Suspense fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

// ============================================================
// ALL page imports are lazy-loaded for code-splitting
// ============================================================

// Core Pages
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const ModuleHub = lazy(() => import('@/pages/ModuleHub'));
const UpcomingModules = lazy(() => import('@/pages/UpcomingModules'));
const Shopping = lazy(() => import('@/pages/Shopping'));
const ProductDetail = lazy(() => import('@/pages/ProductDetail'));
const CustomerPortal = lazy(() => import('@/pages/CustomerPortal'));
const WorkOrders = lazy(() => import('@/pages/WorkOrders'));
const Customers = lazy(() => import('@/pages/Customers'));
const Inventory = lazy(() => import('@/pages/Inventory'));
const InventoryAnalytics = lazy(() => import('@/pages/InventoryAnalytics'));
const InventoryManager = lazy(() => import('@/pages/InventoryManager'));
const InventoryAdd = lazy(() => import('@/pages/InventoryAdd'));
const ServicePackages = lazy(() => import('@/pages/ServicePackages'));
const AssetUsageTracking = lazy(() => import('@/pages/AssetUsageTracking'));
const ConsumptionTracking = lazy(() => import('@/pages/ConsumptionTracking'));
const MobileInventory = lazy(() => import('@/pages/MobileInventory'));
const MaintenancePlanning = lazy(() => import('@/pages/MaintenancePlanning'));
const Analytics = lazy(() => import('@/pages/Analytics'));
const Settings = lazy(() => import('@/pages/Settings'));
const Calendar = lazy(() => import('@/pages/Calendar'));
const Team = lazy(() => import('@/pages/Team'));
const CustomerComms = lazy(() => import('@/pages/CustomerComms'));
const CallLogger = lazy(() => import('@/pages/CallLogger'));
const Help = lazy(() => import('@/pages/Help'));
const ServiceReminders = lazy(() => import('@/pages/ServiceReminders'));
const Quotes = lazy(() => import('@/pages/Quotes'));
const Invoices = lazy(() => import('@/pages/Invoices'));
const ServiceBoard = lazy(() => import('@/pages/ServiceBoard'));
const Payments = lazy(() => import('@/pages/Payments'));
const CompanyProfile = lazy(() => import('@/pages/CompanyProfile'));
const Documents = lazy(() => import('@/pages/Documents'));
const Contacts = lazy(() => import('@/pages/Contacts'));
const ServiceCatalog = lazy(() => import('@/pages/ServiceCatalog'));
const RepairPlans = lazy(() => import('@/pages/RepairPlans'));
const Login = lazy(() => import('@/pages/Login'));
const StaffLogin = lazy(() => import('@/pages/StaffLogin'));
const Signup = lazy(() => import('@/pages/Signup'));
const About = lazy(() => import('@/pages/About'));
const Pricing = lazy(() => import('@/pages/Pricing'));
const ArticleViewer = lazy(() => import('@/components/help/ArticleViewer').then(m => ({ default: m.ArticleViewer })));
const LearningPathDetail = lazy(() => import('@/components/help/LearningPathDetail').then(m => ({ default: m.LearningPathDetail })));
const ServiceManagementPage = lazy(() => import('@/pages/developer/ServiceManagementPage').then(m => ({ default: m.ServiceManagementPage })));
const InvoiceDetails = lazy(() => import('@/pages/InvoiceDetails'));
const SignatureDemo = lazy(() => import('@/pages/SignatureDemo'));
const EquipmentManagement = lazy(() => import('@/pages/EquipmentManagement'));
const Equipment = lazy(() => import('@/pages/Equipment'));
const EquipmentDetails = lazy(() => import('@/pages/EquipmentDetails'));
const EquipmentDashboard = lazy(() => import('@/pages/EquipmentDashboard'));
const FleetManagement = lazy(() => import('@/pages/FleetManagement'));
const SafetyEquipment = lazy(() => import('@/pages/SafetyEquipment'));
const MaintenanceRequests = lazy(() => import('@/pages/MaintenanceRequests'));
const ShoppingCartPage = lazy(() => import('@/pages/ShoppingCart'));
const WishlistPage = lazy(() => import('@/pages/WishlistPage'));
const Orders = lazy(() => import('@/pages/Orders'));
const Security = lazy(() => import('@/pages/Security'));
const Profile = lazy(() => import('@/pages/Profile'));
const Notifications = lazy(() => import('@/pages/Notifications'));
const Reports = lazy(() => import('@/pages/Reports'));
const Projects = lazy(() => import('@/pages/Projects'));
const ProjectDetails = lazy(() => import('@/pages/ProjectDetails'));
const Forms = lazy(() => import('@/pages/Forms'));
const FormSubmissions = lazy(() => import('@/pages/FormSubmissions'));
const QuoteDetails = lazy(() => import('@/pages/QuoteDetails'));
const WorkOrderDetails = lazy(() => import('@/pages/WorkOrderDetails'));
const RepairPlanDetails = lazy(() => import('@/pages/RepairPlanDetails'));
const AIHub = lazy(() => import('@/pages/AIHub'));
const Chat = lazy(() => import('@/pages/Chat'));
const EmailCampaigns = lazy(() => import('@/pages/EmailCampaigns'));
const EmailSequences = lazy(() => import('@/pages/EmailSequences'));
const EmailTemplates = lazy(() => import('@/pages/EmailTemplates'));
const Feedback = lazy(() => import('@/pages/Feedback'));
const FeedbackFormsPage = lazy(() => import('@/pages/feedback/FeedbackFormsPage'));
const FeedbackFormEditorPage = lazy(() => import('@/pages/feedback/FeedbackFormEditorPage'));
const FeedbackAnalyticsPage = lazy(() => import('@/pages/feedback/FeedbackAnalyticsPage'));
const SystemAdmin = lazy(() => import('@/pages/SystemAdmin'));
const WaterDeliveryDeveloper = lazy(() => import('@/pages/water-delivery/WaterDeliveryDeveloper'));
const AutomotiveDeveloper = lazy(() => import('@/pages/automotive/AutomotiveDeveloper'));
const GunsmithDeveloper = lazy(() => import('@/pages/gunsmith/GunsmithDeveloper'));
const MarineDeveloper = lazy(() => import('@/pages/marine/MarineDeveloper'));
const FuelDeliveryDeveloper = lazy(() => import('@/pages/fuel-delivery/FuelDeliveryDeveloper'));
const PowerWashingDeveloper = lazy(() => import('@/pages/power-washing/PowerWashingDeveloper'));
const SmsManagement = lazy(() => import('@/pages/SmsManagement'));
const SmsTemplates = lazy(() => import('@/pages/SmsTemplates'));
const Timesheet = lazy(() => import('@/pages/Timesheet'));
const FeatureRequests = lazy(() => import('@/pages/FeatureRequests'));
const EquipmentTracking = lazy(() => import('@/pages/EquipmentTracking'));
const EmployeeScheduling = lazy(() => import('@/pages/EmployeeScheduling'));
const TrainingOverview = lazy(() => import('@/pages/TrainingOverview'));
const DailyLogs = lazy(() => import('@/pages/DailyLogs'));
const Insurance = lazy(() => import('@/pages/Insurance'));
const FuelManagement = lazy(() => import('@/pages/FuelManagement'));
const Warranties = lazy(() => import('@/pages/Warranties'));
const DriverManagement = lazy(() => import('@/pages/DriverManagement'));
const TireManagement = lazy(() => import('@/pages/TireManagement'));
const AccountingIntegration = lazy(() => import('@/pages/AccountingIntegration'));
const Safety = lazy(() => import('@/pages/Safety'));
const SafetyIncidents = lazy(() => import('@/pages/SafetyIncidents'));
const SafetyIncidentNew = lazy(() => import('@/pages/SafetyIncidentNew'));
const SafetyIncidentDetails = lazy(() => import('@/pages/SafetyIncidentDetails'));
const SafetyInspections = lazy(() => import('@/pages/SafetyInspections'));
const SafetyInspectionNew = lazy(() => import('@/pages/SafetyInspectionNew'));
const SafetyDVIR = lazy(() => import('@/pages/SafetyDVIR'));
const SafetyDVIRNew = lazy(() => import('@/pages/SafetyDVIRNew'));
const SafetyDVIRDetails = lazy(() => import('@/pages/SafetyDVIRDetails'));
const SafetyLiftInspections = lazy(() => import('@/pages/SafetyLiftInspections'));
const ForkliftInspection = lazy(() => import('@/pages/ForkliftInspection'));
const VesselInspection = lazy(() => import('@/pages/VesselInspection'));
const VesselInspectionHistoryPage = lazy(() => import('@/pages/VesselInspectionHistoryPage'));
const InspectionAnalytics = lazy(() => import('@/pages/InspectionAnalytics'));
const SafetyLiftInspectionNew = lazy(() => import('@/pages/SafetyLiftInspectionNew'));
const SafetyDocuments = lazy(() => import('@/pages/SafetyDocuments'));
const SafetyCertifications = lazy(() => import('@/pages/SafetyCertifications'));
const SafetySchedules = lazy(() => import('@/pages/SafetySchedules'));
const SafetyReports = lazy(() => import('@/pages/SafetyReports'));
const SafetyCorrectiveActions = lazy(() => import('@/pages/SafetyCorrectiveActions'));
const SafetyNearMiss = lazy(() => import('@/pages/SafetyNearMiss'));
const SafetyTraining = lazy(() => import('@/pages/SafetyTraining'));
const SafetyMeetings = lazy(() => import('@/pages/SafetyMeetings'));
const SafetyJSA = lazy(() => import('@/pages/SafetyJSA'));
const SafetyPPE = lazy(() => import('@/pages/SafetyPPE'));
const SafetyContractors = lazy(() => import('@/pages/SafetyContractors'));
const SafetyGamification = lazy(() => import('@/pages/SafetyGamification'));
const TechnicianPortal = lazy(() => import('@/pages/TechnicianPortal'));
const SetupBrianAuth = lazy(() => import('@/pages/SetupBrianAuth'));
const Onboarding = lazy(() => import('@/pages/Onboarding'));
const ShopSetup = lazy(() => import('@/pages/ShopSetup'));
const SecurityAudit = lazy(() => import('@/pages/SecurityAudit'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const Planner = lazy(() => import('@/pages/Planner'));
const Payroll = lazy(() => import('@/pages/Payroll'));
const AdvancedAnalytics = lazy(() => import('@/pages/AdvancedAnalytics'));
const AffiliateTool = lazy(() => import('@/pages/AffiliateTool'));
const AffiliateVerification = lazy(() => import('@/pages/AffiliateVerification'));
const Store = lazy(() => import('@/pages/Store'));
const BoatInspection = lazy(() => import('@/pages/BoatInspection'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const ClientBooking = lazy(() => import('@/pages/ClientBooking'));
const BookingManagement = lazy(() => import('@/pages/BookingManagement'));
const CustomerAnalytics = lazy(() => import('@/pages/CustomerAnalytics'));
const CustomerExperience = lazy(() => import('@/pages/CustomerExperience'));
const CustomerFollowUps = lazy(() => import('@/pages/CustomerFollowUps'));
const CustomerPortalLoginOld = lazy(() => import('@/pages/CustomerPortalLogin'));
const CustomerPortalAuthLogin = lazy(() => import('@/pages/customer-portal/CustomerPortalLogin'));
const CustomerPortalRegister = lazy(() => import('@/pages/customer-portal/CustomerPortalRegister'));
const CustomerPortalDashboard = lazy(() => import('@/pages/customer-portal/CustomerPortalDashboard'));
const CustomerPortalLanding = lazy(() => import('@/pages/customer-portal/CustomerPortalLanding'));
const BusinessLanding = lazy(() => import('@/pages/customer-portal/BusinessLanding'));
const CustomerServiceHistory = lazy(() => import('@/pages/CustomerServiceHistory'));
const EmailCampaignAnalytics = lazy(() => import('@/pages/EmailCampaignAnalytics'));
const EmailSequenceDetails = lazy(() => import('@/pages/EmailSequenceDetails'));
const Enterprise = lazy(() => import('@/pages/Enterprise'));
const EnterpriseAdmin = lazy(() => import('@/pages/EnterpriseAdmin'));
const InventoryAutomation = lazy(() => import('@/pages/InventoryAutomation'));
const InventoryCategories = lazy(() => import('@/pages/InventoryCategories'));
const InventoryLocations = lazy(() => import('@/pages/InventoryLocations'));
const InventoryOrders = lazy(() => import('@/pages/InventoryOrders'));
const InventorySuppliers = lazy(() => import('@/pages/InventorySuppliers'));
const InvoiceCreate = lazy(() => import('@/pages/InvoiceCreate'));
const InvoiceScan = lazy(() => import('@/pages/InvoiceScan'));
const MaintenanceDashboard = lazy(() => import('@/pages/MaintenanceDashboard'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const OrderConfirmation = lazy(() => import('@/pages/OrderConfirmation'));
const PartsTracking = lazy(() => import('@/pages/PartsTracking'));
const PurchaseOrders = lazy(() => import('@/pages/PurchaseOrders'));
const StockControl = lazy(() => import('@/pages/StockControl'));
const TeamMemberProfile = lazy(() => import('@/pages/TeamMemberProfile'));
const TeamRoles = lazy(() => import('@/pages/TeamRoles'));
const Unauthorized = lazy(() => import('@/pages/Unauthorized'));
const VehicleDetails = lazy(() => import('@/pages/VehicleDetails'));
const VehicleInspectionForm = lazy(() => import('@/pages/VehicleInspectionForm'));
const TermsOfService = lazy(() => import('@/pages/legal/TermsOfService'));
const PrivacyPolicy = lazy(() => import('@/pages/legal/PrivacyPolicy'));
const ModuleLearnMore = lazy(() => import('@/pages/ModuleLearnMore'));

// Power Washing
const PowerWashingDashboard = lazy(() => import('@/pages/power-washing/PowerWashingDashboard'));
const PowerWashingJobsList = lazy(() => import('@/pages/power-washing/PowerWashingJobsList'));
const PowerWashingJobCreate = lazy(() => import('@/pages/power-washing/PowerWashingJobCreate'));
const PowerWashingJobDetails = lazy(() => import('@/pages/power-washing/PowerWashingJobDetails'));
const PowerWashingJobEdit = lazy(() => import('@/pages/power-washing/PowerWashingJobEdit'));
const PowerWashingEquipment = lazy(() => import('@/pages/power-washing/PowerWashingEquipment'));
const PowerWashingEquipmentCreate = lazy(() => import('@/pages/power-washing/PowerWashingEquipmentCreate'));
const PowerWashingEquipmentDetail = lazy(() => import('@/pages/power-washing/PowerWashingEquipmentDetail'));
const PowerWashingChemicals = lazy(() => import('@/pages/power-washing/PowerWashingChemicals'));
const PowerWashingChemicalCreate = lazy(() => import('@/pages/power-washing/PowerWashingChemicalCreate'));
const PowerWashingInventory = lazy(() => import('@/pages/power-washing/PowerWashingInventory'));
const PowerWashingQuoteForm = lazy(() => import('@/pages/power-washing/PowerWashingQuoteForm'));
const PowerWashingQuotesList = lazy(() => import('@/pages/power-washing/PowerWashingQuotesList'));
const PowerWashingFormulas = lazy(() => import('@/pages/power-washing/PowerWashingFormulas'));
const BleachCalculator = lazy(() => import('@/pages/power-washing/BleachCalculator'));
const SurfaceMixCalculator = lazy(() => import('@/pages/power-washing/SurfaceMixCalculator'));
const PowerWashingRecurringSchedules = lazy(() => import('@/pages/power-washing/PowerWashingRecurringSchedules'));
const PowerWashingInvoices = lazy(() => import('@/pages/power-washing/PowerWashingInvoices'));
const PowerWashingInvoiceDetail = lazy(() => import('@/pages/power-washing/PowerWashingInvoiceDetail'));
const PowerWashingReports = lazy(() => import('@/pages/power-washing/PowerWashingReports'));
const PowerWashingRoutes = lazy(() => import('@/pages/power-washing/PowerWashingRoutes'));
const PowerWashingRouteDetail = lazy(() => import('@/pages/power-washing/PowerWashingRouteDetail'));
const PowerWashingReviews = lazy(() => import('@/pages/power-washing/PowerWashingReviews'));
const PowerWashingNotifications = lazy(() => import('@/pages/power-washing/PowerWashingNotifications'));
const PowerWashingFieldView = lazy(() => import('@/pages/power-washing/PowerWashingFieldView'));
const PowerWashingPriceBook = lazy(() => import('@/pages/power-washing/PowerWashingPriceBook'));
const PowerWashingAnalytics = lazy(() => import('@/pages/power-washing/PowerWashingAnalytics'));
const PowerWashingWeather = lazy(() => import('@/pages/power-washing/PowerWashingWeather'));
const PowerWashingPhotos = lazy(() => import('@/pages/power-washing/PowerWashingPhotos'));
const PowerWashingSubscriptions = lazy(() => import('@/pages/power-washing/PowerWashingSubscriptions'));
const PowerWashingCustomerPortal = lazy(() => import('@/pages/power-washing/PowerWashingCustomerPortal'));
const PowerWashingPayments = lazy(() => import('@/pages/power-washing/PowerWashingPayments'));
const PowerWashingSchedule = lazy(() => import('@/pages/power-washing/PowerWashingSchedule'));
const PowerWashingLeads = lazy(() => import('@/pages/power-washing/PowerWashingLeads'));
const PowerWashingFleet = lazy(() => import('@/pages/power-washing/PowerWashingFleet'));
const PowerWashingStore = lazy(() => import('@/pages/power-washing/PowerWashingStore'));
const PowerWashingCustomers = lazy(() => import('@/pages/power-washing/PowerWashingCustomers'));
const PowerWashingCustomerCreate = lazy(() => import('@/pages/power-washing/PowerWashingCustomerCreate'));
const PowerWashingCustomerDetail = lazy(() => import('@/pages/power-washing/PowerWashingCustomerDetail'));
const PowerWashingTeam = lazy(() => import('@/pages/power-washing/PowerWashingTeam'));
const PowerWashingRoles = lazy(() => import('@/pages/power-washing/PowerWashingRoles'));
const PowerWashingQuoteDetail = lazy(() => import('@/pages/power-washing/PowerWashingQuoteDetail'));
const PowerWashingSettings = lazy(() => import('@/pages/power-washing/PowerWashingSettings'));
const PowerWashingPricingFormulas = lazy(() => import('@/pages/power-washing/PowerWashingPricingFormulas'));

// Gunsmith
const GunsmithDashboard = lazy(() => import('@/pages/gunsmith/GunsmithDashboard'));
const GunsmithJobs = lazy(() => import('@/pages/gunsmith/GunsmithJobs'));
const GunsmithCustomers = lazy(() => import('@/pages/gunsmith/GunsmithCustomers'));
const GunsmithCustomerCreate = lazy(() => import('@/pages/gunsmith/GunsmithCustomerCreate'));
const GunsmithCustomerDetail = lazy(() => import('@/pages/gunsmith/GunsmithCustomerDetail'));
const GunsmithFirearms = lazy(() => import('@/pages/gunsmith/GunsmithFirearms'));
const GunsmithParts = lazy(() => import('@/pages/gunsmith/GunsmithParts'));
const GunsmithPartsOnOrder = lazy(() => import('@/pages/gunsmith/GunsmithPartsOnOrder'));
const GunsmithQuotes = lazy(() => import('@/pages/gunsmith/GunsmithQuotes'));
const GunsmithInvoices = lazy(() => import('@/pages/gunsmith/GunsmithInvoices'));
const GunsmithPayments = lazy(() => import('@/pages/gunsmith/GunsmithPayments'));
const GunsmithAppointments = lazy(() => import('@/pages/gunsmith/GunsmithAppointments'));
const GunsmithCompliance = lazy(() => import('@/pages/gunsmith/GunsmithCompliance'));
const GunsmithTransfers = lazy(() => import('@/pages/gunsmith/GunsmithTransfers'));
const GunsmithConsignments = lazy(() => import('@/pages/gunsmith/GunsmithConsignments'));
const GunsmithJobForm = lazy(() => import('@/pages/gunsmith/GunsmithJobForm'));
const GunsmithQuoteForm = lazy(() => import('@/pages/gunsmith/GunsmithQuoteForm'));
const GunsmithJobDetail = lazy(() => import('@/pages/gunsmith/GunsmithJobDetail'));
const GunsmithQuoteDetail = lazy(() => import('@/pages/gunsmith/GunsmithQuoteDetail'));
const GunsmithFirearmForm = lazy(() => import('@/pages/gunsmith/GunsmithFirearmForm'));
const GunsmithPartForm = lazy(() => import('@/pages/gunsmith/GunsmithPartForm'));
const GunsmithAppointmentForm = lazy(() => import('@/pages/gunsmith/GunsmithAppointmentForm'));
const GunsmithInvoiceForm = lazy(() => import('@/pages/gunsmith/GunsmithInvoiceForm'));
const GunsmithTransferForm = lazy(() => import('@/pages/gunsmith/GunsmithTransferForm'));
const GunsmithConsignmentForm = lazy(() => import('@/pages/gunsmith/GunsmithConsignmentForm'));
const GunsmithFirearmEdit = lazy(() => import('@/pages/gunsmith/GunsmithFirearmEdit'));
const GunsmithPartEdit = lazy(() => import('@/pages/gunsmith/GunsmithPartEdit'));
const GunsmithInventory = lazy(() => import('@/pages/gunsmith/GunsmithInventory'));
const GunsmithStockAdjust = lazy(() => import('@/pages/gunsmith/GunsmithStockAdjust'));
const GunsmithPurchaseOrderForm = lazy(() => import('@/pages/gunsmith/GunsmithPurchaseOrderForm'));
const GunsmithSerializedForm = lazy(() => import('@/pages/gunsmith/GunsmithSerializedForm'));
const GunsmithUsefulLinks = lazy(() => import('@/pages/gunsmith/GunsmithUsefulLinks'));
const GunsmithChangeLog = lazy(() => import('@/pages/gunsmith/GunsmithChangeLog'));
const GunsmithSettings = lazy(() => import('@/pages/gunsmith/GunsmithSettings'));
const GunsmithTeam = lazy(() => import('@/pages/gunsmith/GunsmithTeam'));
const GunsmithRoles = lazy(() => import('@/pages/gunsmith/GunsmithRoles'));
const GunsmithStore = lazy(() => import('@/pages/gunsmith/GunsmithStore'));

// Automotive
const AutomotiveDashboard = lazy(() => import('@/pages/automotive/AutomotiveDashboard'));
const AutomotiveVehicleHistory = lazy(() => import('@/pages/automotive/AutomotiveVehicleHistory'));
const AutomotiveDiagnostics = lazy(() => import('@/pages/automotive/AutomotiveDiagnostics'));
const AutomotiveLaborRates = lazy(() => import('@/pages/automotive/AutomotiveLaborRates'));
const AutomotiveRecalls = lazy(() => import('@/pages/automotive/AutomotiveRecalls'));
const AutomotiveStore = lazy(() => import('@/pages/automotive/AutomotiveStore'));

// Marine
const MarineDashboard = lazy(() => import('@/pages/marine/MarineDashboard'));
const MarineStore = lazy(() => import('@/pages/marine/MarineStore'));

// Fuel Delivery
const FuelDeliveryDashboard = lazy(() => import('@/pages/fuel-delivery/FuelDeliveryDashboard'));
const FuelDeliveryOrders = lazy(() => import('@/pages/fuel-delivery/FuelDeliveryOrders'));
const FuelDeliveryOrderForm = lazy(() => import('@/pages/fuel-delivery/FuelDeliveryOrderForm'));
const FuelDeliveryCustomers = lazy(() => import('@/pages/fuel-delivery/FuelDeliveryCustomers'));
const FuelDeliveryLocations = lazy(() => import('@/pages/fuel-delivery/FuelDeliveryLocations'));
const FuelDeliveryProducts = lazy(() => import('@/pages/fuel-delivery/FuelDeliveryProducts'));
const FuelDeliveryTrucks = lazy(() => import('@/pages/fuel-delivery/FuelDeliveryTrucks'));
const FuelDeliveryDrivers = lazy(() => import('@/pages/fuel-delivery/FuelDeliveryDrivers'));
const FuelDeliveryRoutes = lazy(() => import('@/pages/fuel-delivery/FuelDeliveryRoutes'));
const FuelDeliveryCompletions = lazy(() => import('@/pages/fuel-delivery/FuelDeliveryCompletions'));
const FuelDeliveryInventory = lazy(() => import('@/pages/fuel-delivery/FuelDeliveryInventory'));
const FuelDeliveryInvoices = lazy(() => import('@/pages/fuel-delivery/FuelDeliveryInvoices'));
const FuelDeliveryDriverApp = lazy(() => import('@/pages/fuel-delivery/FuelDeliveryDriverApp'));
const FuelDeliveryPricing = lazy(() => import('@/pages/fuel-delivery/FuelDeliveryPricing'));
const FuelDeliveryTanks = lazy(() => import('@/pages/fuel-delivery/FuelDeliveryTanks'));
const FuelDeliveryTidyTanks = lazy(() => import('@/pages/fuel-delivery/FuelDeliveryTidyTanks'));
const FuelDeliveryTankFills = lazy(() => import('@/pages/fuel-delivery/FuelDeliveryTankFills'));
const FuelDeliveryEquipment = lazy(() => import('@/pages/fuel-delivery/FuelDeliveryEquipment'));
const FuelDeliveryEquipmentFilters = lazy(() => import('@/pages/fuel-delivery/FuelDeliveryEquipmentFilters'));
const FuelDeliveryQuotes = lazy(() => import('@/pages/fuel-delivery/FuelDeliveryQuotes'));
const FuelDeliveryProfile = lazy(() => import('@/pages/fuel-delivery/FuelDeliveryProfile'));
const FuelDeliverySettings = lazy(() => import('@/pages/fuel-delivery/FuelDeliverySettings'));
const FuelDeliveryPurchases = lazy(() => import('@/pages/fuel-delivery/FuelDeliveryPurchases'));
const FuelDeliveryStore = lazy(() => import('@/pages/fuel-delivery/FuelDeliveryStore'));
import { FuelDeliveryLayout } from '@/components/fuel-delivery';

// Fuel Delivery Portal
const FuelDeliveryPortalLanding = lazy(() => import('@/pages/fuel-delivery-portal/FuelDeliveryPortalLanding'));
const FuelDeliveryPortalRegister = lazy(() => import('@/pages/fuel-delivery-portal/FuelDeliveryPortalRegister'));
const FuelDeliveryPortalLogin = lazy(() => import('@/pages/fuel-delivery-portal/FuelDeliveryPortalLogin'));
const FuelDeliveryPortalDashboard = lazy(() => import('@/pages/fuel-delivery-portal/FuelDeliveryPortalDashboard'));
const FuelDeliveryPortalRequest = lazy(() => import('@/pages/fuel-delivery-portal/FuelDeliveryPortalRequest'));
const FuelDeliveryPortalOrders = lazy(() => import('@/pages/fuel-delivery-portal/FuelDeliveryPortalOrders'));
const FuelDeliveryPortalLocations = lazy(() => import('@/pages/fuel-delivery-portal/FuelDeliveryPortalLocations'));
const FuelDeliveryPortalAccount = lazy(() => import('@/pages/fuel-delivery-portal/FuelDeliveryPortalAccount'));

// Septic Portal
const SepticPortalLanding = lazy(() => import('@/pages/septic-portal/SepticPortalLanding'));
const SepticPortalLogin = lazy(() => import('@/pages/septic-portal/SepticPortalLogin'));
const SepticPortalRegister = lazy(() => import('@/pages/septic-portal/SepticPortalRegister'));
const SepticPortalDashboard = lazy(() => import('@/pages/septic-portal/SepticPortalDashboard'));

// Water Delivery
const WaterDeliveryDashboard = lazy(() => import('@/pages/water-delivery/WaterDeliveryDashboard'));
const WaterDeliveryOrders = lazy(() => import('@/pages/water-delivery/WaterDeliveryOrders'));
const WaterDeliveryOrderForm = lazy(() => import('@/pages/water-delivery/WaterDeliveryOrderForm'));
const WaterDeliveryCustomers = lazy(() => import('@/pages/water-delivery/WaterDeliveryCustomers'));
const WaterDeliveryCustomerDetails = lazy(() => import('@/pages/water-delivery/WaterDeliveryCustomerDetails'));
const WaterDeliveryLocations = lazy(() => import('@/pages/water-delivery/WaterDeliveryLocations'));
const WaterDeliveryProducts = lazy(() => import('@/pages/water-delivery/WaterDeliveryProducts'));
const WaterDeliveryTrucks = lazy(() => import('@/pages/water-delivery/WaterDeliveryTrucks'));
const WaterDeliveryDrivers = lazy(() => import('@/pages/water-delivery/WaterDeliveryDrivers'));
const WaterDeliveryDriverDetail = lazy(() => import('@/pages/water-delivery/WaterDeliveryDriverDetail'));
const WaterDeliveryRoutes = lazy(() => import('@/pages/water-delivery/WaterDeliveryRoutes'));
const WaterDeliveryCompletions = lazy(() => import('@/pages/water-delivery/WaterDeliveryCompletions'));
const WaterDeliveryInventory = lazy(() => import('@/pages/water-delivery/WaterDeliveryPartsInventory'));
const WaterDeliveryInvoices = lazy(() => import('@/pages/water-delivery/WaterDeliveryInvoices'));
const WaterDeliveryDriverApp = lazy(() => import('@/pages/water-delivery/WaterDeliveryDriverApp'));
const WaterDeliveryPricing = lazy(() => import('@/pages/water-delivery/WaterDeliveryPricing'));
const WaterDeliveryTanks = lazy(() => import('@/pages/water-delivery/WaterDeliveryTanks'));
const WaterDeliveryTidyTanks = lazy(() => import('@/pages/water-delivery/WaterDeliveryTidyTanks'));
const WaterDeliveryTankFills = lazy(() => import('@/pages/water-delivery/WaterDeliveryTankFills'));
const WaterDeliveryEquipment = lazy(() => import('@/pages/water-delivery/WaterDeliveryEquipment'));
const WaterDeliveryEquipmentFilters = lazy(() => import('@/pages/water-delivery/WaterDeliveryEquipmentFilters'));
const WaterDeliveryQuotes = lazy(() => import('@/pages/water-delivery/WaterDeliveryQuotes'));
const WaterDeliveryProfile = lazy(() => import('@/pages/water-delivery/WaterDeliveryProfile'));
const WaterDeliverySettings = lazy(() => import('@/pages/water-delivery/WaterDeliverySettings'));
const WaterDeliveryPurchases = lazy(() => import('@/pages/water-delivery/WaterDeliveryPurchases'));
const WaterDeliveryStaff = lazy(() => import('@/pages/water-delivery/WaterDeliveryStaff'));
const WaterDeliveryPartsInventory = lazy(() => import('@/pages/water-delivery/WaterDeliveryPartsInventory'));
const WaterDeliveryStore = lazy(() => import('@/pages/water-delivery/WaterDeliveryStore'));
import { WaterDeliveryLayout } from '@/components/water-delivery';

// Septic Services
const SepticDashboard = lazy(() => import('@/pages/septic/SepticDashboard'));
const SepticOrders = lazy(() => import('@/pages/septic/SepticOrders'));
const SepticOrderForm = lazy(() => import('@/pages/septic/SepticOrderForm'));
const SepticCustomers = lazy(() => import('@/pages/septic/SepticCustomers'));
const SepticCustomerDetails = lazy(() => import('@/pages/septic/SepticCustomerDetails'));
const SepticLocations = lazy(() => import('@/pages/septic/SepticLocations'));
const SepticProducts = lazy(() => import('@/pages/septic/SepticProducts'));
const SepticTrucks = lazy(() => import('@/pages/septic/SepticTrucks'));
const SepticDrivers = lazy(() => import('@/pages/septic/SepticDrivers'));
const SepticDriverDetail = lazy(() => import('@/pages/septic/SepticDriverDetail'));
const SepticRoutes = lazy(() => import('@/pages/septic/SepticRoutes'));
const SepticCompletions = lazy(() => import('@/pages/septic/SepticCompletions'));
const SepticInventory = lazy(() => import('@/pages/septic/SepticInventory'));
const SepticInvoices = lazy(() => import('@/pages/septic/SepticInvoices'));
const SepticDriverApp = lazy(() => import('@/pages/septic/SepticDriverApp'));
const SepticPricing = lazy(() => import('@/pages/septic/SepticPricing'));
const SepticTanks = lazy(() => import('@/pages/septic/SepticTanks'));
const SepticTidyTanks = lazy(() => import('@/pages/septic/SepticTidyTanks'));
const SepticTankFills = lazy(() => import('@/pages/septic/SepticTankFills'));
const SepticEquipment = lazy(() => import('@/pages/septic/SepticEquipment'));
const SepticEquipmentFilters = lazy(() => import('@/pages/septic/SepticEquipmentFilters'));
const SepticQuotes = lazy(() => import('@/pages/septic/SepticQuotes'));
const SepticProfile = lazy(() => import('@/pages/septic/SepticProfile'));
const SepticSettings = lazy(() => import('@/pages/septic/SepticSettings'));
const SepticPurchases = lazy(() => import('@/pages/septic/SepticPurchases'));
const SepticStaff = lazy(() => import('@/pages/septic/SepticStaff'));
const SepticStore = lazy(() => import('@/pages/septic/SepticStore'));
const SepticInspections = lazy(() => import('@/pages/septic/SepticInspections'));
const SepticDeveloper = lazy(() => import('@/pages/septic/SepticDeveloper'));
import { SepticLayout } from '@/components/septic';

function App() {
  useEffect(() => {
    // Initialize auth monitoring
    console.log('🚀 App initialized with auth monitoring');
  }, []);

  return (
    <>
      <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes - no auth required */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/about" element={<About />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/setup-brian" element={<SetupBrianAuth />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/shop-setup" element={<ShopSetup />} />
        <Route path="/affiliate-verify" element={<AffiliateVerification />} />
        <Route path="/modules/:slug" element={<ModuleLearnMore />} />
        <Route path="/customer-portal-login" element={<CustomerPortalLoginOld />} />
        <Route path="/customer-portal" element={<CustomerPortalLanding />} />
        <Route path="/customer-portal/login" element={<CustomerPortalAuthLogin />} />
        <Route path="/customer-portal/register" element={<CustomerPortalRegister />} />
        
        {/* Fuel Delivery Customer Portal - Public routes */}
        <Route path="/fuel-delivery-portal" element={<FuelDeliveryPortalLanding />} />
        <Route path="/fuel-delivery-portal/register" element={<FuelDeliveryPortalRegister />} />
        <Route path="/fuel-delivery-portal/login" element={<FuelDeliveryPortalLogin />} />
        <Route path="/fuel-delivery-portal/dashboard" element={<FuelDeliveryPortalDashboard />} />
        <Route path="/fuel-delivery-portal/request" element={<FuelDeliveryPortalRequest />} />
        <Route path="/fuel-delivery-portal/orders" element={<FuelDeliveryPortalOrders />} />
        <Route path="/fuel-delivery-portal/locations" element={<FuelDeliveryPortalLocations />} />
        <Route path="/fuel-delivery-portal/account" element={<FuelDeliveryPortalAccount />} />
        
        {/* Septic Customer Portal - Public routes */}
        <Route path="/septic-portal" element={<SepticPortalLanding />} />
        <Route path="/septic-portal/login" element={<SepticPortalLogin />} />
        <Route path="/septic-portal/register" element={<SepticPortalRegister />} />
        <Route path="/septic-portal/dashboard" element={<SepticPortalDashboard />} />
        
        <Route path="/customer-portal/dashboard" element={<CustomerPortalDashboard />} />
        <Route path="/b/:slug" element={<BusinessLanding />} />
        <Route path="/staff-login" element={<StaffLogin />} />
        
        {/* Protected routes */}
        <Route
          path="/*"
          element={
            <AuthGate>
              <Layout>
                <Routes>
                  <Route path="/module-hub" element={<ModuleHub />} />
                  <Route path="/upcoming-modules" element={<UpcomingModules />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  {/* Automotive Module */}
                  <Route path="/automotive" element={<AutomotiveDashboard />} />
                  <Route path="/automotive/vehicle-history" element={<AutomotiveVehicleHistory />} />
                  <Route path="/automotive/diagnostics" element={<AutomotiveDiagnostics />} />
                  <Route path="/automotive/labor-rates" element={<AutomotiveLaborRates />} />
                  <Route path="/automotive/recalls" element={<AutomotiveRecalls />} />
                  <Route path="/automotive/store" element={<AutomotiveStore />} />
                  
                  {/* Marine Module */}
                  <Route path="/marine-services" element={<MarineDashboard />} />
                  <Route path="/marine-services/store" element={<MarineStore />} />
                  
                  {/* Store */}
                  <Route path="/store" element={<Store />} />
                  <Route path="/shopping" element={<Shopping />} />
                  <Route path="/shopping/:id" element={<ProductDetail />} />
                  {/* CustomerPortal is accessible via /customer-portal public route */}
                  
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
                  
                  {/* Booking Management */}
                  <Route path="/booking-management" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'service_advisor', 'reception', 'owner']}>
                      <BookingManagement />
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
                  
                  {/* System Admin (formerly Developer Portal) */}
                  <Route path="/system-admin/*" element={
                    <ProtectedRoute requireAdmin={true}>
                      <SystemAdmin />
                    </ProtectedRoute>
                  } />
                  
                  {/* Module Developer Pages */}
                  <Route path="/water-delivery/developer" element={<WaterDeliveryDeveloper />} />
                  <Route path="/automotive/developer" element={<AutomotiveDeveloper />} />
                  <Route path="/gunsmith/developer" element={<GunsmithDeveloper />} />
                  <Route path="/marine-services/developer" element={<MarineDeveloper />} />
                  <Route path="/fuel-delivery/developer" element={<FuelDeliveryDeveloper />} />
                  <Route path="/power-washing/developer" element={<PowerWashingDeveloper />} />
                  
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
                  <Route path="/customer-portal-login" element={<CustomerPortalLoginOld />} />
                  
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
                  
                  {/* Power Washing */}
                  <Route path="/power-washing" element={<PowerWashingDashboard />} />
                  <Route path="/power-washing/jobs" element={<PowerWashingJobsList />} />
                  <Route path="/power-washing/jobs/new" element={<PowerWashingJobCreate />} />
                  <Route path="/power-washing/jobs/:id" element={<PowerWashingJobDetails />} />
                  <Route path="/power-washing/jobs/:id/edit" element={<PowerWashingJobEdit />} />
                  <Route path="/power-washing/quotes" element={<PowerWashingQuotesList />} />
                  <Route path="/power-washing/quotes/new" element={<PowerWashingQuoteForm />} />
                  <Route path="/power-washing/quotes/:id" element={<PowerWashingQuoteDetail />} />
                  <Route path="/power-washing/customers" element={<PowerWashingCustomers />} />
                  <Route path="/power-washing/customers/new" element={<PowerWashingCustomerCreate />} />
                  <Route path="/power-washing/customers/:customerId" element={<PowerWashingCustomerDetail />} />
                  <Route path="/power-washing/equipment" element={<PowerWashingEquipment />} />
                  <Route path="/power-washing/equipment/new" element={<PowerWashingEquipmentCreate />} />
                  <Route path="/power-washing/equipment/:id" element={<PowerWashingEquipmentDetail />} />
                  <Route path="/power-washing/chemicals" element={<PowerWashingChemicals />} />
                  <Route path="/power-washing/chemicals/new" element={<PowerWashingChemicalCreate />} />
                  <Route path="/power-washing/inventory" element={<PowerWashingInventory />} />
                  <Route path="/power-washing/formulas" element={<PowerWashingFormulas />} />
                  <Route path="/power-washing/pricing-formulas" element={<PowerWashingPricingFormulas />} />
                  <Route path="/power-washing/bleach-calculator" element={<BleachCalculator />} />
                  <Route path="/power-washing/surface-calculator" element={<SurfaceMixCalculator />} />
                  <Route path="/power-washing/recurring" element={<PowerWashingRecurringSchedules />} />
                  <Route path="/power-washing/invoices" element={<PowerWashingInvoices />} />
                  <Route path="/power-washing/invoices/:id" element={<PowerWashingInvoiceDetail />} />
                  <Route path="/power-washing/reports" element={<PowerWashingReports />} />
                  <Route path="/power-washing/routes" element={<PowerWashingRoutes />} />
                  <Route path="/power-washing/routes/:id" element={<PowerWashingRouteDetail />} />
                  <Route path="/power-washing/reviews" element={<PowerWashingReviews />} />
                  <Route path="/power-washing/notifications" element={<PowerWashingNotifications />} />
                  <Route path="/power-washing/field" element={<PowerWashingFieldView />} />
                  <Route path="/power-washing/field-view" element={<PowerWashingFieldView />} />
                  <Route path="/power-washing/price-book" element={<PowerWashingPriceBook />} />
                  <Route path="/power-washing/analytics" element={<PowerWashingAnalytics />} />
                  <Route path="/power-washing/weather" element={<PowerWashingWeather />} />
                  <Route path="/power-washing/photos" element={<PowerWashingPhotos />} />
                  <Route path="/power-washing/subscriptions" element={<PowerWashingSubscriptions />} />
                  <Route path="/power-washing/portal" element={<PowerWashingCustomerPortal />} />
                  <Route path="/power-washing/payments" element={<PowerWashingPayments />} />
                  <Route path="/power-washing/schedule" element={<PowerWashingSchedule />} />
                  <Route path="/power-washing/leads" element={<PowerWashingLeads />} />
                  <Route path="/power-washing/fleet" element={<PowerWashingFleet />} />
                  <Route path="/power-washing/store" element={<PowerWashingStore />} />
                  <Route path="/power-washing/team" element={<PowerWashingTeam />} />
                  <Route path="/power-washing/roles" element={<PowerWashingRoles />} />
                  <Route path="/power-washing/settings" element={<PowerWashingSettings />} />
                  
                  {/* Gunsmith Routes */}
                  <Route path="/gunsmith" element={<GunsmithDashboard />} />
                  <Route path="/gunsmith/jobs" element={<GunsmithJobs />} />
                  <Route path="/gunsmith/jobs/new" element={<GunsmithJobForm />} />
                  <Route path="/gunsmith/jobs/:id" element={<GunsmithJobDetail />} />
                  <Route path="/gunsmith/customers" element={<GunsmithCustomers />} />
                  <Route path="/gunsmith/customers/new" element={<GunsmithCustomerCreate />} />
                  <Route path="/gunsmith/customers/:customerId" element={<GunsmithCustomerDetail />} />
                  <Route path="/gunsmith/quotes" element={<GunsmithQuotes />} />
                  <Route path="/gunsmith/quotes/new" element={<GunsmithQuoteForm />} />
                  <Route path="/gunsmith/quotes/:id" element={<GunsmithQuoteDetail />} />
                  <Route path="/gunsmith/firearms" element={<GunsmithFirearms />} />
                  <Route path="/gunsmith/firearms/new" element={<GunsmithFirearmForm />} />
                  <Route path="/gunsmith/firearms/:id" element={<GunsmithFirearmEdit />} />
                  <Route path="/gunsmith/parts" element={<GunsmithParts />} />
                  <Route path="/gunsmith/parts/:id" element={<GunsmithPartEdit />} />
                  <Route path="/gunsmith/parts/new" element={<GunsmithPartForm />} />
                  <Route path="/gunsmith/parts-on-order" element={<GunsmithPartsOnOrder />} />
                  <Route path="/gunsmith/invoices" element={<GunsmithInvoices />} />
                  <Route path="/gunsmith/invoices/new" element={<GunsmithInvoiceForm />} />
                  <Route path="/gunsmith/payments" element={<GunsmithPayments />} />
                  <Route path="/gunsmith/appointments" element={<GunsmithAppointments />} />
                  <Route path="/gunsmith/appointments/new" element={<GunsmithAppointmentForm />} />
                  <Route path="/gunsmith/compliance" element={<GunsmithCompliance />} />
                  <Route path="/gunsmith/transfers" element={<GunsmithTransfers />} />
                  <Route path="/gunsmith/transfers/new" element={<GunsmithTransferForm />} />
                  <Route path="/gunsmith/consignments" element={<GunsmithConsignments />} />
                  <Route path="/gunsmith/consignments/new" element={<GunsmithConsignmentForm />} />
                  <Route path="/gunsmith/inventory" element={<GunsmithInventory />} />
                  <Route path="/gunsmith/inventory/adjust" element={<GunsmithStockAdjust />} />
                  <Route path="/gunsmith/inventory/purchase-orders/new" element={<GunsmithPurchaseOrderForm />} />
                  <Route path="/gunsmith/inventory/serialized/new" element={<GunsmithSerializedForm />} />
                  <Route path="/gunsmith/resources" element={<GunsmithUsefulLinks />} />
                  <Route path="/gunsmith/useful-links" element={<Navigate to="/gunsmith/resources" replace />} />
                  <Route path="/gunsmith/change-log" element={<GunsmithChangeLog />} />
                  <Route path="/gunsmith/settings" element={<GunsmithSettings />} />
                  <Route path="/gunsmith/team" element={<GunsmithTeam />} />
                  <Route path="/gunsmith/roles" element={<GunsmithRoles />} />
                  <Route path="/gunsmith/store" element={<GunsmithStore />} />
                  
                  {/* Not Found - Catch all */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            </AuthGate>
          }
        />
        
        {/* Fuel Delivery Module - Separate Layout */}
        <Route
          path="/fuel-delivery/*"
          element={
            <AuthGate>
              <FuelDeliveryLayout>
                <Routes>
                  <Route path="/" element={<FuelDeliveryDashboard />} />
                  <Route path="/orders" element={<FuelDeliveryOrders />} />
                  <Route path="/orders/new" element={<FuelDeliveryOrderForm />} />
                  <Route path="/orders/:id" element={<FuelDeliveryOrders />} />
                  <Route path="/customers" element={<FuelDeliveryCustomers />} />
                  <Route path="/locations" element={<FuelDeliveryLocations />} />
                  <Route path="/products" element={<FuelDeliveryProducts />} />
                  <Route path="/trucks" element={<FuelDeliveryTrucks />} />
                  <Route path="/drivers" element={<FuelDeliveryDrivers />} />
                  <Route path="/routes" element={<FuelDeliveryRoutes />} />
                  <Route path="/routes/new" element={<FuelDeliveryRoutes />} />
                  <Route path="/deliveries" element={<FuelDeliveryCompletions />} />
                  <Route path="/inventory" element={<FuelDeliveryInventory />} />
                  <Route path="/purchases" element={<FuelDeliveryPurchases />} />
                  <Route path="/invoices" element={<FuelDeliveryInvoices />} />
                  <Route path="/invoices/new" element={<FuelDeliveryInvoices />} />
                  <Route path="/driver-app" element={<FuelDeliveryDriverApp />} />
                  <Route path="/pricing" element={<FuelDeliveryPricing />} />
                  <Route path="/tanks" element={<FuelDeliveryTanks />} />
                  <Route path="/tidy-tanks" element={<FuelDeliveryTidyTanks />} />
                  <Route path="/tank-fills" element={<FuelDeliveryTankFills />} />
                  <Route path="/equipment" element={<FuelDeliveryEquipment />} />
                  <Route path="/equipment-filters" element={<FuelDeliveryEquipmentFilters />} />
                  <Route path="/quotes" element={<FuelDeliveryQuotes />} />
                  <Route path="/profile" element={<FuelDeliveryProfile />} />
                  <Route path="/settings" element={<FuelDeliverySettings />} />
                  <Route path="/store" element={<FuelDeliveryStore />} />
                </Routes>
              </FuelDeliveryLayout>
            </AuthGate>
          }
        />
        
        {/* Water Delivery Module - Separate Layout */}
        <Route
          path="/water-delivery/*"
          element={
            <AuthGate>
              <WaterDeliveryLayout>
                <Routes>
                  <Route path="/" element={<WaterDeliveryDashboard />} />
                  <Route path="/orders" element={<WaterDeliveryOrders />} />
                  <Route path="/orders/new" element={<WaterDeliveryOrderForm />} />
                  <Route path="/orders/:id" element={<WaterDeliveryOrders />} />
                  <Route path="/customers" element={<WaterDeliveryCustomers />} />
                  <Route path="/customers/:customerId" element={<WaterDeliveryCustomerDetails />} />
                  <Route path="/locations" element={<WaterDeliveryLocations />} />
                  <Route path="/products" element={<WaterDeliveryProducts />} />
                  <Route path="/trucks" element={<WaterDeliveryTrucks />} />
                  <Route path="/drivers" element={<WaterDeliveryDrivers />} />
                  <Route path="/drivers/:id" element={<WaterDeliveryDriverDetail />} />
                  <Route path="/routes" element={<WaterDeliveryRoutes />} />
                  <Route path="/routes/new" element={<WaterDeliveryRoutes />} />
                  <Route path="/deliveries" element={<WaterDeliveryCompletions />} />
                  <Route path="/inventory" element={<WaterDeliveryInventory />} />
                  <Route path="/parts-inventory" element={<WaterDeliveryPartsInventory />} />
                  <Route path="/purchases" element={<WaterDeliveryPurchases />} />
                  <Route path="/invoices" element={<WaterDeliveryInvoices />} />
                  <Route path="/invoices/new" element={<WaterDeliveryInvoices />} />
                  <Route path="/driver-app" element={<WaterDeliveryDriverApp />} />
                  <Route path="/pricing" element={<WaterDeliveryPricing />} />
                  <Route path="/tanks" element={<WaterDeliveryTanks />} />
                  <Route path="/tidy-tanks" element={<WaterDeliveryTidyTanks />} />
                  <Route path="/tank-fills" element={<WaterDeliveryTankFills />} />
                  <Route path="/equipment" element={<WaterDeliveryEquipment />} />
                  <Route path="/equipment-filters" element={<WaterDeliveryEquipmentFilters />} />
                  <Route path="/quotes" element={<WaterDeliveryQuotes />} />
                  <Route path="/staff" element={<WaterDeliveryStaff />} />
                  <Route path="/profile" element={<WaterDeliveryProfile />} />
                  <Route path="/settings" element={<WaterDeliverySettings />} />
                  <Route path="/store" element={<WaterDeliveryStore />} />
                  <Route path="/developer" element={<WaterDeliveryDeveloper />} />
                </Routes>
              </WaterDeliveryLayout>
            </AuthGate>
          }
        />

        {/* Septic Services Module */}
        <Route
          path="/septic/*"
          element={
            <AuthGate>
              <SepticLayout>
                <Routes>
                  <Route path="/" element={<SepticDashboard />} />
                  <Route path="/orders" element={<SepticOrders />} />
                  <Route path="/orders/new" element={<SepticOrderForm />} />
                  <Route path="/customers" element={<SepticCustomers />} />
                  <Route path="/customers/:customerId" element={<SepticCustomerDetails />} />
                  <Route path="/locations" element={<SepticLocations />} />
                  <Route path="/products" element={<SepticProducts />} />
                  <Route path="/trucks" element={<SepticTrucks />} />
                  <Route path="/drivers" element={<SepticDrivers />} />
                  <Route path="/drivers/:id" element={<SepticDriverDetail />} />
                  <Route path="/routes" element={<SepticRoutes />} />
                  <Route path="/completions" element={<SepticCompletions />} />
                  <Route path="/inventory" element={<SepticInventory />} />
                  <Route path="/invoices" element={<SepticInvoices />} />
                  <Route path="/driver-app" element={<SepticDriverApp />} />
                  <Route path="/pricing" element={<SepticPricing />} />
                  <Route path="/tanks" element={<SepticTanks />} />
                  <Route path="/tidy-tanks" element={<SepticTidyTanks />} />
                  <Route path="/tank-fills" element={<SepticTankFills />} />
                  <Route path="/equipment" element={<SepticEquipment />} />
                  <Route path="/equipment-filters" element={<SepticEquipmentFilters />} />
                  <Route path="/quotes" element={<SepticQuotes />} />
                  <Route path="/purchases" element={<SepticPurchases />} />
                  <Route path="/staff" element={<SepticStaff />} />
                  <Route path="/inspections" element={<SepticInspections />} />
                  <Route path="/profile" element={<SepticProfile />} />
                  <Route path="/settings" element={<SepticSettings />} />
                  <Route path="/store" element={<SepticStore />} />
                  <Route path="/developer" element={<SepticDeveloper />} />
                </Routes>
              </SepticLayout>
            </AuthGate>
          }
        />
      </Routes>
      </Suspense>
      <Toaster />
      {/* Global UX enhancements */}
      <GlobalUX />
    </>
  );
}

export default App;
