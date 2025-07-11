import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useTeamFilterData } from '@/hooks/team/useTeamFilterData';
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Calendar,
  Shield,
  Save,
  ArrowLeft,
  Loader2
} from 'lucide-react';

interface TeamMemberFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  job_title: string;
  department: string;
  location: string;
  role: string;
  start_date: string;
  bio: string;
  is_active: boolean;
  is_remote: boolean;
  is_contractor: boolean;
  emergency_contact_name: string;
  emergency_contact_phone: string;
}

const defaultFormData: TeamMemberFormData = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  job_title: '',
  department: '',
  location: '',
  role: '',
  start_date: new Date().toISOString().split('T')[0],
  bio: '',
  is_active: true,
  is_remote: false,
  is_contractor: false,
  emergency_contact_name: '',
  emergency_contact_phone: ''
};

export default function TeamCreate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<TeamMemberFormData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { filterData, isLoading: filterLoading } = useTeamFilterData();

  const updateFormData = (field: keyof TeamMemberFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.first_name || !formData.last_name || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast.success('Team member form submitted! (This is a demo - full database integration coming soon)');
    console.log('Team member data:', formData);
    
    setIsSubmitting(false);
    navigate('/team');
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => navigate('/team')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Team
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add Team Member</h1>
          <p className="text-muted-foreground">Create a new team member profile</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => updateFormData('first_name', e.target.value)}
                placeholder="Enter first name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => updateFormData('last_name', e.target.value)}
                placeholder="Enter last name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  placeholder="Enter email address"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  placeholder="Enter phone number"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => updateFormData('bio', e.target.value)}
                placeholder="Brief description or background"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Work Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Work Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="job_title">Job Title</Label>
              <Input
                id="job_title"
                value={formData.job_title}
                onChange={(e) => updateFormData('job_title', e.target.value)}
                placeholder="Enter job title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select value={formData.department} onValueChange={(value) => updateFormData('department', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {filterLoading ? (
                    <SelectItem value="" disabled>Loading departments...</SelectItem>
                  ) : filterData.departments.length === 0 ? (
                    <SelectItem value="" disabled>No departments found</SelectItem>
                  ) : (
                    filterData.departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select value={formData.location} onValueChange={(value) => updateFormData('location', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {filterLoading ? (
                    <SelectItem value="" disabled>Loading locations...</SelectItem>
                  ) : filterData.locations.length === 0 ? (
                    <SelectItem value="" disabled>No locations found</SelectItem>
                  ) : (
                    filterData.locations.map(location => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => updateFormData('role', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {filterLoading ? (
                    <SelectItem value="" disabled>Loading roles...</SelectItem>
                  ) : filterData.roles.length === 0 ? (
                    <SelectItem value="" disabled>No roles found</SelectItem>
                  ) : (
                    filterData.roles.map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => updateFormData('start_date', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="emergency_contact_name">Contact Name</Label>
              <Input
                id="emergency_contact_name"
                value={formData.emergency_contact_name}
                onChange={(e) => updateFormData('emergency_contact_name', e.target.value)}
                placeholder="Emergency contact name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
              <Input
                id="emergency_contact_phone"
                value={formData.emergency_contact_phone}
                onChange={(e) => updateFormData('emergency_contact_phone', e.target.value)}
                placeholder="Emergency contact phone"
              />
            </div>
          </CardContent>
        </Card>

        {/* Status & Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Status & Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_active">Active Employee</Label>
                <p className="text-sm text-muted-foreground">Whether this team member is currently active</p>
              </div>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => updateFormData('is_active', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_remote">Remote Worker</Label>
                <p className="text-sm text-muted-foreground">Works remotely or from home</p>
              </div>
              <Switch
                id="is_remote"
                checked={formData.is_remote}
                onCheckedChange={(checked) => updateFormData('is_remote', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_contractor">Contractor</Label>
                <p className="text-sm text-muted-foreground">Is this person a contractor or direct employee?</p>
              </div>
              <Switch
                id="is_contractor"
                checked={formData.is_contractor}
                onCheckedChange={(checked) => updateFormData('is_contractor', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex gap-4 pt-6">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Team Member
              </>
            )}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/team')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}