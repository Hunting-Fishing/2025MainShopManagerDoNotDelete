
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select(`
            id,
            first_name,
            last_name,
            email,
            phone,
            created_at,
            user_roles:user_roles(
              role_id,
              roles:role_id(name)
            )
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

        // Get user's recent activity (you might need to adjust this based on your schema)
        const { data: activityData } = await supabase
          .from('work_order_activities')
          .select('*')
          .eq('user_id', id)
          .order('timestamp', { ascending: false })
          .limit(5);

        // Transform activity data to match the expected format
        const recentActivity = activityData?.map(activity => ({
          type: 'workOrder',
          date: activity.timestamp,
          description: activity.action
        })) || [];

        // Extract role information - handling potential data structure issues
        let userRole = 'User'; // Default role
        
        if (profileData.user_roles && 
            Array.isArray(profileData.user_roles) && 
            profileData.user_roles.length > 0 && 
            profileData.user_roles[0].roles) {
          // Check if roles is an object with a name property
          if (typeof profileData.user_roles[0].roles === 'object' && 
              profileData.user_roles[0].roles !== null &&
              'name' in profileData.user_roles[0].roles) {
            userRole = profileData.user_roles[0].roles.name || 'User';
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
    }
  }, [id]);

  return { member, loading };
}
