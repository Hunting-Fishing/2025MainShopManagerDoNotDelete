
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Store, MapPin, Phone, Mail, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Shop {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  isActive: boolean;
  onboardingCompleted: boolean;
  businessType: string;
}

const ShopsManagement: React.FC = () => {
  const [shops] = useState<Shop[]>([
    {
      id: '1',
      name: 'Downtown Auto Center',
      address: '123 Main St, Downtown, ST 12345',
      phone: '(555) 123-4567',
      email: 'downtown@autoshoppro.com',
      isActive: true,
      onboardingCompleted: true,
      businessType: 'Full Service Auto Repair'
    },
    {
      id: '2',
      name: 'Westside Quick Lube',
      address: '456 West Ave, Westside, ST 12346',
      phone: '(555) 234-5678',
      email: 'westside@autoshoppro.com',
      isActive: true,
      onboardingCompleted: false,
      businessType: 'Oil Change & Maintenance'
    },
    {
      id: '3',
      name: 'East End Tire & Service',
      address: '789 East Blvd, East End, ST 12347',
      phone: '(555) 345-6789',
      email: 'eastend@autoshoppro.com',
      isActive: false,
      onboardingCompleted: true,
      businessType: 'Tire Sales & Service'
    }
  ]);

  const handleAddShop = () => {
    toast.info('Add Shop functionality will be implemented');
  };

  const handleEditShop = (shopId: string) => {
    toast.info(`Edit Shop ${shopId} functionality will be implemented`);
  };

  const handleDeleteShop = (shopId: string) => {
    toast.info(`Delete Shop ${shopId} functionality will be implemented`);
  };

  return (
    <Card className="bg-white shadow-md rounded-xl border border-gray-100">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5 text-green-600" />
            Shops Management
            <Badge variant="outline" className="ml-2 bg-green-100 text-green-700 border-green-300">
              {shops.length} shops
            </Badge>
          </CardTitle>
          <Button onClick={handleAddShop} className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Shop
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {shops.map((shop) => (
            <div key={shop.id} className="border rounded-xl p-4 bg-gradient-to-r from-white to-gray-50 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg text-gray-900">{shop.name}</h3>
                    <Badge variant={shop.isActive ? "default" : "secondary"} className={shop.isActive ? "bg-green-100 text-green-800 border-green-200" : ""}>
                      {shop.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    {!shop.onboardingCompleted && (
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                        Setup Incomplete
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {shop.address}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4" />
                      {shop.phone}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4" />
                      {shop.email}
                    </div>
                    <div className="text-gray-500">
                      <span className="font-medium">Type:</span> {shop.businessType}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditShop(shop.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteShop(shop.id)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {shops.length === 0 && (
          <div className="text-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-gray-100 rounded-full">
                <Store className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <p className="text-gray-500 font-medium">No shops found</p>
                <p className="text-sm text-gray-400 mt-1">Add your first shop to get started</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShopsManagement;
