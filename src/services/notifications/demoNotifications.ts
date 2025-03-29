
import { Notification } from "@/types/notification";

/**
 * Sample demo notifications to simulate real-time events
 */
export const demoNotifications: Partial<Notification>[] = [
  {
    title: "Work Order Updated",
    message: "Work order #WO-2023-089 has been marked as completed",
    type: "success",
    category: "workOrder",
    link: "/work-orders/89"
  },
  {
    title: "New Team Member",
    message: "Sarah Johnson has joined the maintenance team",
    type: "info",
    category: "team",
    link: "/team"
  },
  {
    title: "Low Inventory Alert",
    message: "Air filters (SKU: AF-2040) are running low",
    type: "warning",
    category: "inventory",
    link: "/inventory"
  },
  {
    title: "Invoice Overdue",
    message: "Invoice #INV-2023-054 is 7 days overdue",
    type: "error",
    category: "invoice",
    link: "/invoices/54"
  },
  {
    title: "Customer Request",
    message: "New service request from Acme Industries",
    type: "info",
    category: "customer",
    link: "/customers/16"
  }
];
