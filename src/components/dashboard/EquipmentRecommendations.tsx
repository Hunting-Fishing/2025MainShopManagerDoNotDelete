
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, AlertTriangle, Settings, ShieldCheck, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Equipment } from "@/types/equipment";
import { EquipmentRecommendation, getEquipmentRecommendations, getRecommendationTypeColor } from "@/utils/equipment/recommendations";
import { Skeleton } from "@/components/ui/skeleton";

export function EquipmentRecommendations() {
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<EquipmentRecommendation[]>([]);

  useEffect(() => {
    const fetchEquipmentData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('equipment')
          .select('*');
        
        if (error) {
          throw error;
        }
        
        if (!data || data.length === 0) {
          setRecommendations([]);
          return;
        }
        
        // Transform data to match Equipment type
        const transformedData: Equipment[] = data.map(item => {
          // Validate status
          const validStatus = ["operational", "maintenance-required", "out-of-service", "decommissioned"].includes(item.status) 
            ? item.status as Equipment["status"] 
            : "operational";
          
          // Validate warranty status
          const validWarrantyStatus = ["active", "expired", "not-applicable"].includes(item.warranty_status) 
            ? item.warranty_status as Equipment["warrantyStatus"] 
            : "not-applicable";
          
          // Validate maintenance frequency
          const validMaintenanceFrequency = ["monthly", "quarterly", "bi-annually", "annually", "as-needed"].includes(item.maintenance_frequency) 
            ? item.maintenance_frequency as Equipment["maintenanceFrequency"] 
            : "as-needed";
          
          return {
            id: item.id,
            name: item.name,
            model: item.model,
            serialNumber: item.serial_number,
            manufacturer: item.manufacturer,
            category: item.category,
            purchaseDate: item.purchase_date,
            installDate: item.install_date,
            customer: item.customer,
            location: item.location,
            status: validStatus,
            nextMaintenanceDate: item.next_maintenance_date,
            maintenanceFrequency: validMaintenanceFrequency,
            lastMaintenanceDate: item.last_maintenance_date,
            warrantyExpiryDate: item.warranty_expiry_date,
            warrantyStatus: validWarrantyStatus,
            notes: item.notes,
            workOrderHistory: Array.isArray(item.work_order_history) ? item.work_order_history : [],
            maintenanceHistory: Array.isArray(item.maintenance_history) ? item.maintenance_history : [],
            maintenanceSchedules: Array.isArray(item.maintenance_schedules) ? item.maintenance_schedules : []
          };
        });
        
        const equipmentRecommendations = getEquipmentRecommendations(transformedData);
        setRecommendations(equipmentRecommendations);
        
      } catch (error: any) {
        console.error("Error fetching equipment data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipmentData();
  }, []);

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'urgent':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'soon':
        return <Settings className="h-4 w-4 text-amber-500" />;
      case 'normal':
        return <ShieldCheck className="h-4 w-4 text-blue-500" />;
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Equipment Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-6">
            <ShieldCheck className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No recommendations at this time</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.slice(0, 5).map((recommendation) => (
              <div 
                key={recommendation.id} 
                className={`p-3 border rounded-md ${getRecommendationTypeColor(recommendation.type)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getRecommendationIcon(recommendation.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">
                      {recommendation.equipmentName}
                    </h4>
                    <p className="text-xs mt-1">{recommendation.reason}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs font-medium">
                        {recommendation.action}
                      </span>
                      <Link 
                        to={`/equipment/${recommendation.equipmentId}`}
                        className="flex items-center gap-1 text-xs font-medium hover:underline"
                      >
                        View details
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {recommendations.length > 5 && (
              <div className="text-center">
                <Link 
                  to="/equipment"
                  className="text-xs font-medium text-blue-600 hover:text-blue-800"
                >
                  View {recommendations.length - 5} more recommendations
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
