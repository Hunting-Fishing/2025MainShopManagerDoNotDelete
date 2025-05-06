
import { useState, useEffect } from "react";
import { TeamMember } from "@/types/team";
import { toast } from "sonner";

export function useTeamMemberProfile(memberId: string) {
  const [member, setMember] = useState<TeamMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMemberProfile() {
      if (!memberId) {
        setError("No team member ID provided");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // In a real app, this would fetch data from your backend
        // For now, we'll simulate a fetch with mock data
        setTimeout(() => {
          const mockTeamMembers = [
            {
              id: "1",
              name: "John Smith",
              role: "Technician",
              email: "john.smith@example.com",
              phone: "(555) 123-4567",
              jobTitle: "Lead Technician",
              department: "Service",
              status: "Active" as const,
              workOrders: {
                assigned: 12,
                completed: 10,
              },
              joinDate: "2022-05-15",
            },
            {
              id: "2",
              name: "Sarah Johnson",
              role: "Administrator",
              email: "sarah.johnson@example.com",
              phone: "(555) 987-6543",
              jobTitle: "Office Manager",
              department: "Administration",
              status: "Active" as const,
              workOrders: {
                assigned: 0,
                completed: 0,
              },
              joinDate: "2021-11-03",
            },
          ];

          const foundMember = mockTeamMembers.find((m) => m.id === memberId);
          if (foundMember) {
            setMember(foundMember);
            setError(null);
          } else {
            setError("Team member not found");
          }
          setIsLoading(false);
        }, 500);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load team member profile";
        toast.error("Error loading team member profile", {
          description: errorMessage,
        });
        setError(errorMessage);
        setIsLoading(false);
      }
    }

    fetchMemberProfile();
  }, [memberId]);

  return { member, isLoading, error };
}
