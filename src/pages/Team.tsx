
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Plus, 
  Filter, 
  RefreshCw, 
  Mail, 
  Phone,
  ChevronDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock data for team members
const teamMembers = [
  {
    id: "TM001",
    name: "John Smith",
    role: "Owner",
    email: "john.smith@easyshopmanager.com",
    phone: "555-123-4567",
    jobTitle: "Chief Executive Officer",
    department: "Management",
    status: "Active",
    workOrders: {
      assigned: 0,
      completed: 0,
    },
  },
  {
    id: "TM002",
    name: "Sarah Johnson",
    role: "Technician",
    email: "sarah.johnson@easyshopmanager.com",
    phone: "555-987-6543",
    jobTitle: "Senior HVAC Technician",
    department: "Field Service",
    status: "Active",
    workOrders: {
      assigned: 5,
      completed: 24,
    },
  },
  {
    id: "TM003",
    name: "Michael Brown",
    role: "Technician",
    email: "michael.brown@easyshopmanager.com",
    phone: "555-456-7890",
    jobTitle: "Electrical Technician",
    department: "Field Service",
    status: "Active",
    workOrders: {
      assigned: 7,
      completed: 18,
    },
  },
  {
    id: "TM004",
    name: "Emily Chen",
    role: "Technician",
    email: "emily.chen@easyshopmanager.com",
    phone: "555-789-0123",
    jobTitle: "Plumbing Specialist",
    department: "Field Service",
    status: "Active",
    workOrders: {
      assigned: 3,
      completed: 12,
    },
  },
  {
    id: "TM005",
    name: "David Lee",
    role: "Technician",
    email: "david.lee@easyshopmanager.com",
    phone: "555-234-5678",
    jobTitle: "Security System Technician",
    department: "Field Service",
    status: "Inactive",
    workOrders: {
      assigned: 0,
      completed: 15,
    },
  },
  {
    id: "TM006",
    name: "Jessica Williams",
    role: "Administrator",
    email: "jessica.williams@easyshopmanager.com",
    phone: "555-345-6789",
    jobTitle: "Office Administrator",
    department: "Administration",
    status: "Active",
    workOrders: {
      assigned: 0,
      completed: 0,
    },
  },
  {
    id: "TM007",
    name: "Robert Garcia",
    role: "Customer Service",
    email: "robert.garcia@easyshopmanager.com",
    phone: "555-567-8901",
    jobTitle: "Customer Service Representative",
    department: "Customer Support",
    status: "Active",
    workOrders: {
      assigned: 0,
      completed: 0,
    },
  },
];

// Get initials from name
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

// Status styling map
const statusStyleMap = {
  "Active": "bg-green-100 text-green-800",
  "Inactive": "bg-red-100 text-red-800",
};

export default function Team() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  // Get unique roles and departments for filters
  const roles = Array.from(new Set(teamMembers.map(member => member.role))).sort();
  const departments = Array.from(new Set(teamMembers.map(member => member.department))).sort();
  const statuses = Array.from(new Set(teamMembers.map(member => member.status))).sort();

  // Filter team members
  const filteredMembers = teamMembers.filter((member) => {
    const matchesSearch = 
      !searchQuery ||
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = 
      roleFilter.length === 0 || roleFilter.includes(member.role);
    
    const matchesDepartment = 
      departmentFilter.length === 0 || departmentFilter.includes(member.department);
    
    const matchesStatus = 
      statusFilter.length === 0 || statusFilter.includes(member.status);
    
    return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground">
            Manage your team members and their permissions.
          </p>
        </div>
        <div>
          <Button asChild className="flex items-center gap-2 bg-esm-blue-600 hover:bg-esm-blue-700">
            <Link to="/team/new">
              <Plus className="h-4 w-4" />
              Add Team Member
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
            placeholder="Search team members..."
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
                Role
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {roles.map((role) => (
                <DropdownMenuCheckboxItem
                  key={role}
                  checked={roleFilter.includes(role)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setRoleFilter([...roleFilter, role]);
                    } else {
                      setRoleFilter(roleFilter.filter((r) => r !== role));
                    }
                  }}
                >
                  {role}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Department
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Filter by Department</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {departments.map((department) => (
                <DropdownMenuCheckboxItem
                  key={department}
                  checked={departmentFilter.includes(department)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setDepartmentFilter([...departmentFilter, department]);
                    } else {
                      setDepartmentFilter(departmentFilter.filter((d) => d !== department));
                    }
                  }}
                >
                  {department}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

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
              {statuses.map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={statusFilter.includes(status)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setStatusFilter([...statusFilter, status]);
                    } else {
                      setStatusFilter(statusFilter.filter((s) => s !== status));
                    }
                  }}
                >
                  {status}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" className="flex items-center gap-2" onClick={() => {
            setSearchQuery("");
            setRoleFilter([]);
            setDepartmentFilter([]);
            setStatusFilter([]);
          }}>
            <RefreshCw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      {/* Team members grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <div key={member.id} className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="" alt={member.name} />
                  <AvatarFallback className="bg-esm-blue-100 text-esm-blue-700">{getInitials(member.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-slate-900">{member.name}</h3>
                  <p className="text-sm text-slate-500">{member.jobTitle}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyleMap[member.status as keyof typeof statusStyleMap]}`}>
                {member.status}
              </span>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex flex-col gap-2">
                <p className="text-sm text-slate-700">
                  <span className="font-medium">Role:</span> {member.role}
                </p>
                <p className="text-sm text-slate-700">
                  <span className="font-medium">Department:</span> {member.department}
                </p>
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <a href={`mailto:${member.email}`} className="text-esm-blue-600 hover:underline">
                    {member.email}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <a href={`tel:${member.phone}`} className="text-esm-blue-600 hover:underline">
                    {member.phone}
                  </a>
                </div>
              </div>

              {member.role === "Technician" && (
                <div className="flex gap-4 pt-2 border-t border-slate-100">
                  <div className="flex-1 text-center">
                    <p className="text-xs text-slate-500">Assigned</p>
                    <p className="text-xl font-semibold text-esm-blue-600">{member.workOrders.assigned}</p>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="text-xs text-slate-500">Completed</p>
                    <p className="text-xl font-semibold text-esm-blue-600">{member.workOrders.completed}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <Link 
                to={`/team/${member.id}`} 
                className="text-sm text-esm-blue-600 hover:text-esm-blue-800"
              >
                View Profile
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
