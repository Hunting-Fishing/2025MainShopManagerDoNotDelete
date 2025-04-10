
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

// The router exported from this file is not currently being used
// since we're defining routes in App.tsx directly.
// This file is kept for reference or future use if needed.

// Create a context provider component if it doesn't exist
const CustomerDataProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  return <CustomerDataProvider>{children}</CustomerDataProvider>;
};

// Define routes but don't create router instance here
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
        element: <>Work Orders</>,
      },
      {
        path: "work-orders/new",
        element: <>Create Work Order</>,
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
    ],
  },
];

// This is commented out to avoid creating another router instance
// export const router = createBrowserRouter(routeDefinitions);
