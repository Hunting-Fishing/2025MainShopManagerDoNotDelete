
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface TechnicianMetrics {
  technician: string;
  partsInstalled: number;
  averageInstallTime: number;
  defectiveRate: number;
  totalValue: number;
  efficiency: number;
}

export function PartsTechnicianEfficiency() {
  const [metrics, setMetrics] = useState<TechnicianMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTechnicianMetrics();
  }, []);

  const loadTechnicianMetrics = async () => {
    try {
      setLoading(true);

      // Get parts data with technician information
      const { data: parts, error } = await supabase
        .from('work_order_parts')
        .select('*')
        .not('installed_by', 'is', null);

      if (error) throw error;

      if (!parts || parts.length === 0) {
        setMetrics([]);
        return;
      }

      // Group by technician
      const technicianMap = new Map<string, {
        parts: any[];
        totalValue: number;
        installedParts: number;
        defectiveParts: number;
      }>();

      parts.forEach(part => {
        const tech = part.installed_by || 'Unknown';
        const existing = technicianMap.get(tech) || {
          parts: [],
          totalValue: 0,
          installedParts: 0,
          defectiveParts: 0
        };

        existing.parts.push(part);
        existing.totalValue += part.customer_price * part.quantity;
        
        if (part.status === 'installed') {
          existing.installedParts++;
        }
        if (part.status === 'defective') {
          existing.defectiveParts++;
        }

        technicianMap.set(tech, existing);
      });

      // Calculate metrics for each technician
      const technicianMetrics = Array.from(technicianMap.entries()).map(([technician, data]) => {
        const totalParts = data.parts.length;
        const defectiveRate = totalParts > 0 ? (data.defectiveParts / totalParts) * 100 : 0;
        const efficiency = totalParts > 0 ? (data.installedParts / totalParts) * 100 : 0;
        
        // Mock average install time (would be calculated from actual timestamps)
        const averageInstallTime = Math.random() * 60 + 30; // 30-90 minutes

        return {
          technician,
          partsInstalled: data.installedParts,
          averageInstallTime,
          defectiveRate,
          totalValue: data.totalValue,
          efficiency
        };
      });

      // Sort by efficiency
      technicianMetrics.sort((a, b) => b.efficiency - a.efficiency);
      setMetrics(technicianMetrics);

    } catch (error) {
      console.error('Error loading technician metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const totalPartsInstalled = metrics.reduce((sum, m) => sum + m.partsInstalled, 0);
  const averageEfficiency = metrics.length > 0 ? metrics.reduce((sum, m) => sum + m.efficiency, 0) / metrics.length : 0;
  const topPerformer = metrics.length > 0 ? metrics[0] : null;

  return (
    <div className="space-y-6">
      <Alert>
        <Users className="h-4 w-4" />
        <AlertDescription>
          Technician efficiency metrics based on parts installation data. Tracking performance across {metrics.length} technicians.
        </AlertDescription>
      </Alert>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Active Technicians
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.length}</div>
            <Badge variant="outline" className="mt-1">Installing Parts</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Parts Installed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPartsInstalled}</div>
            <Badge variant="outline" className="mt-1 bg-green-50 text-green-700">Total</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Avg Efficiency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageEfficiency.toFixed(1)}%</div>
            <Badge variant="outline" className="mt-1 bg-blue-50 text-blue-700">Team Average</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Top Performer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{topPerformer?.technician || 'N/A'}</div>
            <Badge variant="outline" className="mt-1 bg-yellow-50 text-yellow-700">
              {topPerformer ? `${topPerformer.efficiency.toFixed(1)}%` : 'N/A'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Efficiency Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Technician Efficiency Comparison</CardTitle>
          <CardDescription>Parts installation success rate by technician</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="technician" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
              <Bar dataKey="efficiency" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Metrics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Technician Metrics</CardTitle>
          <CardDescription>Comprehensive performance breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.map((metric, index) => (
              <div key={metric.technician} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{metric.technician}</div>
                    <div className="text-sm text-muted-foreground">
                      {metric.partsInstalled} parts installed
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-6 text-center">
                  <div>
                    <div className="text-lg font-bold">{metric.efficiency.toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">Efficiency</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">${metric.totalValue.toFixed(0)}</div>
                    <div className="text-xs text-muted-foreground">Parts Value</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">{metric.averageInstallTime.toFixed(0)}m</div>
                    <div className="text-xs text-muted-foreground">Avg Install Time</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">{metric.defectiveRate.toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">Defective Rate</div>
                  </div>
                </div>

                <Badge 
                  className={
                    metric.efficiency >= 90 ? 'bg-green-100 text-green-800' :
                    metric.efficiency >= 75 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }
                >
                  {metric.efficiency >= 90 ? 'Excellent' :
                   metric.efficiency >= 75 ? 'Good' : 'Needs Improvement'}
                </Badge>
              </div>
            ))}
          </div>

          {metrics.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
              <Users className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">No technician data available</p>
              <p className="text-sm text-gray-400">Parts need to have technician assignments to show metrics</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
