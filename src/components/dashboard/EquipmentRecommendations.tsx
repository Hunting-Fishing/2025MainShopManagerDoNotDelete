
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getEquipmentRecommendations } from "@/services/dashboardService";

interface EquipmentRecommendation {
  id: string;
  name: string;
  model: string;
  manufacturer: string;
  maintenanceDate: string;
  maintenanceType: string;
  status: string;
  priority: 'High' | 'Medium' | 'Low';
}

export const EquipmentRecommendations = () => {
  const [recommendations, setRecommendations] = useState<EquipmentRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const data = await getEquipmentRecommendations();
        // Ensure all items have a valid priority
        const validatedData = data.map(item => ({
          ...item,
          priority: validatePriority(item.priority)
        }));
        setRecommendations(validatedData);
        setError(null);
      } catch (err) {
        console.error("Error fetching equipment recommendations:", err);
        setError("Failed to load equipment recommendations");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  // Helper function to validate priority
  const validatePriority = (priority: string): 'High' | 'Medium' | 'Low' => {
    if (priority === 'High' || priority === 'Medium' || priority === 'Low') {
      return priority as 'High' | 'Medium' | 'Low';
    }
    // Default to Medium if the priority is not valid
    return 'Medium';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Equipment Maintenance Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-esm-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Equipment Maintenance Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24 flex items-center justify-center">
            <p className="text-red-500">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If no recommendations
  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Equipment Maintenance Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24 flex items-center justify-center">
            <p className="text-muted-foreground">No maintenance recommendations at this time</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Equipment Maintenance Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Equipment
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Manufacturer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Service Due
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Priority
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {recommendations.slice(0, 3).map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {item.name} {item.model}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {item.manufacturer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(item.maintenanceDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {item.maintenanceType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${item.priority === 'High' ? 'bg-red-100 text-red-800' : 
                        item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-green-100 text-green-800'}`}>
                      {item.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/equipment/${item.id}`} className="text-esm-blue-600 hover:text-esm-blue-800 mr-4">
                      View
                    </Link>
                    <Link to={`/work-orders/new?equipmentId=${item.id}`} className="text-esm-blue-600 hover:text-esm-blue-800">
                      Schedule
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recommendations.length > 3 && (
            <div className="text-right mt-4">
              <Link to="/maintenance" className="text-sm text-esm-blue-600 hover:text-esm-blue-800">
                View all {recommendations.length} recommendations →
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
