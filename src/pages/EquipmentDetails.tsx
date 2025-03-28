
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { equipment, getWorkOrdersForEquipment, maintenanceFrequencyMap } from "@/data/equipmentData";
import { Equipment } from "@/types/equipment";
import { EquipmentStatusBadge } from "@/components/equipment/EquipmentStatusBadge";
import { WarrantyStatusBadge } from "@/components/equipment/WarrantyStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { ChevronLeft, Wrench, FileText, Edit, AlertTriangle, Calendar } from "lucide-react";
import { WorkOrder } from "@/data/workOrdersData";

export default function EquipmentDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [equipmentItem, setEquipmentItem] = useState<Equipment | null>(null);
  const [relatedWorkOrders, setRelatedWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchEquipment = () => {
      setLoading(true);
      try {
        if (!id) {
          navigate("/equipment");
          return;
        }

        const foundEquipment = equipment.find(item => item.id === id);
        
        if (foundEquipment) {
          setEquipmentItem(foundEquipment);
          // Get related work orders
          const workOrders = getWorkOrdersForEquipment(id);
          setRelatedWorkOrders(workOrders);
        } else {
          toast({
            title: "Error",
            description: "Equipment not found.",
            variant: "destructive",
          });
          navigate("/equipment");
        }
      } catch (error) {
        console.error("Error fetching equipment:", error);
        toast({
          title: "Error",
          description: "Failed to load equipment details.",
          variant: "destructive",
        });
        navigate("/equipment");
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [id, navigate]);

  const handleScheduleMaintenance = () => {
    if (!equipmentItem) return;
    
    // In a real application, this would create a new work order for maintenance
    toast({
      title: "Maintenance Scheduled",
      description: `Maintenance has been scheduled for ${equipmentItem.name}.`,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="text-lg text-slate-500">Loading equipment details...</div>
      </div>
    );
  }

  if (!equipmentItem) {
    return null;
  }

  const isMaintenanceOverdue = new Date(equipmentItem.nextMaintenanceDate) < new Date();
  const isWarrantyExpiring = equipmentItem.warrantyStatus === "active" && 
    (new Date(equipmentItem.warrantyExpiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24) < 30;

  return (
    <div className="space-y-6">
      {/* Back button and header */}
      <div>
        <Button variant="ghost" onClick={() => navigate("/equipment")} className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Equipment
        </Button>
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">{equipmentItem.name}</h1>
            <p className="text-slate-500">{equipmentItem.id} | {equipmentItem.model}</p>
          </div>
          <div className="flex gap-2 mt-4 lg:mt-0">
            <Button 
              variant={isMaintenanceOverdue ? "destructive" : "outline"}
              onClick={handleScheduleMaintenance}
            >
              <Wrench className="mr-2 h-4 w-4" /> 
              {isMaintenanceOverdue ? "Schedule Overdue Maintenance" : "Schedule Maintenance"}
            </Button>
            <Link to={`/equipment/${id}/edit`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" /> Edit Equipment
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Alert banners */}
      {isMaintenanceOverdue && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <p>Maintenance is overdue. Last maintenance was on {equipmentItem.lastMaintenanceDate}.</p>
          </div>
        </div>
      )}
      
      {isWarrantyExpiring && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <p>Warranty is expiring soon on {equipmentItem.warrantyExpiryDate}.</p>
          </div>
        </div>
      )}

      {/* Details cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Equipment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="font-medium text-slate-500">Manufacturer:</dt>
                <dd>{equipmentItem.manufacturer}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-slate-500">Serial Number:</dt>
                <dd>{equipmentItem.serialNumber}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-slate-500">Category:</dt>
                <dd>{equipmentItem.category}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-slate-500">Status:</dt>
                <dd><EquipmentStatusBadge status={equipmentItem.status} /></dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-slate-500">Customer:</dt>
                <dd>{equipmentItem.customer}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-slate-500">Location:</dt>
                <dd>{equipmentItem.location}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dates & Warranty</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="font-medium text-slate-500">Purchase Date:</dt>
                <dd>{equipmentItem.purchaseDate}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-slate-500">Install Date:</dt>
                <dd>{equipmentItem.installDate}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-slate-500">Last Maintenance:</dt>
                <dd>{equipmentItem.lastMaintenanceDate}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-slate-500">Next Maintenance:</dt>
                <dd className={isMaintenanceOverdue ? "text-red-600 font-medium" : ""}>
                  {equipmentItem.nextMaintenanceDate}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-slate-500">Maintenance Frequency:</dt>
                <dd>{maintenanceFrequencyMap[equipmentItem.maintenanceFrequency]}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-slate-500">Warranty Expiry:</dt>
                <dd>{equipmentItem.warrantyExpiryDate}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-slate-500">Warranty Status:</dt>
                <dd><WarrantyStatusBadge status={equipmentItem.warrantyStatus} /></dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {equipmentItem.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700">{equipmentItem.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Related Work Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Work Order History</CardTitle>
          <Link to={`/work-orders/new?equipment=${equipmentItem.id}`}>
            <Button variant="outline" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              Create Work Order
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {relatedWorkOrders.length === 0 ? (
            <p className="text-slate-500">No work orders found for this equipment.</p>
          ) : (
            <div className="divide-y">
              {relatedWorkOrders.map(order => (
                <div key={order.id} className="py-3 flex justify-between items-center">
                  <div>
                    <Link to={`/work-orders/${order.id}`} className="font-medium text-blue-600 hover:text-blue-800">
                      {order.id}
                    </Link>
                    <p className="text-sm text-slate-500">{order.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-500">{order.date}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                      order.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('-', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
