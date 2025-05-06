
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ProfileHeader } from "@/components/team/profile/ProfileHeader";
import { useTeamMemberProfile } from "@/hooks/useTeamMemberProfile";
import { ProfileLoading } from "@/components/team/profile/ProfileLoading";
import { ProfileNotFound } from "@/components/team/profile/ProfileNotFound";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamMemberDetails } from "@/components/team/profile/TeamMemberDetails";
import { TeamPermissions } from "@/components/team/TeamPermissions";

export default function TeamMemberProfile() {
  const { id } = useParams<{ id: string }>();
  const { member, isLoading, error } = useTeamMemberProfile(id || "");
  
  if (isLoading) {
    return <ProfileLoading />;
  }
  
  if (error || !member) {
    return <ProfileNotFound error={error} />;
  }
  
  return (
    <div className="space-y-6">
      <Helmet>
        <title>{`${member.name} | Team Profile`}</title>
        <meta name="description" content={`Profile page for ${member.name}, ${member.jobTitle || 'Team Member'} at Easy Shop Manager.`} />
        <meta name="keywords" content="team member, profile, permissions, role management" />
      </Helmet>
      
      <ProfileHeader member={member} />
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="edit">Edit Profile</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <TeamMemberDetails member={member} />
        </TabsContent>
        
        <TabsContent value="permissions" className="space-y-6">
          <TeamPermissions memberId={member.id} />
        </TabsContent>
        
        <TabsContent value="activity" className="space-y-6">
          <p className="text-muted-foreground">Activity history will be implemented in the future.</p>
        </TabsContent>
        
        <TabsContent value="edit" className="space-y-6">
          <p className="text-muted-foreground">Edit profile functionality will be implemented in the future.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
