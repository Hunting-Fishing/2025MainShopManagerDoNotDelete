
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  jobTitle: string;
  department: string;
  status: "Active" | "Inactive";
  workOrders: {
    assigned: number;
    completed: number;
  };
}
