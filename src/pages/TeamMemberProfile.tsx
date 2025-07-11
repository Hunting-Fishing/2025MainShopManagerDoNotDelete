import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, User, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { TeamMemberDetails } from '@/components/team/profile/TeamMemberDetails';
import { supabase } from '@/lib/supabase';
import { TeamMember } from '@/types/team';

export default function TeamMemberProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [member, setMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id) {
      loadMemberProfile();
    }
  }, [id]);

  const loadMemberProfile = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          team_members(
            id,
            employee_id,
            hire_date,
            termination_date,
            emergency_contact_name,
            emergency_contact_phone,
            notes,
            created_at,
            updated_at
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (data) {
        const teamMemberData = Array.isArray(data.team_members) ? data.team_members[0] : data.team_members;
        
        const memberProfile: TeamMember = {
          id: data.id,
          name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
          email: data.email || '',
          phone: data.phone || '',
          jobTitle: data.job_title || '',
          department: data.department || '',
          role: data.role || 'Technician',
          status: data.status !== false ? "Active" : "Inactive",
          notes: teamMemberData?.notes || '',
          workOrders: { assigned: 0, completed: 0 }
        };
        
        setMember(memberProfile);
      }
    } catch (error) {
      console.error('Error loading team member:', error);
      toast.error('Failed to load team member profile');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getDaysWithCompany = (joinDate: string) => {
    const start = new Date(joinDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/team')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="animate-pulse bg-gray-200 h-8 w-64 rounded"></div>
        </div>
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="flex items-center gap-4">
                  <div className="bg-gray-200 h-16 w-16 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="bg-gray-200 h-4 w-48 rounded"></div>
                    <div className="bg-gray-200 h-4 w-32 rounded"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/team')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Team Member Not Found</h1>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">The requested team member could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate('/team')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Team Member Profile</h1>
          <p className="text-muted-foreground">View and manage team member details</p>
        </div>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      {/* Profile Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-lg">
                {getInitials(member.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{member.name}</h2>
                <p className="text-lg text-muted-foreground">{member.jobTitle}</p>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant={member.status ? "default" : "secondary"}>
                    {member.status ? "Active" : "Inactive"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {member.department}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{member.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{member.phone || 'No phone'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {member.joinDate 
                      ? `${getDaysWithCompany(member.joinDate)} with company`
                      : 'Join date not set'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Employee ID</p>
                <p className="font-medium">Not set</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Join Date</p>
                <p className="font-medium">
                  {member.joinDate 
                    ? new Date(member.joinDate).toLocaleDateString()
                    : 'Not set'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-medium">{member.role}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={member.status === "Active" ? "default" : "secondary"} className="mt-1">
                {member.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="edit">Edit Profile</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TeamMemberDetails member={member} activeTab={activeTab} />
      </Tabs>
    </div>
  );
}