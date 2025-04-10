import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getRecentWorkOrders } from "@/services/dashboardService";

interface RecentWorkOrder {
  id: string;
  customer: string;
  service: string;
  status: string;
  date: string;
  priority: string;
}

// Map of status to text
const statusMap = {
  "pending": "Pending",
  "in-progress": "In Progress",
  "completed": "Completed",
  "cancelled": "Cancelled",
};

export const RecentWorkOrders = () => {
  const [recentWorkOrders, setRecentWorkOrders] = useState<RecentWorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentWorkOrders = async () => {
      try {
        setLoading(true);
        const data = await getRecentWorkOrders(5);
        setRecentWorkOrders(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching recent work orders:", err);
        setError("Failed to load recent work orders");
      } finally {
        setLoading(false);
      }
    };

    fetchRecentWorkOrders();
  }, []);

  if (loading) {
    return (
      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Work Orders</h2>
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-esm-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Work Orders</h2>
        <div className="p-8 text-center">
          <p className="text-red-500">{error}</p>
          <p className="text-sm text-slate-500 mt-2">Please try again later</p>
        </div>
      </div>
    );
  }

  if (recentWorkOrders.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Work Orders</h2>
        <div className="p-8 text-center border rounded-lg border-slate-200">
          <p className="text-slate-500">No recent work orders found</p>
        </div>
      </div>
    );
  }

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
                  {order.id.substring(0, 8)}...
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {order.customer}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {order.service}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`status-badge status-${order.status}`}>
                    {statusMap[order.status as keyof typeof statusMap] || order.status}
                  </span>
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
