import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { MainLayout } from "@/layouts/MainLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Maintenance } from "@/pages/Maintenance";
import { Pricing } from "@/pages/Pricing";
import { useIsMaintenance } from "@/hooks/useIsMaintenance";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { SettingsLayout } from "@/layouts/SettingsLayout";
import { Onboarding } from "@/pages/Onboarding";
import { useOnboarding } from "@/hooks/useOnboarding";
import ShoppingCategories from './pages/ShoppingCategories';

const Home = lazy(() => import("@/pages/Home"));
const About = lazy(() => import("@/pages/About"));
const Contact = lazy(() => import("@/pages/Contact"));
const Blog = lazy(() => import("@/pages/Blog"));
const Post = lazy(() => import("@/pages/Post"));
const Profile = lazy(() => import("@/pages/Profile"));
const Tasks = lazy(() => import("@/pages/Tasks"));
const Kanban = lazy(() => import("@/pages/Kanban"));
const Chat = lazy(() => import("@/pages/Chat"));
const Settings = lazy(() => import("@/pages/Settings"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const Error404 = lazy(() => import("@/pages/Error404"));
const Error500 = lazy(() => import("@/pages/Error500"));
const ComingSoon = lazy(() => import("@/pages/ComingSoon"));
const Unauthorized = lazy(() => import("@/pages/Unauthorized"));
const AccessDenied = lazy(() => import("@/pages/AccessDenied"));
const Customers = lazy(() => import("@/pages/Customers"));
const Customer = lazy(() => import("@/pages/Customer"));
const Vehicles = lazy(() => import("@/pages/Vehicles"));
const Vehicle = lazy(() => import("@/pages/Vehicle"));
const Calendar = lazy(() => import("@/pages/Calendar"));
const Interactions = lazy(() => import("@/pages/Interactions"));
const Equipment = lazy(() => import("@/pages/Equipment"));
const Team = lazy(() => import("@/pages/Team"));
const Reports = lazy(() => import("@/pages/Reports"));
const WorkOrders = lazy(() => import("@/pages/WorkOrders"));
const WorkOrder = lazy(() => import("@/pages/WorkOrder"));
const Invoices = lazy(() => import("@/pages/Invoices"));
const Invoice = lazy(() => import("@/pages/Invoice"));
const Estimates = lazy(() => import("@/pages/Estimates"));
const Estimate = lazy(() => import("@/pages/Estimate"));
const Subscriptions = lazy(() => import("@/pages/Subscriptions"));
const Subscription = lazy(() => import("@/pages/Subscription"));
const Plans = lazy(() => import("@/pages/Plans"));
const Forms = lazy(() => import("@/pages/Forms"));
const Form = lazy(() => import("@/pages/Form"));
const Payments = lazy(() => import("@/pages/Payments"));
const Shopping = lazy(() => import("@/pages/Shopping"));
const Products = lazy(() => import("@/pages/Products"));
const Wishlist = lazy(() => import("@/pages/Wishlist"));
const Cart = lazy(() => import("@/pages/Cart"));
const Deals = lazy(() => import("@/pages/Deals"));
const Recommendations = lazy(() => import("@/pages/Recommendations"));
const Orders = lazy(() => import("@/pages/Orders"));
const Suggestions = lazy(() => import("@/pages/Suggestions"));
const Saved = lazy(() => import("@/pages/Saved"));
const ShoppingAdmin = lazy(() => import("@/pages/ShoppingAdmin"));
const InventoryDashboard = lazy(() => import("@/pages/Inventory/InventoryDashboard"));
const InventoryItems = lazy(() => import("@/pages/Inventory/InventoryItems"));
const InventoryItem = lazy(() => import("@/pages/Inventory/InventoryItem"));
const InventoryCategories = lazy(() => import("@/pages/Inventory/InventoryCategories"));
const InventorySuppliers = lazy(() => import("@/pages/Inventory/InventorySuppliers"));
const InventoryTransactions = lazy(() => import("@/pages/Inventory/InventoryTransactions"));
const InventoryVendors = lazy(() => import("@/pages/Inventory/InventoryVendors"));
const InventoryPurchaseOrders = lazy(() => import("@/pages/Inventory/InventoryPurchaseOrders"));
const InventoryLocations = lazy(() => import("@/pages/Inventory/InventoryLocations"));

export function AppRoutes() {
  const isMaintenance = useIsMaintenance();
  const { isAuthenticated } = useAuth();
  const { isOnboarding } = useOnboarding();

  if (isMaintenance) {
    return (
      <Routes>
        <Route path="*" element={<Maintenance />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Suspense fallback={<div>Loading...</div>}><Home /></Suspense>} />
        <Route path="/about" element={<Suspense fallback={<div>Loading...</div>}><About /></Suspense>} />
        <Route path="/contact" element={<Suspense fallback={<div>Loading...</div>}><Contact /></Suspense>} />
        <Route path="/blog" element={<Suspense fallback={<div>Loading...</div>}><Blog /></Suspense>} />
        <Route path="/post/:id" element={<Suspense fallback={<div>Loading...</div>}><Post /></Suspense>} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/coming-soon" element={<ComingSoon />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/access-denied" element={<AccessDenied />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Suspense fallback={<div>Loading...</div>}><Login /></Suspense>} />
        <Route path="/register" element={<Suspense fallback={<div>Loading...</div>}><Register /></Suspense>} />
        <Route path="/forgot-password" element={<Suspense fallback={<div>Loading...</div>}><ForgotPassword /></Suspense>} />
        <Route path="/reset-password" element={<Suspense fallback={<div>Loading...</div>}><ResetPassword /></Suspense>} />
      </Route>

      {/* Dashboard Routes */}
      <Route
        element={
          isAuthenticated ? (
            isOnboarding ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <DashboardLayout />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route path="/dashboard" element={<Suspense fallback={<div>Loading...</div>}><Customers /></Suspense>} />
        <Route path="/customers" element={<Suspense fallback={<div>Loading...</div>}><Customers /></Suspense>} />
        <Route path="/customers/:id" element={<Suspense fallback={<div>Loading...</div>}><Customer /></Suspense>} />
        <Route path="/vehicles" element={<Suspense fallback={<div>Loading...</div>}><Vehicles /></Suspense>} />
        <Route path="/vehicles/:id" element={<Suspense fallback={<div>Loading...</div>}><Vehicle /></Suspense>} />
        <Route path="/calendar" element={<Suspense fallback={<div>Loading...</div>}><Calendar /></Suspense>} />
        <Route path="/interactions" element={<Suspense fallback={<div>Loading...</div>}><Interactions /></Suspense>} />
        <Route path="/equipment" element={<Suspense fallback={<div>Loading...</div>}><Equipment /></Suspense>} />
        <Route path="/team" element={<Suspense fallback={<div>Loading...</div>}><Team /></Suspense>} />
        <Route path="/reports" element={<Suspense fallback={<div>Loading...</div>}><Reports /></Suspense>} />
        <Route path="/tasks" element={<Suspense fallback={<div>Loading...</div>}><Tasks /></Suspense>} />
        <Route path="/kanban" element={<Suspense fallback={<div>Loading...</div>}><Kanban /></Suspense>} />
        <Route path="/chat" element={<Suspense fallback={<div>Loading...</div>}><Chat /></Suspense>} />
        <Route path="/work-orders" element={<Suspense fallback={<div>Loading...</div>}><WorkOrders /></Suspense>} />
        <Route path="/work-orders/:id" element={<Suspense fallback={<div>Loading...</div>}><WorkOrder /></Suspense>} />
        <Route path="/invoices" element={<Suspense fallback={<div>Loading...</div>}><Invoices /></Suspense>} />
        <Route path="/invoices/:id" element={<Suspense fallback={<div>Loading...</div>}><Invoice /></Suspense>} />
         <Route path="/estimates" element={<Suspense fallback={<div>Loading...</div>}><Estimates /></Suspense>} />
        <Route path="/estimates/:id" element={<Suspense fallback={<div>Loading...</div>}><Estimate /></Suspense>} />
        <Route path="/subscriptions" element={<Suspense fallback={<div>Loading...</div>}><Subscriptions /></Suspense>} />
        <Route path="/subscriptions/:id" element={<Suspense fallback={<div>Loading...</div>}><Subscription /></Suspense>} />
        <Route path="/plans" element={<Suspense fallback={<div>Loading...</div>}><Plans /></Suspense>} />
         <Route path="/forms" element={<Suspense fallback={<div>Loading...</div>}><Forms /></Suspense>} />
        <Route path="/forms/:id" element={<Suspense fallback={<div>Loading...</div>}><Form /></Suspense>} />
         <Route path="/payments" element={<Suspense fallback={<div>Loading...</div>}><Payments /></Suspense>} />
         {/* Inventory Routes - nested within dashboard */}
        <Route path="/inventory" element={<Suspense fallback={<div>Loading...</div>}><InventoryDashboard /></Suspense>} />
        <Route path="/inventory/items" element={<Suspense fallback={<div>Loading...</div>}><InventoryItems /></Suspense>} />
        <Route path="/inventory/items/:id" element={<Suspense fallback={<div>Loading...</div>}><InventoryItem /></Suspense>} />
        <Route path="/inventory/categories" element={<Suspense fallback={<div>Loading...</div>}><InventoryCategories /></Suspense>} />
        <Route path="/inventory/suppliers" element={<Suspense fallback={<div>Loading...</div>}><InventorySuppliers /></Suspense>} />
        <Route path="/inventory/transactions" element={<Suspense fallback={<div>Loading...</div>}><InventoryTransactions /></Suspense>} />
        <Route path="/inventory/vendors" element={<Suspense fallback={<div>Loading...</div>}><InventoryVendors /></Suspense>} />
        <Route path="/inventory/purchase-orders" element={<Suspense fallback={<div>Loading...</div>}><InventoryPurchaseOrders /></Suspense>} />
        <Route path="/inventory/locations" element={<Suspense fallback={<div>Loading...</div>}><InventoryLocations /></Suspense>} />
      </Route>

      <Route
        element={
          isAuthenticated ? (
            <SettingsLayout />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route path="/settings" element={<Suspense fallback={<div>Loading...</div>}><Settings /></Suspense>} />
        <Route path="/notifications" element={<Suspense fallback={<div>Loading...</div>}><Notifications /></Suspense>} />
        <Route path="/profile" element={<Suspense fallback={<div>Loading...</div>}><Profile /></Suspense>} />
      </Route>

      <Route
        element={
          isAuthenticated ? (
            <MainLayout />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route path="/onboarding" element={<Onboarding />} />
      </Route>
      
      <Route path="/shopping" element={<Shopping />} />
      <Route path="/shopping/categories" element={<ShoppingCategories />} />
      <Route path="/shopping/products" element={<Suspense fallback={<div>Loading...</div>}><Products /></Suspense>} />
      <Route path="/shopping/wishlist" element={<Suspense fallback={<div>Loading...</div>}><Wishlist /></Suspense>} />
      <Route path="/shopping/cart" element={<Suspense fallback={<div>Loading...</div>}><Cart /></Suspense>} />
      <Route path="/shopping/deals" element={<Suspense fallback={<div>Loading...</div>}><Deals /></Suspense>} />
      <Route path="/shopping/recommendations" element={<Suspense fallback={<div>Loading...</div>}><Recommendations /></Suspense>} />
      <Route path="/shopping/orders" element={<Suspense fallback={<div>Loading...</div>}><Orders /></Suspense>} />
      <Route path="/shopping/suggestions" element={<Suspense fallback={<div>Loading...</div>}><Suggestions /></Suspense>} />
      <Route path="/shopping/saved" element={<Suspense fallback={<div>Loading...</div>}><Saved /></Suspense>} />
      <Route path="/shopping/admin" element={<Suspense fallback={<div>Loading...</div>}><ShoppingAdmin /></Suspense>} />
      

      <Route path="/error-404" element={<Error404 />} />
      <Route path="/error-500" element={<Error500 />} />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
}
