
import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { WorkOrder, statusMap, priorityMap } from "@/data/workOrdersData";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from "@/components/ui/table";

interface WorkOrdersTableProps {
  workOrders: WorkOrder[];
}

export default function WorkOrdersTable({ workOrders }: WorkOrdersTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</TableHead>
            <TableHead className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Customer</TableHead>
            <TableHead className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</TableHead>
            <TableHead className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</TableHead>
            <TableHead className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Priority</TableHead>
            <TableHead className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Technician</TableHead>
            <TableHead className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Due Date</TableHead>
            <TableHead className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-white divide-y divide-slate-200">
          {workOrders.length > 0 ? (
            workOrders.map((order) => (
              <TableRow key={order.id} className="hover:bg-slate-50">
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                  {order.id}
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {order.customer}
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {order.description}
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap">
                  <span className={`status-badge status-${order.status}`}>
                    {statusMap[order.status]}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityMap[order.priority].classes}`}>
                    {priorityMap[order.priority].label}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {order.technician}
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {order.dueDate}
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link to={`/work-orders/${order.id}`} className="text-esm-blue-600 hover:text-esm-blue-800 mr-4">
                    View
                  </Link>
                  <Link to={`/work-orders/${order.id}/edit`} className="text-esm-blue-600 hover:text-esm-blue-800 mr-4">
                    Edit
                  </Link>
                  <Link to={`/invoices/from-work-order/${order.id}`} className="text-esm-blue-600 hover:text-esm-blue-800">
                    <FileText className="h-4 w-4 inline-block mr-1" />
                    Invoice
                  </Link>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                No work orders found matching your filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
