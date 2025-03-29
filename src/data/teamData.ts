
import { TeamMember } from "@/types/team";

// Mock data for team members
export const teamMembers: TeamMember[] = [
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

// Helper function to get initials from name
export const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};
