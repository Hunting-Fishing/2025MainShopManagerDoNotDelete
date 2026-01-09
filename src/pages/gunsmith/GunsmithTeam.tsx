import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useGunsmithTeam, useAddGunsmithTeamMember, useUpdateGunsmithTeamMember, useRemoveGunsmithTeamMember } from '@/hooks/gunsmith/useGunsmithTeam';
import { useGunsmithRoles } from '@/hooks/gunsmith/useGunsmithRoles';
import { Loader2, Plus, UserPlus, MoreVertical, Edit, Trash2, Phone, Mail, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function GunsmithTeam() {
  const { data: team, isLoading } = useGunsmithTeam();
  const { data: roles } = useGunsmithRoles();
  const addMember = useAddGunsmithTeamMember();
  const updateMember = useUpdateGunsmithTeamMember();
  const removeMember = useRemoveGunsmithTeamMember();
  
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');

  // Get available profiles that aren't already team members
  const { data: profiles } = useQuery({
    queryKey: ['profiles-for-team'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .order('first_name');
      
      if (error) throw error;
      return data;
    },
  });

  const availableProfiles = profiles?.filter(
    p => !team?.some(t => t.profile_id === p.id)
  );

  const handleAddMember = () => {
    if (!selectedProfileId || !selectedRoleId) return;
    
    addMember.mutate({
      profile_id: selectedProfileId,
      role_id: selectedRoleId,
    }, {
      onSuccess: () => {
        setAddDialogOpen(false);
        setSelectedProfileId('');
        setSelectedRoleId('');
      }
    });
  };

  const handleDeleteMember = () => {
    if (!memberToDelete) return;
    removeMember.mutate(memberToDelete, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setMemberToDelete(null);
      }
    });
  };

  const handleToggleActive = (id: string, currentActive: boolean) => {
    updateMember.mutate({ id, is_active: !currentActive });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const activeMembers = team?.filter(m => m.is_active) || [];
  const inactiveMembers = team?.filter(m => !m.is_active) || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gunsmith Team</h1>
          <p className="text-muted-foreground">Manage your gunsmith shop team members</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/gunsmith/roles">
              <Shield className="mr-2 h-4 w-4" />
              Manage Roles
            </Link>
          </Button>
          
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Team Member
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
              <DialogDescription>
                Add an existing user to your gunsmith team
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Select User</Label>
                <Select value={selectedProfileId} onValueChange={setSelectedProfileId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProfiles?.map(profile => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.first_name} {profile.last_name} ({profile.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assign Role</Label>
                <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles?.map(role => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddMember} disabled={addMember.isPending}>
                {addMember.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Member
              </Button>
            </DialogFooter>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Active Members */}
      <Card>
        <CardHeader>
          <CardTitle>Active Team Members ({activeMembers.length})</CardTitle>
          <CardDescription>Current active staff in your gunsmith shop</CardDescription>
        </CardHeader>
        <CardContent>
          {activeMembers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No active team members. Add your first team member above.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeMembers.map(member => (
                <Card key={member.id} className="relative">
                  <CardContent className="pt-6">
                    <div className="absolute top-2 right-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleToggleActive(member.id, true)}>
                            Deactivate
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => {
                              setMemberToDelete(member.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.profile?.avatar_url || ''} />
                        <AvatarFallback>
                          {member.profile?.first_name?.[0]}{member.profile?.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {member.profile?.first_name} {member.profile?.last_name}
                        </p>
                        <Badge variant="secondary" className="mt-1">
                          {member.role?.name || 'No Role'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                      {member.profile?.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{member.profile.email}</span>
                        </div>
                      )}
                      {member.profile?.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          <span>{member.profile.phone}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inactive Members */}
      {inactiveMembers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Inactive Members ({inactiveMembers.length})</CardTitle>
            <CardDescription>Previously active team members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {inactiveMembers.map(member => (
                <Card key={member.id} className="relative opacity-60">
                  <CardContent className="pt-6">
                    <div className="absolute top-2 right-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleToggleActive(member.id, false)}
                      >
                        Reactivate
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.profile?.avatar_url || ''} />
                        <AvatarFallback>
                          {member.profile?.first_name?.[0]}{member.profile?.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {member.profile?.first_name} {member.profile?.last_name}
                        </p>
                        <Badge variant="outline" className="mt-1">
                          {member.role?.name || 'No Role'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this team member? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMember} className="bg-destructive text-destructive-foreground">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
