import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import ErrorPage from "./pages/error-page";
import NotFound from "./pages/NotFound";
import { VehicleDetailsPage } from "./components/customers/vehicles/VehicleDetailsPage";
import { Dashboard } from "./pages/dashboard";
import { Customers } from "./pages/customers";
import { CustomerDetails } from "./pages/customer-details";
import { CustomerCreate } from "./pages/customer-create";
import { CustomerEdit } from "./pages/customer-edit";
import { WorkOrders } from "./pages/work-orders";
import { WorkOrderCreate } from "./pages/work-order-create";
import { WorkOrderDetails } from "./pages/work-order-details";
import { Invoices } from "./pages/invoices";
import { InvoiceCreate } from "./pages/invoice-create";
import { InvoiceDetails } from "./pages/invoice-details";
import { CustomerDataProvider } from "./contexts/CustomerDataProvider";

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
        element: <CustomerCreate />,
      },
      {
        path: "customers/:customerId",
        element: (
          <CustomerDataProvider>
            <CustomerDetails />
          </CustomerDataProvider>
        ),
      },
      {
        path: "customers/:customerId/edit",
        element: <CustomerEdit />,
      },
      {
        path: "customers/:customerId/vehicles/:vehicleId",
        element: <VehicleDetailsPage />,
      },
      {
        path: "work-orders",
        element: <WorkOrders />,
      },
      {
        path: "work-orders/new",
        element: <WorkOrderCreate />,
      },
      {
        path: "work-orders/:workOrderId",
        element: <WorkOrderDetails />,
      },
      {
        path: "invoices",
        element: <Invoices />,
      },
      {
        path: "invoices/new",
        element: <InvoiceCreate />,
      },
      {
        path: "invoices/:invoiceId",
        element: <InvoiceDetails />,
      },
    ],
  },
]);
