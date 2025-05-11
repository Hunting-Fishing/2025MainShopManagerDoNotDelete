
import { createBrowserRouter } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import Team from "@/pages/Team";
import TeamMemberProfile from "@/pages/TeamMemberProfile";
import NotFound from "@/pages/NotFound";
import DeveloperPortal from "@/pages/DeveloperPortal";
import ServiceManagement from "@/pages/developer/ServiceManagement";
import ShoppingControls from "@/pages/developer/ShoppingControls";
import Shopping from "@/pages/Shopping";
import Inventory from "@/pages/Inventory";
import InventoryItemDetail from "@/pages/inventory/InventoryItemDetail";
import WorkOrders from "@/pages/WorkOrders";
import WorkOrderDetails from "@/pages/WorkOrderDetails";

export const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "team",
        element: <Team />,
      },
      {
        path: "team/:id",
        element: <TeamMemberProfile />,
      },
      {
        path: "developer",
        element: <DeveloperPortal />,
      },
      {
        path: "developer/service-management",
        element: <ServiceManagement />,
      },
      {
        path: "developer/shopping-controls",
        element: <ShoppingControls />,
      },
      {
        path: "shopping",
        element: <Shopping />,
      },
      {
        path: "inventory",
        element: <Inventory />,
      },
      {
        path: "inventory/item/:id",
        element: <InventoryItemDetail />,
      },
      {
        path: "work-orders",
        element: <WorkOrders />,
      },
      {
        path: "work-orders/:id",
        element: <WorkOrderDetails />,
      },
      {
        path: "work-orders/:id/edit",
        element: <WorkOrderDetails edit={true} />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
];

export default routes;
