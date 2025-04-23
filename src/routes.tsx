
import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import ErrorPage from "./pages/error-page";
import NotFound from "./pages/NotFound";
import { VehicleDetailsPage } from "./components/customers/vehicles/VehicleDetailsPage";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import EditCustomer from "./pages/EditCustomer";
import CreateCustomer from "./pages/CreateCustomer";
import Team from "./pages/Team";
import CreateTeamMember from "./pages/CreateTeamMember";
import { CustomerDataProvider } from "./contexts/CustomerDataProvider";
import WorkOrderCreate from "./pages/WorkOrderCreate";
import WorkOrdersPage from "./pages/WorkOrdersPage"; // Updated import path
import Inventory from "./pages/Inventory";
import InventoryAdd from "./pages/InventoryAdd";

const CustomerDataProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  return <CustomerDataProvider>{children}</CustomerDataProvider>;
};

export const routeDefinitions = [
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "*",
        element: <NotFound />
      },
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "customers",
        element: <Customers />,
      },
      {
        path: "customers/new",
        element: <CreateCustomer />,
      },
      {
        path: "customers/:customerId",
        element: (
          <CustomerDataProviderWrapper>
            <>Customer Details</>
          </CustomerDataProviderWrapper>
        ),
      },
      {
        path: "customers/:customerId/edit",
        element: <EditCustomer />,
      },
      {
        path: "customers/:customerId/vehicles/:vehicleId",
        element: <VehicleDetailsPage />,
      },
      {
        path: "team",
        element: <Team />,
      },
      {
        path: "team/create", 
        element: <CreateTeamMember />,
      },
      {
        path: "work-orders",
        element: <WorkOrdersPage />,
      },
      {
        path: "work-orders/create",
        element: <WorkOrderCreate />,
      },
      {
        path: "work-orders/new",
        element: <WorkOrderCreate />,
      },
      {
        path: "work-orders/:workOrderId",
        element: <>Work Order Details</>,
      },
      {
        path: "invoices",
        element: <>Invoices</>,
      },
      {
        path: "invoices/new",
        element: <>Create Invoice</>,
      },
      {
        path: "invoices/:invoiceId",
        element: <>Invoice Details</>,
      },
      // Add the inventory routes
      {
        path: "inventory",
        element: <Inventory />,
      },
      {
        path: "inventory/add",
        element: <InventoryAdd />,
      },
    ],
  },
];
