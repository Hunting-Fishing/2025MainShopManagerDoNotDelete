import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Briefcase, Building2, Calendar, FileText, Shield, Edit, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { getInitials } from '@/utils/teamUtils';
import { OverviewTab } from '@/components/team/profile/tabs/OverviewTab';
import { WorkOrdersTab } from '@/components/team/profile/tabs/WorkOrdersTab';
import { ActivityTab } from '@/components/team/profile/tabs/ActivityTab';
import { PermissionsTab } from '@/components/team/profile/tabs/PermissionsTab';
import { EditProfileTab } from '@/components/team/profile/tabs/EditProfileTab';
import { CertificationsTab } from '@/components/team/profile/tabs/CertificationsTab';
import { HeaderActions } from '@/components/team/profile/header/HeaderActions';
import { DeleteMemberDialog } from '@/components/team/profile/DeleteMemberDialog';
import { useDeleteMember } from '@/components/team/profile/useDeleteMember';

export default function TeamMemberProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { teamMembers, isLoading } = useTeamMembers();
  const [activeTab, setActiveTab] = useState("overview");
  const { deleteDialogOpen, setDeleteDialogOpen, handleDeleteMember, isDeleting } = useDeleteMember();
  
  const member = teamMembers.find(m => m.id === id);
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }
  
  if (!member) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">Team member not found</p>
            <Button onClick={() => navigate('/team')}>
              Back to Team
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const memberInitials = getInitials(member.name);
  
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success' as const;
      case 'inactive':
        return 'secondary' as const;
      case 'on leave':
        return 'warning' as const;
      case 'terminated':
        return 'destructive' as const;
      default:
        return 'outline' as const;
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&size=96&background=random`} 
                  alt={member.name} 
                />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {memberInitials}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground mb-1">{member.name}</h1>
                    <p className="text-lg text-muted-foreground">{member.jobTitle || 'No Job Title'}</p>
                  </div>
                  <Badge variant={getStatusVariant(member.status)} className="ml-4">
                    {member.status}
                  </Badge>
                </div>
                
                <div className="flex flex-wrap gap-4 mt-4">
                  {member.email && (
                    <a 
                      href={`mailto:${member.email}`}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                    >
                      <Mail className="h-4 w-4" />
                      {member.email}
                    </a>
                  )}
                  {member.phone && (
                    <a 
                      href={`tel:${member.phone}`}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                    >
                      <Phone className="h-4 w-4" />
                      {member.phone}
                    </a>
                  )}
                </div>
              </div>
              
              <HeaderActions 
                onEditClick={() => setActiveTab("edit")}
                onDeleteClick={() => setDeleteDialogOpen(true)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="work-orders">Work Orders</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="edit">Edit Profile</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <OverviewTab member={member} />
        </TabsContent>
        
        <TabsContent value="work-orders">
          <WorkOrdersTab memberId={member.id} />
        </TabsContent>
        
        <TabsContent value="activity">
          <ActivityTab memberId={member.id} />
        </TabsContent>
        
        <TabsContent value="certifications">
          <CertificationsTab memberId={member.id} memberName={member.name} />
        </TabsContent>
        
        <TabsContent value="permissions">
          <PermissionsTab memberRole={member.role} memberId={member.id} />
        </TabsContent>

        <TabsContent value="edit">
          <EditProfileTab 
            initialData={{
              id: member.id,
              firstName: member.name.split(' ')[0] || '',
              lastName: member.name.split(' ').slice(1).join(' ') || '',
              email: member.email,
              phone: member.phone || '',
              jobTitle: member.jobTitle || '',
              department: member.department || '',
              role: member.role,
              status: member.status === 'Active',
              notes: member.notes || ''
            }}
          />
        </TabsContent>
      </Tabs>

      <DeleteMemberDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        memberName={member.name}
        memberId={member.id}
        onDelete={handleDeleteMember}
        isDeleting={isDeleting}
      />
    </div>
  );
}
