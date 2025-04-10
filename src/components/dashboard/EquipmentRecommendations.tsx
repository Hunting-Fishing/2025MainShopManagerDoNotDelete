
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getEquipmentRecommendations } from "@/services/dashboardService";
import { EquipmentRecommendation } from "@/types/dashboard";

export function EquipmentRecommendations() {
  const [recommendations, setRecommendations] = useState<EquipmentRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const data = await getEquipmentRecommendations();
        
        // Format and validate the priority field matches expected type
        const formattedRecommendations: EquipmentRecommendation[] = data.map(item => ({
          ...item,
          // Ensure priority is one of the allowed values
          priority: (item.priority === 'High' || item.priority === 'Medium' || item.priority === 'Low') 
            ? item.priority 
            : 'Medium'
        }));
        
        setRecommendations(formattedRecommendations);
        setError(null);
      } catch (err) {
        console.error("Error fetching equipment recommendations:", err);
        setError("Failed to load maintenance recommendations");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Equipment Maintenance Due</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex justify-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-esm-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Equipment Maintenance Due</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center p-6">
            <p className="text-red-500">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Equipment Maintenance Due</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center p-6 text-slate-500">
            All equipment maintenance is up to date
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Equipment Maintenance Due</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/maintenance">
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {recommendations.map((item) => (
            <div 
              key={item.id} 
              className={`flex items-start p-3 rounded-md border ${
                item.priority === 'High' ? 'border-red-200 bg-red-50' :
                item.priority === 'Medium' ? 'border-amber-200 bg-amber-50' :
                'border-green-200 bg-green-50'
              }`}
            >
              <AlertTriangle className={`h-5 w-5 mr-3 flex-shrink-0 ${
                item.priority === 'High' ? 'text-red-600' :
                item.priority === 'Medium' ? 'text-amber-600' :
                'text-green-600'
              }`} />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">{item.name} ({item.model})</p>
                <p className="text-xs text-slate-500">
                  {item.maintenanceType} maintenance due on {new Date(item.maintenanceDate).toLocaleDateString()}
                </p>
              </div>
              <Button 
                size="sm" 
                variant="ghost"
                className="flex-shrink-0"
              >
                Schedule
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
