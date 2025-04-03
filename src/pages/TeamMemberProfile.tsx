
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ProfileHeader } from "@/components/team/profile/ProfileHeader";
import { ProfileSidebar } from "@/components/team/profile/ProfileSidebar";
import { TeamMemberDetails } from "@/components/team/profile/TeamMemberDetails";
import { DeleteMemberDialog } from "@/components/team/profile/DeleteMemberDialog";
import { supabase } from "@/integrations/supabase/client";
import { TeamMember } from "@/types/team";

export default function TeamMemberProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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

        // Get the role information
        const userRole = profileData.user_roles?.[0]?.roles?.name || 'User';

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

  // Handle member deletion
  const handleDeleteMember = async () => {
    try {
      // In a real app, this would delete the user or disable their account
      // For now, just show a message and navigate back
      toast({
        title: "Feature not implemented",
        description: "User deletion is not implemented in this demo.",
      });
      
      setDeleteDialogOpen(false);
      navigate("/team");
    } catch (error) {
      console.error("Error deleting member:", error);
      toast({
        title: "Error",
        description: "Failed to delete team member.",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = () => {
    setActiveTab("edit");
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-slate-500">Loading team member details...</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <h2 className="text-2xl font-bold">Team Member Not Found</h2>
        <p className="text-slate-500">The team member you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link to="/team">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Team
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <ProfileHeader 
        memberName={member.name}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
      />

      {/* Profile content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <ProfileSidebar member={member} />

        {/* Main content */}
        <div className="md:col-span-3 space-y-6">
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full justify-start border-b rounded-none p-0 h-auto">
              <TabsTrigger 
                value="overview" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-esm-blue-600 py-2 px-4"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="permissions" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-esm-blue-600 py-2 px-4"
              >
                Permissions
              </TabsTrigger>
              <TabsTrigger 
                value="activity" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-esm-blue-600 py-2 px-4"
              >
                Activity
              </TabsTrigger>
              <TabsTrigger 
                value="edit" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-esm-blue-600 py-2 px-4"
              >
                Edit Profile
              </TabsTrigger>
            </TabsList>
            
            <TeamMemberDetails member={member} activeTab={activeTab} />
          </Tabs>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <DeleteMemberDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        memberName={member.name}
        onDelete={handleDeleteMember}
      />
    </div>
  );
}
