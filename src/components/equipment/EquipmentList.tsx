import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface Equipment {
  id: string;
  name: string;
  type: string;
  model: string;
  serialNumber: string;
  status: 'operational' | 'maintenance' | 'repair' | 'inactive';
  lastMaintenance: string;
  nextMaintenance: string;
  location: string;
}

const mockEquipment: Equipment[] = [
  {
    id: '1',
    name: 'Hydraulic Lift #1',
    type: 'Lift',
    model: 'BendPak XPR-10XLS',
    serialNumber: 'BP2023001',
    status: 'operational',
    lastMaintenance: '2024-06-15',
    nextMaintenance: '2024-09-15',
    location: 'Bay 1',
  },
  {
    id: '2',
    name: 'Tire Balancer',
    type: 'Tire Equipment',
    model: 'Hunter GSP9700',
    serialNumber: 'HT2023002',
    status: 'maintenance',
    lastMaintenance: '2024-07-01',
    nextMaintenance: '2024-07-15',
    location: 'Tire Shop',
  },
  {
    id: '3',
    name: 'Air Compressor',
    type: 'Pneumatic',
    model: 'Ingersoll Rand T30',
    serialNumber: 'IR2023003',
    status: 'operational',
    lastMaintenance: '2024-05-30',
    nextMaintenance: '2024-08-30',
    location: 'Shop Floor',
  },
  {
    id: '4',
    name: 'Diagnostic Scanner',
    type: 'Diagnostic',
    model: 'Launch X431 Pro',
    serialNumber: 'LC2023004',
    status: 'repair',
    lastMaintenance: '2024-06-01',
    nextMaintenance: '2024-07-20',
    location: 'Bay 3',
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'operational': return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'maintenance': return <Clock className="h-4 w-4 text-yellow-500" />;
    case 'repair': return <AlertTriangle className="h-4 w-4 text-red-500" />;
    default: return <Clock className="h-4 w-4 text-gray-500" />;
  }
};

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'operational': return 'default';
    case 'maintenance': return 'secondary';
    case 'repair': return 'destructive';
    default: return 'outline';
  }
};

export function EquipmentList() {
  const [equipment] = useState<Equipment[]>(mockEquipment);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Equipment Inventory</CardTitle>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="operational">Operational</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="repair">Repair</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredEquipment.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(item.status)}
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.type} • {item.model}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">Serial: {item.serialNumber}</p>
                    <p className="text-xs text-muted-foreground">Location: {item.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Next Maintenance</p>
                    <p className="text-sm font-medium flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(item.nextMaintenance).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={getStatusVariant(item.status)}>
                    {item.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}