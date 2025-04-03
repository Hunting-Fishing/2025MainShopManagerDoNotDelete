
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { TeamMember } from "@/types/team";
import { toast } from "@/hooks/use-toast";

export function useTeamMemberProfile(id: string | undefined) {
  const [member, setMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch member data from Supabase
    const fetchMemberData = async () => {
      setLoading(true);
      try {
        if (!id) {
          setMember(null);
          setLoading(false);
          return;
        }
        
        // First get the user profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select(`
            id,
            first_name,
            last_name,
            email,
            phone,
            created_at
          `)
          .eq('id', id)
          .single();

        if (profileError) {
          throw profileError;
        }

        if (!profileData) {
          setMember(null);
          return;
        }

        // Get user's role in a separate query
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select(`
            role_id,
            roles:role_id(name)
          `)
          .eq('user_id', id);
          
        if (rolesError) {
          console.warn('Error fetching roles:', rolesError);
        }

        // Get user's recent activity
        const { data: activityData } = await supabase
          .from('work_order_activities')
          .select('*')
          .eq('user_id', id)
          .order('timestamp', { ascending: false })
          .limit(5);

        // Transform activity data to match the expected format
        const recentActivity = activityData?.map(activity => ({
          type: 'workOrder',
          date: activity.timestamp || new Date().toISOString(),
          description: activity.action
        })) || [];

        // Extract role information
        let userRole = 'User'; // Default role
        
        if (userRoles && 
            userRoles.length > 0 && 
            userRoles[0].roles) {
          if (typeof userRoles[0].roles === 'object' && 
              userRoles[0].roles !== null &&
              'name' in userRoles[0].roles) {
            userRole = userRoles[0].roles.name || 'User';
          }
        }

        // Create the member object with the fetched data
        const memberData: TeamMember = {
          id: profileData.id,
          name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || 'Unknown User',
          role: userRole,
          email: profileData.email || '',
          phone: profileData.phone || '',
          jobTitle: userRole, // Default to role name if no job title is available
          department: 'General', // Default department
          status: "Active", // Default status
          workOrders: {
            assigned: 0,
            completed: 0
          },
          notes: "",
          recentActivity,
          joinDate: profileData.created_at,
          lastActive: recentActivity?.[0]?.date || profileData.created_at
        };

        setMember(memberData);
      } catch (error) {
        console.error("Error fetching team member:", error);
        toast({
          title: "Error",
          description: "Failed to load team member data.",
          variant: "destructive",
        });
        setMember(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMemberData();
    } else {
      setLoading(false);
    }
  }, [id]);

  return { member, loading };
}
