
import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Calendar, 
  ChevronDown, 
  Download, 
  Filter, 
  Plus, 
  RefreshCw, 
  Search, 
  SlidersHorizontal 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data for work orders
const workOrders = [
  {
    id: "WO-2023-0012",
    customer: "Acme Corporation",
    description: "HVAC System Repair",
    status: "in-progress",
    date: "2023-08-15",
    dueDate: "2023-08-20",
    priority: "high",
    technician: "Michael Brown",
    location: "123 Business Park, Suite 400",
  },
  {
    id: "WO-2023-0011",
    customer: "Johnson Residence",
    description: "Electrical Panel Upgrade",
    status: "pending",
    date: "2023-08-14",
    dueDate: "2023-08-22",
    priority: "medium",
    technician: "Unassigned",
    location: "456 Maple Street",
  },
  {
    id: "WO-2023-0010",
    customer: "City Hospital",
    description: "Security System Installation",
    status: "completed",
    date: "2023-08-12",
    dueDate: "2023-08-16",
    priority: "high",
    technician: "Sarah Johnson",
    location: "789 Medical Center Drive",
  },
  {
    id: "WO-2023-0009",
    customer: "Metro Hotel",
    description: "Plumbing System Maintenance",
    status: "cancelled",
    date: "2023-08-10",
    dueDate: "2023-08-14",
    priority: "low",
    technician: "David Lee",
    location: "321 Downtown Avenue",
  },
  {
    id: "WO-2023-0008",
    customer: "Green Valley School",
    description: "Fire Alarm System Inspection",
    status: "completed",
    date: "2023-08-08",
    dueDate: "2023-08-12",
    priority: "medium",
    technician: "Emily Chen",
    location: "555 Education Road",
  },
  {
    id: "WO-2023-0007",
    customer: "Sunset Restaurant",
    description: "Kitchen Equipment Repair",
    status: "in-progress",
    date: "2023-08-05",
    dueDate: "2023-08-09",
    priority: "high",
    technician: "Michael Brown",
    location: "777 Culinary Place",
  },
  {
    id: "WO-2023-0006",
    customer: "Parkview Apartments",
    description: "HVAC Maintenance - Multiple Units",
    status: "pending",
    date: "2023-08-03",
    dueDate: "2023-08-18",
    priority: "medium",
    technician: "Unassigned",
    location: "888 Residential Circle",
  },
];

// Map of status to text
const statusMap = {
  "pending": "Pending",
  "in-progress": "In Progress",
  "completed": "Completed",
  "cancelled": "Cancelled",
};

// Map of priority to styles
const priorityMap = {
  "high": { label: "High", classes: "bg-red-100 text-red-800" },
  "medium": { label: "Medium", classes: "bg-yellow-100 text-yellow-800" },
  "low": { label: "Low", classes: "bg-green-100 text-green-800" },
};

export default function WorkOrders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [selectedTechnician, setSelectedTechnician] = useState<string>("");

  // Filter work orders based on search query and filters
  const filteredWorkOrders = workOrders.filter((order) => {
    const matchesSearch = 
      !searchQuery ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter.length === 0 || statusFilter.includes(order.status);
    
    const matchesTechnician = 
      !selectedTechnician || order.technician === selectedTechnician;
    
    return matchesSearch && matchesStatus && matchesTechnician;
  });

  // Get unique technicians for filter
  const technicians = Array.from(new Set(workOrders.map(order => order.technician))).sort();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Work Orders</h1>
          <p className="text-muted-foreground">
            Manage and track all work orders in your system.
          </p>
        </div>
        <div>
          <Button asChild className="flex items-center gap-2 bg-esm-blue-600 hover:bg-esm-blue-700">
            <Link to="/work-orders/new">
              <Plus className="h-4 w-4" />
              New Work Order
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            type="search"
            placeholder="Search work orders..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Status
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.entries(statusMap).map(([key, value]) => (
                <DropdownMenuCheckboxItem
                  key={key}
                  checked={statusFilter.includes(key)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setStatusFilter([...statusFilter, key]);
                    } else {
                      setStatusFilter(statusFilter.filter((s) => s !== key));
                    }
                  }}
                >
                  {value}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Select
            value={selectedTechnician}
            onValueChange={setSelectedTechnician}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Technicians" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Technicians</SelectItem>
              {technicians.map((tech) => (
                <SelectItem key={tech} value={tech}>
                  {tech}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Date Range
          </Button>

          <Button variant="outline" className="flex items-center gap-2" onClick={() => {
            setSearchQuery("");
            setStatusFilter([]);
            setSelectedTechnician("");
          }}>
            <RefreshCw className="h-4 w-4" />
            Reset
          </Button>

          <Button variant="outline" className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            More Filters
          </Button>

          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Work Orders table */}
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
                Priority
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Technician
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Due Date
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredWorkOrders.map((order) => (
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
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityMap[order.priority as keyof typeof priorityMap].classes}`}>
                    {priorityMap[order.priority as keyof typeof priorityMap].label}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {order.technician}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {order.dueDate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link to={`/work-orders/${order.id}`} className="text-esm-blue-600 hover:text-esm-blue-800 mr-4">
                    View
                  </Link>
                  <Link to={`/work-orders/${order.id}/edit`} className="text-esm-blue-600 hover:text-esm-blue-800">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
