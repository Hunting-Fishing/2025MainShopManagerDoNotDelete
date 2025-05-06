
import { useEffect, useState } from "react";
import { Role } from "@/types/team";
import { useRoleManagement } from "./useRoleManagement";
import { toast } from "sonner";

export function useTeamRolesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [mockRoles, setMockRoles] = useState<Role[]>([]);
  
  useEffect(() => {
    // In a real app, this would fetch roles from your backend
    // For now, we'll simulate a fetch with mock data
    const fetchRoles = async () => {
      try {
        setTimeout(() => {
          const initialRoles: Role[] = [
            {
              id: "1",
              name: "Owner",
              description: "Full access to all features",
              isDefault: true,
              permissions: { admin: true },
              createdAt: "2023-01-01T00:00:00Z",
              updatedAt: "2023-01-01T00:00:00Z",
              priority: 1
            },
            {
              id: "2",
              name: "Administrator",
              description: "Full access except financial data",
              isDefault: true,
              permissions: { admin: true, finance: false },
              createdAt: "2023-01-02T00:00:00Z",
              updatedAt: "2023-01-02T00:00:00Z",
              priority: 2
            },
            {
              id: "3",
              name: "Technician",
              description: "Access to work orders and customer data",
              isDefault: true,
              permissions: { workOrders: true, customers: true },
              createdAt: "2023-01-03T00:00:00Z",
              updatedAt: "2023-01-03T00:00:00Z",
              priority: 3
            },
            {
              id: "4",
              name: "Customer Service",
              description: "Access to customer data and invoices",
              isDefault: true,
              permissions: { customers: true, invoices: true },
              createdAt: "2023-01-04T00:00:00Z",
              updatedAt: "2023-01-04T00:00:00Z",
              priority: 4
            }
          ];
          
          setMockRoles(initialRoles);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        toast.error("Failed to load roles");
        setIsLoading(false);
      }
    };
    
    fetchRoles();
  }, []);
  
  const roleManagement = useRoleManagement(mockRoles);
  
  return {
    isLoading,
    ...roleManagement
  };
}
