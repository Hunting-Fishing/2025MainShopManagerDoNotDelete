
import { InventoryOrder } from "@/types/inventory/orders";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileEdit, Package, X } from "lucide-react";
import { useReceiveDialog } from "./useReceiveDialog";
import { useCancelDialog } from "./useCancelDialog";

// Status badge colors
const statusColors = {
  "ordered": "bg-blue-100 text-blue-800",
  "partially received": "bg-yellow-100 text-yellow-800",
  "received": "bg-green-100 text-green-800",
  "cancelled": "bg-red-100 text-red-800"
};

interface InventoryOrdersTableProps {
  orders: InventoryOrder[];
}

export function InventoryOrdersTable({ orders }: InventoryOrdersTableProps) {
  const { openReceiveDialog } = useReceiveDialog();
  const { openCancelDialog } = useCancelDialog();
  
  // Check if an order is overdue but not received/cancelled
  const isOverdue = (order: InventoryOrder) => {
    const today = new Date();
    const expectedDate = new Date(order.expected_arrival);
    return (
      expectedDate < today && 
      order.status !== "received" && 
      order.status !== "cancelled"
    );
  };
  
  if (orders.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
        <p className="mt-1 text-sm text-gray-500">
          No inventory orders match your current filter settings.
        </p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Order Date</TableHead>
            <TableHead>Expected Arrival</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} className={isOverdue(order) ? "bg-red-50" : ""}>
              <TableCell className="font-medium">{order.item_name}</TableCell>
              <TableCell>{format(new Date(order.order_date), "MMM d, yyyy")}</TableCell>
              <TableCell className={isOverdue(order) ? "text-red-600 font-medium" : ""}>
                {format(new Date(order.expected_arrival), "MMM d, yyyy")}
                {isOverdue(order) && (
                  <span className="ml-2 text-xs bg-red-100 text-red-800 py-0.5 px-2 rounded-full">
                    Overdue
                  </span>
                )}
              </TableCell>
              <TableCell>{order.supplier}</TableCell>
              <TableCell>
                {order.quantity_received > 0 ? (
                  <span>
                    {order.quantity_received} / {order.quantity_ordered}
                  </span>
                ) : (
                  order.quantity_ordered
                )}
              </TableCell>
              <TableCell>
                <Badge 
                  className={`${statusColors[order.status as keyof typeof statusColors]} border-none`}
                >
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right space-x-2">
                {(order.status === "ordered" || order.status === "partially received") && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openReceiveDialog(order)}
                      className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                    >
                      Receive
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openCancelDialog(order.id)}
                      className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
                {(order.status === "received" || order.status === "cancelled") && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    disabled
                  >
                    Complete
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
