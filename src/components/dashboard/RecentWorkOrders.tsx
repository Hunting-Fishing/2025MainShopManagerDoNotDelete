
import { Link } from "react-router-dom";
import { WorkOrderStatus } from "@/data/workOrdersData";

interface RecentWorkOrder {
  id: string;
  customer: string;
  description: string;
  status: WorkOrderStatus;
  date: string;
  technician: string;
}

// Map of status to text
const statusMap = {
  "pending": "Pending",
  "in-progress": "In Progress",
  "completed": "Completed",
  "cancelled": "Cancelled",
};

export const RecentWorkOrders = () => {
  // Mock data for recent work orders
  const recentWorkOrders: RecentWorkOrder[] = [
    {
      id: "WO-2023-0012",
      customer: "Acme Corporation",
      description: "HVAC System Repair",
      status: "in-progress",
      date: "2023-08-15",
      technician: "Michael Brown",
    },
    {
      id: "WO-2023-0011",
      customer: "Johnson Residence",
      description: "Electrical Panel Upgrade",
      status: "pending",
      date: "2023-08-14",
      technician: "Unassigned",
    },
    {
      id: "WO-2023-0010",
      customer: "City Hospital",
      description: "Security System Installation",
      status: "completed",
      date: "2023-08-12",
      technician: "Sarah Johnson",
    },
    {
      id: "WO-2023-0009",
      customer: "Metro Hotel",
      description: "Plumbing System Maintenance",
      status: "cancelled",
      date: "2023-08-10",
      technician: "David Lee",
    },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Recent Work Orders</h2>
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Customer
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Description
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Technician
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {recentWorkOrders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                  {order.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {order.customer}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {order.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`status-badge status-${order.status}`}>
                    {statusMap[order.status]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {order.technician}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {order.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link to={`/work-orders/${order.id}`} className="text-esm-blue-600 hover:text-esm-blue-800">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
