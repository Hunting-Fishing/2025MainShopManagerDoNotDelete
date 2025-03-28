
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, BarChart, TrendingUp, Users, FileText, Package, Clock } from "lucide-react";
import { Link } from "react-router-dom";

// Mock data for dashboard
const stats = [
  {
    title: "Active Work Orders",
    value: "28",
    icon: FileText,
    change: "+5%",
    up: true,
  },
  {
    title: "Team Members",
    value: "14",
    icon: Users,
    change: "No change",
    up: null,
  },
  {
    title: "Inventory Items",
    value: "156",
    icon: Package,
    change: "+12%",
    up: true,
  },
  {
    title: "Avg. Completion Time",
    value: "2.4 days",
    icon: Clock,
    change: "-8%",
    up: false,
  },
];

// Mock data for recent work orders
const recentWorkOrders = [
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

// Map of status to text
const statusMap = {
  "pending": "Pending",
  "in-progress": "In Progress",
  "completed": "Completed",
  "cancelled": "Cancelled",
};

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your business.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Reports
          </Button>
          <Button asChild className="flex items-center gap-2 bg-esm-blue-600 hover:bg-esm-blue-700">
            <Link to="/work-orders/new">
              <Plus className="h-4 w-4" />
              New Work Order
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="card-stats">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                {stat.up === true && <TrendingUp className="mr-1 h-3 w-3 text-green-500" />}
                {stat.up === false && <TrendingUp className="mr-1 h-3 w-3 text-red-500 rotate-180" />}
                <span className={
                  stat.up === true ? "text-green-600" : 
                  stat.up === false ? "text-red-600" : ""
                }>
                  {stat.change}
                </span>
                <span className="text-muted-foreground ml-1">from last month</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Work Orders */}
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
                      {statusMap[order.status as keyof typeof statusMap]}
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
    </div>
  );
}
