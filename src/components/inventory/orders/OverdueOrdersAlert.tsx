
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { InventoryOrder } from "@/types/inventory/orders";
import { format } from "date-fns";

interface OverdueOrdersAlertProps {
  orders: InventoryOrder[];
}

export function OverdueOrdersAlert({ orders }: OverdueOrdersAlertProps) {
  if (orders.length === 0) {
    return null;
  }

  return (
    <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Overdue Orders</AlertTitle>
      <AlertDescription className="mt-2">
        <div className="text-sm">
          The following {orders.length} {orders.length === 1 ? 'order is' : 'orders are'} overdue:
        </div>
        <ul className="mt-2 space-y-1 text-sm">
          {orders.slice(0, 3).map((order) => (
            <li key={order.id}>
              <span className="font-medium">{order.item_name}</span> from 
              <span className="font-medium"> {order.supplier}</span> - 
              Expected: {format(new Date(order.expected_arrival), "MMM d, yyyy")}
            </li>
          ))}
          {orders.length > 3 && (
            <li className="text-red-700 font-medium">
              + {orders.length - 3} more overdue orders
            </li>
          )}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
