
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, AlertTriangle, CheckCircle, Clock, Search, Filter } from 'lucide-react';
import { WorkOrderPart } from '@/types/workOrderPart';

interface WarrantyStatus {
  part: WorkOrderPart;
  status: 'active' | 'expiring-soon' | 'expired' | 'no-warranty';
  daysRemaining: number;
  expiryDate: Date | null;
}

export function PartsWarrantyTracking() {
  const [warrantyItems, setWarrantyItems] = useState<WarrantyStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const fetchWarrantyData = async () => {
      try {
        setLoading(true);
        
        // Simulated data - replace with actual API call
        const mockParts: WorkOrderPart[] = [
          {
            id: '1',
            workOrderId: 'WO-001',
            partName: 'Brake Pads - Front',
            partNumber: 'BP-001',
            supplierName: 'AutoParts Inc',
            supplierCost: 45.00,
            markupPercentage: 40,
            retailPrice: 63.00,
            customerPrice: 63.00,
            quantity: 1,
            partType: 'inventory',
            createdAt: '2023-01-15T10:00:00Z',
            updatedAt: '2023-01-15T10:00:00Z',
            category: 'Brakes',
            isTaxable: true,
            coreChargeAmount: 15.00,
            coreChargeApplied: true,
            warrantyDuration: '1 Year',
            installDate: '2023-06-15',
            installedBy: 'John Smith',
            status: 'installed',
            isStockItem: true,
            dateAdded: '2023-01-15',
            attachments: []
          },
          {
            id: '2',
            workOrderId: 'WO-002',
            partName: 'Oil Filter',
            partNumber: 'OF-205',
            supplierName: 'FilterPro',
            supplierCost: 12.00,
            markupPercentage: 50,
            retailPrice: 18.00,
            customerPrice: 18.00,
            quantity: 1,
            partType: 'inventory',
            createdAt: '2023-02-10T10:00:00Z',
            updatedAt: '2023-02-10T10:00:00Z',
            category: 'Filters',
            isTaxable: true,
            coreChargeAmount: 0,
            coreChargeApplied: false,
            warrantyDuration: '90 Days',
            installDate: '2023-11-15',
            installedBy: 'Mike Johnson',
            status: 'installed',
            isStockItem: true,
            dateAdded: '2023-02-10',
            attachments: []
          }
        ];

        const warrantyStatuses: WarrantyStatus[] = mockParts.map(part => {
          const installDate = part.installDate ? new Date(part.installDate) : null;
          const warrantyDuration = part.warrantyDuration || 'No Warranty';
          
          let expiryDate: Date | null = null;
          let daysRemaining = 0;
          
          if (installDate && warrantyDuration !== 'No Warranty') {
            expiryDate = new Date(installDate);
            
            switch (warrantyDuration) {
              case '30 Days':
                expiryDate.setDate(expiryDate.getDate() + 30);
                break;
              case '90 Days':
                expiryDate.setDate(expiryDate.getDate() + 90);
                break;
              case '6 Months':
                expiryDate.setMonth(expiryDate.getMonth() + 6);
                break;
              case '1 Year':
                expiryDate.setFullYear(expiryDate.getFullYear() + 1);
                break;
              case '2 Years':
                expiryDate.setFullYear(expiryDate.getFullYear() + 2);
                break;
              case '3 Years':
                expiryDate.setFullYear(expiryDate.getFullYear() + 3);
                break;
              case 'Lifetime':
                expiryDate = null; // Lifetime warranty
                break;
            }
            
            if (expiryDate) {
              const today = new Date();
              daysRemaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            }
          }
          
          let status: 'active' | 'expiring-soon' | 'expired' | 'no-warranty';
          
          if (warrantyDuration === 'No Warranty') {
            status = 'no-warranty';
          } else if (warrantyDuration === 'Lifetime') {
            status = 'active';
          } else if (daysRemaining < 0) {
            status = 'expired';
          } else if (daysRemaining <= 30) {
            status = 'expiring-soon';
          } else {
            status = 'active';
          }
          
          return {
            part,
            status,
            daysRemaining,
            expiryDate
          };
        });

        setWarrantyItems(warrantyStatuses);
      } catch (error) {
        console.error('Error fetching warranty data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWarrantyData();
  }, []);

  const filteredItems = warrantyItems.filter(item => {
    const matchesSearch = item.part.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.part.partNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && item.status === statusFilter;
  });

  const getStatusBadge = (status: WarrantyStatus['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'expiring-soon':
        return <Badge className="bg-yellow-100 text-yellow-800">Expiring Soon</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
      case 'no-warranty':
        return <Badge variant="secondary">No Warranty</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: WarrantyStatus['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'expiring-soon':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'expired':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'no-warranty':
        return <Calendar className="h-4 w-4 text-gray-400" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-400" />;
    }
  };

  const warrantyStats = {
    total: warrantyItems.length,
    active: warrantyItems.filter(item => item.status === 'active').length,
    expiringSoon: warrantyItems.filter(item => item.status === 'expiring-soon').length,
    expired: warrantyItems.filter(item => item.status === 'expired').length,
    noWarranty: warrantyItems.filter(item => item.status === 'no-warranty').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading warranty data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Warranty Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Parts</p>
                <p className="text-2xl font-bold">{warrantyStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Active</p>
                <p className="text-2xl font-bold">{warrantyStats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Expiring Soon</p>
                <p className="text-2xl font-bold">{warrantyStats.expiringSoon}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Expired</p>
                <p className="text-2xl font-bold">{warrantyStats.expired}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-gray-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">No Warranty</p>
                <p className="text-2xl font-bold">{warrantyStats.noWarranty}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Warranty Tracking</CardTitle>
          <CardDescription>Monitor parts warranty status and expiration dates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search parts by name or number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expiring-soon">Expiring Soon</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="no-warranty">No Warranty</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Warranty Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Part Name</TableHead>
                  <TableHead>Part Number</TableHead>
                  <TableHead>Warranty Duration</TableHead>
                  <TableHead>Install Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Days Remaining</TableHead>
                  <TableHead>Installed By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No warranty items found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.part.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(item.status)}
                          {getStatusBadge(item.status)}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{item.part.partName}</TableCell>
                      <TableCell>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {item.part.partNumber || 'N/A'}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {item.part.warrantyDuration || 'No Warranty'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.part.installDate 
                          ? new Date(item.part.installDate).toLocaleDateString()
                          : 'Not installed'
                        }
                      </TableCell>
                      <TableCell>
                        {item.expiryDate 
                          ? item.expiryDate.toLocaleDateString()
                          : item.part.warrantyDuration === 'Lifetime' 
                            ? 'Lifetime' 
                            : 'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        {item.part.warrantyDuration === 'Lifetime' ? (
                          <span className="text-green-600 font-medium">Lifetime</span>
                        ) : item.part.warrantyDuration === 'No Warranty' ? (
                          <span className="text-gray-500">N/A</span>
                        ) : item.daysRemaining < 0 ? (
                          <span className="text-red-600 font-medium">
                            Expired {Math.abs(item.daysRemaining)} days ago
                          </span>
                        ) : (
                          <span className={item.daysRemaining <= 30 ? 'text-yellow-600 font-medium' : 'text-green-600'}>
                            {item.daysRemaining} days
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.part.installedBy || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
