import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Settings, Calendar, AlertTriangle, CheckCircle, Wrench, ClipboardList, ShieldCheck, BookOpen, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { getEquipmentById, updateEquipmentStatus, type EquipmentDetails } from '@/services/equipment/equipmentService';
import { MaintenanceIntervals } from '@/components/equipment/MaintenanceIntervals';
import { EquipmentWorkRequests } from '@/components/equipment-details/EquipmentWorkRequests';
import { EquipmentConfigDialog } from '@/components/equipment/EquipmentConfigDialog';
import { SafetyEquipmentList } from '@/components/equipment/SafetyEquipmentList';
import { EquipmentManuals } from '@/components/equipment/EquipmentManuals';

export default function EquipmentDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState<EquipmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [configOpen, setConfigOpen] = useState(false);

  useEffect(() => {
    if (id) {
      loadEquipmentDetails();
    }
  }, [id]);

  const loadEquipmentDetails = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const data = await getEquipmentById(id);
      setEquipment(data);
    } catch (error) {
      console.error('Error loading equipment:', error);
      toast.error('Failed to load equipment details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!id) return;
    
    const success = await updateEquipmentStatus(id, newStatus);
    if (success) {
      toast.success('Equipment status updated');
      loadEquipmentDetails();
    } else {
      toast.error('Failed to update equipment status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'down': return 'bg-red-100 text-red-800';
      case 'repair': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/equipment')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="animate-pulse bg-gray-200 h-8 w-64 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="bg-gray-200 h-4 w-full rounded"></div>
                  <div className="bg-gray-200 h-4 w-3/4 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/equipment')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Equipment Not Found</h1>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">The requested equipment could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/equipment')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{equipment.name}</h1>
            <p className="text-muted-foreground">{equipment.type || equipment.category} - {equipment.model}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(equipment.currentStatus)}>
            {equipment.currentStatus}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => setConfigOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium capitalize">{equipment.currentStatus}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Last Maintenance</p>
                <p className="font-medium">
                  {equipment.maintenanceRecords[0]?.date 
                    ? new Date(equipment.maintenanceRecords[0].date).toLocaleDateString()
                    : 'Never'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{equipment.location}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">Assigned To</p>
              <p className="font-medium">{equipment.assignedTo || 'Unassigned'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details Tabs */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="manuals">
            <BookOpen className="h-4 w-4 mr-2" />
            Manuals
          </TabsTrigger>
          <TabsTrigger value="safety">
            <ShieldCheck className="h-4 w-4 mr-2" />
            Safety
          </TabsTrigger>
          <TabsTrigger value="work-requests">
            <ClipboardList className="h-4 w-4 mr-2" />
            Work Requests
          </TabsTrigger>
          <TabsTrigger value="intervals">
            <Wrench className="h-4 w-4 mr-2" />
            Maintenance Intervals
          </TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance History</TabsTrigger>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Equipment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Serial Number</label>
                  <p className="mt-1">{equipment.serial_number || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Purchase Date</label>
                  <p className="mt-1">
                    {equipment.purchase_date 
                      ? new Date(equipment.purchase_date).toLocaleDateString()
                      : 'N/A'
                    }
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Warranty Expiry</label>
                  <p className="mt-1">
                    {equipment.warranty_expiry_date 
                      ? new Date(equipment.warranty_expiry_date).toLocaleDateString()
                      : 'N/A'
                    }
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Current Value</label>
                  <p className="mt-1">
                    {equipment.current_value 
                      ? `$${equipment.current_value.toLocaleString()}`
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
              
              {equipment.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="mt-1">{equipment.description}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => handleStatusUpdate('operational')}
                  disabled={equipment.currentStatus === 'operational'}
                  variant="outline"
                  size="sm"
                >
                  Mark Operational
                </Button>
                <Button 
                  onClick={() => handleStatusUpdate('maintenance')}
                  disabled={equipment.currentStatus === 'maintenance'}
                  variant="outline"
                  size="sm"
                >
                  Mark for Maintenance
                </Button>
                <Button 
                  onClick={() => handleStatusUpdate('down')}
                  disabled={equipment.currentStatus === 'down'}
                  variant="outline"
                  size="sm"
                >
                  Mark Down
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Trailer Specifications Card */}
          {(equipment as any).specifications?.trailer && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🚛 Trailer Specifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">GVWR (Gross Weight)</label>
                      <p className="mt-1 text-lg font-semibold">
                        {(equipment as any).specifications.trailer.gvwr 
                          ? `${(equipment as any).specifications.trailer.gvwr.toLocaleString()} lbs`
                          : 'N/A'
                        }
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Front Axle Capacity</label>
                      <p className="mt-1 text-lg font-semibold">
                        {(equipment as any).specifications.trailer.front_axle_capacity 
                          ? `${(equipment as any).specifications.trailer.front_axle_capacity.toLocaleString()} lbs`
                          : 'N/A'
                        }
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Rear Axle Capacity</label>
                      <p className="mt-1 text-lg font-semibold">
                        {(equipment as any).specifications.trailer.rear_axle_capacity 
                          ? `${(equipment as any).specifications.trailer.rear_axle_capacity.toLocaleString()} lbs`
                          : 'N/A'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Manufacture Year</label>
                      <p className="mt-1 text-lg font-semibold">
                        {(equipment as any).specifications.trailer.manufacture_year || 'N/A'}
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Tire Size</label>
                        <p className="mt-1 font-medium">
                          {(equipment as any).specifications.trailer.tire_size || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Rim Size</label>
                        <p className="mt-1 font-medium">
                          {(equipment as any).specifications.trailer.rim_size || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Tire PSI</label>
                        <p className="mt-1 font-medium">
                          {(equipment as any).specifications.trailer.tire_psi 
                            ? `${(equipment as any).specifications.trailer.tire_psi} PSI`
                            : 'N/A'
                          }
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Number of Axles</label>
                      <p className="mt-1 text-lg font-semibold">
                        {(equipment as any).specifications.trailer.num_axles 
                          ? `${(equipment as any).specifications.trailer.num_axles} Axle${(equipment as any).specifications.trailer.num_axles > 1 ? 's' : ''}`
                          : 'N/A'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="manuals" className="space-y-4">
          <EquipmentManuals equipmentId={id!} equipmentName={equipment.name} />
        </TabsContent>

        <TabsContent value="safety" className="space-y-4">
          <SafetyEquipmentList parentEquipmentId={id} />
        </TabsContent>

        <TabsContent value="work-requests" className="space-y-4">
          <EquipmentWorkRequests 
            equipmentId={id!} 
            equipmentName={equipment.name}
          />
        </TabsContent>

        <TabsContent value="intervals" className="space-y-4">
          <MaintenanceIntervals equipmentId={id!} />
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance History</CardTitle>
            </CardHeader>
            <CardContent>
              {equipment.maintenanceRecords.length > 0 ? (
                <div className="space-y-4">
                  {equipment.maintenanceRecords.map((record) => (
                    <div key={record.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{record.type}</h4>
                          <p className="text-sm text-muted-foreground">{record.description}</p>
                        </div>
                        <div className="text-right text-sm">
                          <p className="font-medium">${record.cost.toLocaleString()}</p>
                          <p className="text-muted-foreground">
                            {new Date(record.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Technician: {record.technician}</span>
                        {record.nextMaintenanceDate && (
                          <span className="text-muted-foreground">
                            Next: {new Date(record.nextMaintenanceDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No maintenance records found
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Technical Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const specs = equipment.specifications || {};
                // Filter out nested objects/arrays - only show primitive values
                const simpleSpecs = Object.entries(specs).filter(([key, value]) => 
                  typeof value !== 'object' || value === null
                );
                const attachments = Array.isArray((specs as any)?.attachments) ? (specs as any).attachments : [];
                const items = Array.isArray((specs as any)?.items) ? (specs as any).items : [];
                const hasContent = simpleSpecs.length > 0 || attachments.length > 0 || items.length > 0;

                if (!hasContent) {
                  return (
                    <p className="text-center text-muted-foreground py-8">
                      No specifications available
                    </p>
                  );
                }

                return (
                  <div className="space-y-6">
                    {/* Simple key-value specifications */}
                    {simpleSpecs.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {simpleSpecs.map(([key, value]) => (
                          <div key={key}>
                            <label className="text-sm font-medium text-muted-foreground capitalize">
                              {key.replace(/_/g, ' ')}
                            </label>
                            <p className="mt-1">{String(value)}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Items specifications */}
                    {items.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">Specification Items</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {items.map((item: any, idx: number) => (
                            <div key={idx} className="border rounded-lg p-3">
                              <p className="font-medium">{item.spec_name || item.item_name || 'Item'}</p>
                              {item.spec_type && <p className="text-sm text-muted-foreground">{item.spec_type}</p>}
                              {item.quantity && <p className="text-sm">Qty: {item.quantity} {item.unit || ''}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Attachments section */}
                    {attachments.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">Media Attachments</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {attachments.map((att: any, idx: number) => (
                            <div key={idx} className="border rounded-lg p-2 text-center">
                              {att.type === 'image' ? (
                                <img 
                                  src={att.url} 
                                  alt={att.name || 'Attachment'} 
                                  className="w-full h-24 object-cover rounded mb-2"
                                />
                              ) : (
                                <div className="w-full h-24 bg-muted flex items-center justify-center rounded mb-2">
                                  <FileText className="h-8 w-8 text-muted-foreground" />
                                </div>
                              )}
                              <p className="text-xs truncate">{att.name || 'File'}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <EquipmentConfigDialog
        open={configOpen}
        onOpenChange={setConfigOpen}
        equipment={equipment}
        onSave={loadEquipmentDetails}
      />
    </div>
  );
}