import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Briefcase, Building2, Calendar, FileText, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { getInitials } from '@/utils/teamUtils';

export default function TeamMemberProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { teamMembers, isLoading } = useTeamMembers();
  
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
              
              <div className="flex gap-2">
                <Button asChild variant="outline">
                  <Link to={`/team/${member.id}/edit`}>
                    Edit Profile
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="work-orders">Work Orders</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Work Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Work Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Role</p>
                  <p className="font-medium">{member.role}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Department</p>
                  <p className="font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {member.department}
                  </p>
                </div>
                {member.joinDate && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Join Date</p>
                      <p className="font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(member.joinDate).toLocaleDateString()}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            
            {/* Performance Stats */}
            {member.role === "Technician" && (
              <Card>
                <CardHeader>
                  <CardTitle>Work Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center p-4 bg-primary/5 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Assigned</p>
                      <p className="text-3xl font-bold text-primary">{member.workOrders.assigned}</p>
                    </div>
                    <div className="text-center p-4 bg-green-500/5 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Completed</p>
                      <p className="text-3xl font-bold text-green-600">{member.workOrders.completed}</p>
                    </div>
                  </div>
                  {member.workOrders.assigned > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-2">Completion Rate</p>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{ 
                            width: `${Math.round((member.workOrders.completed / member.workOrders.assigned) * 100)}%` 
                          }}
                        />
                      </div>
                      <p className="text-sm text-right mt-1 text-muted-foreground">
                        {Math.round((member.workOrders.completed / member.workOrders.assigned) * 100)}%
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Notes */}
            {member.notes && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{member.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="work-orders">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Work order history will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Activity timeline will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Role Permissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Current Role</p>
                  <Badge variant="outline" className="text-base px-3 py-1">
                    {member.role}
                  </Badge>
                </div>
                <Separator />
                <p className="text-sm text-muted-foreground">
                  Permissions are managed at the role level. To modify this user's permissions, 
                  either change their role or modify the role's permissions in Settings.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
