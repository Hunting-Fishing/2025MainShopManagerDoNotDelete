
import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import ErrorPage from "./pages/error-page";
import NotFound from "./pages/NotFound";
import { VehicleDetailsPage } from "./components/customers/vehicles/VehicleDetailsPage";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import EditCustomer from "./pages/EditCustomer";
import CreateCustomer from "./pages/CreateCustomer";
import { CustomerDataProvider } from "./contexts/CustomerDataProvider";

// Create a context provider component if it doesn't exist
const CustomerDataProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  return <CustomerDataProvider>{children}</CustomerDataProvider>;
};

export const router = createBrowserRouter([
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
]);
