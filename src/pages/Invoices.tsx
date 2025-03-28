
import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ChevronDown, 
  Download, 
  Filter, 
  Plus, 
  RefreshCw, 
  Search, 
  SlidersHorizontal,
  FileText
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

// Mock data for invoices
const invoices = [
  {
    id: "INV-2023-001",
    workOrderId: "WO-2023-0012",
    customer: "Acme Corporation",
    description: "HVAC System Repair",
    total: 1250.00,
    status: "paid",
    date: "2023-08-16",
    dueDate: "2023-09-15",
    createdBy: "Michael Brown",
    items: [
      { id: 1, name: "HVAC Filter - Premium", quantity: 2, price: 24.99 },
      { id: 2, name: "Service Labor (hours)", quantity: 6, price: 200.00 }
    ]
  },
  {
    id: "INV-2023-002",
    workOrderId: "WO-2023-0011",
    customer: "Johnson Residence",
    description: "Electrical Panel Upgrade",
    total: 875.50,
    status: "pending",
    date: "2023-08-15",
    dueDate: "2023-09-14",
    createdBy: "Sarah Johnson",
    items: [
      { id: 1, name: "Circuit Breaker - 30 Amp", quantity: 3, price: 42.50 },
      { id: 2, name: "Service Labor (hours)", quantity: 5, price: 150.00 }
    ]
  },
  {
    id: "INV-2023-003",
    workOrderId: "WO-2023-0010",
    customer: "City Hospital",
    description: "Security System Installation",
    total: 3200.00,
    status: "overdue",
    date: "2023-08-13",
    dueDate: "2023-09-12",
    createdBy: "David Lee",
    items: [
      { id: 1, name: "Security Cameras", quantity: 8, price: 250.00 },
      { id: 2, name: "Door Lock Set - Commercial Grade", quantity: 4, price: 89.99 },
      { id: 3, name: "Service Labor (hours)", quantity: 8, price: 175.00 }
    ]
  },
  {
    id: "INV-2023-004",
    workOrderId: "WO-2023-0008",
    customer: "Green Valley School",
    description: "Fire Alarm System Inspection",
    total: 650.00,
    status: "paid",
    date: "2023-08-10",
    dueDate: "2023-09-09",
    createdBy: "Emily Chen",
    items: [
      { id: 1, name: "Fire Alarm Components", quantity: 0, price: 0 },
      { id: 2, name: "Inspection Service", quantity: 1, price: 650.00 }
    ]
  },
  {
    id: "INV-2023-005",
    workOrderId: "WO-2023-0007",
    customer: "Sunset Restaurant",
    description: "Kitchen Equipment Repair",
    total: 1475.25,
    status: "draft",
    date: "2023-08-08",
    dueDate: "2023-09-07",
    createdBy: "Michael Brown",
    items: [
      { id: 1, name: "Kitchen Equipment Parts", quantity: 3, price: 325.00 },
      { id: 2, name: "Service Labor (hours)", quantity: 3, price: 166.75 }
    ]
  }
];

// Map of status to text and styles
const statusMap = {
  "paid": { label: "Paid", classes: "bg-green-100 text-green-800" },
  "pending": { label: "Pending", classes: "bg-yellow-100 text-yellow-800" },
  "overdue": { label: "Overdue", classes: "bg-red-100 text-red-800" },
  "draft": { label: "Draft", classes: "bg-slate-100 text-slate-800" },
};

export default function Invoices() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [createdByFilter, setCreatedByFilter] = useState("all");

  // Get unique creators for filter
  const creators = Array.from(new Set(invoices.map(invoice => invoice.createdBy))).sort();

  // Filter invoices based on search query and filters
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch = 
      !searchQuery ||
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.workOrderId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter.length === 0 || statusFilter.includes(invoice.status);
    
    const matchesCreator = 
      createdByFilter === "all" || invoice.createdBy === createdByFilter;
    
    return matchesSearch && matchesStatus && matchesCreator;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Manage all customer invoices in your system.
          </p>
        </div>
        <div>
          <Button asChild className="flex items-center gap-2 bg-esm-blue-600 hover:bg-esm-blue-700">
            <Link to="/invoices/new">
              <Plus className="h-4 w-4" />
              New Invoice
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
            placeholder="Search invoices..."
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
                  {value.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Select
            value={createdByFilter}
            onValueChange={setCreatedByFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Staff" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Staff</SelectItem>
              {creators.map((creator) => (
                <SelectItem key={creator} value={creator}>
                  {creator}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" className="flex items-center gap-2" onClick={() => {
            setSearchQuery("");
            setStatusFilter([]);
            setCreatedByFilter("all");
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

      {/* Invoices table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Invoice #
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Work Order
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Customer
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Description
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Total
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Due Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Created By
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredInvoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                  {invoice.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  <Link to={`/work-orders/${invoice.workOrderId}`} className="text-esm-blue-600 hover:text-esm-blue-800">
                    {invoice.workOrderId}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {invoice.customer}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {invoice.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  ${invoice.total.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusMap[invoice.status as keyof typeof statusMap].classes}`}>
                    {statusMap[invoice.status as keyof typeof statusMap].label}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {invoice.dueDate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {invoice.createdBy}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link to={`/invoices/${invoice.id}`} className="text-esm-blue-600 hover:text-esm-blue-800 mr-4">
                    View
                  </Link>
                  <Link to={`/invoices/${invoice.id}/edit`} className="text-esm-blue-600 hover:text-esm-blue-800">
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
