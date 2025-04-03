
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileHeader } from "@/components/team/profile/ProfileHeader";
import { ProfileSidebar } from "@/components/team/profile/ProfileSidebar";
import { TeamMemberDetails } from "@/components/team/profile/TeamMemberDetails";
import { DeleteMemberDialog } from "@/components/team/profile/DeleteMemberDialog";
import { ProfileLoading } from "@/components/team/profile/ProfileLoading";
import { ProfileNotFound } from "@/components/team/profile/ProfileNotFound";
import { useTeamMemberProfile } from "@/hooks/useTeamMemberProfile";
import { useDeleteMember } from "@/components/team/profile/useDeleteMember";

export default function TeamMemberProfile() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const { member, loading } = useTeamMemberProfile(id);
  const { deleteDialogOpen, setDeleteDialogOpen, handleDeleteMember } = useDeleteMember();

  const handleEditClick = () => {
    setActiveTab("edit");
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return <ProfileLoading />;
  }

  if (!member) {
    return <ProfileNotFound />;
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
