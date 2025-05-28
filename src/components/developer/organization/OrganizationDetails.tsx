
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building, MapPin, Phone, Mail, Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface OrganizationDetailsProps {
  organizationId?: string;
}

const OrganizationDetails: React.FC<OrganizationDetailsProps> = ({ organizationId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [organizationData, setOrganizationData] = useState({
    name: 'AutoShop Pro',
    description: 'Professional automotive service management platform',
    address: '123 Main Street, Anytown, ST 12345',
    phone: '(555) 123-4567',
    email: 'admin@autoshoppro.com',
    website: 'https://autoshoppro.com',
    taxId: '12-3456789',
    industry: 'Automotive Services'
  });

  const [editData, setEditData] = useState(organizationData);

  const handleEdit = () => {
    setEditData(organizationData);
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOrganizationData(editData);
      setIsEditing(false);
      toast.success('Organization details updated successfully');
    } catch (error) {
      toast.error('Failed to update organization details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData(organizationData);
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="bg-white shadow-md rounded-xl border border-gray-100">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-600" />
            Organization Details
          </CardTitle>
          {!isEditing ? (
            <Button onClick={handleEdit} variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={isLoading} size="sm" className="bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Organization Name</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={editData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              ) : (
                <p className="text-gray-900 font-medium">{organizationData.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              {isEditing ? (
                <Textarea
                  id="description"
                  value={editData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              ) : (
                <p className="text-gray-700">{organizationData.description}</p>
              )}
            </div>

            <div>
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Address
              </Label>
              {isEditing ? (
                <Textarea
                  id="address"
                  value={editData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={2}
                />
              ) : (
                <p className="text-gray-700">{organizationData.address}</p>
              )}
            </div>

            <div>
              <Label htmlFor="industry">Industry</Label>
              {isEditing ? (
                <Input
                  id="industry"
                  value={editData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                />
              ) : (
                <p className="text-gray-700">{organizationData.industry}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone
              </Label>
              {isEditing ? (
                <Input
                  id="phone"
                  value={editData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              ) : (
                <p className="text-gray-700">{organizationData.phone}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={editData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              ) : (
                <p className="text-gray-700">{organizationData.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              {isEditing ? (
                <Input
                  id="website"
                  value={editData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                />
              ) : (
                <p className="text-gray-700">
                  <a href={organizationData.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {organizationData.website}
                  </a>
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="taxId">Tax ID</Label>
              {isEditing ? (
                <Input
                  id="taxId"
                  value={editData.taxId}
                  onChange={(e) => handleInputChange('taxId', e.target.value)}
                />
              ) : (
                <p className="text-gray-700">{organizationData.taxId}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrganizationDetails;
