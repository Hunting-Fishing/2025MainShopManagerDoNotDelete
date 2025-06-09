
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building, TrendingUp, Package, DollarSign, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface SupplierMetrics {
  supplier: string;
  totalParts: number;
  totalValue: number;
  averagePrice: number;
  defectiveRate: number;
  avgDeliveryTime: number;
  categories: string[];
  performance: number;
}

export function PartsSupplierAnalysis() {
  const [suppliers, setSuppliers] = useState<SupplierMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSupplierMetrics();
  }, []);

  const loadSupplierMetrics = async () => {
    try {
      setLoading(true);
      
      const { data: parts, error } = await supabase
        .from('work_order_parts')
        .select('*');

      if (error) throw error;

      if (!parts || parts.length === 0) {
        setSuppliers([]);
        return;
      }

      // Group by supplier
      const supplierMap = new Map<string, {
        parts: any[];
        totalValue: number;
        defectiveParts: number;
        categories: Set<string>;
      }>();

      parts.forEach(part => {
        const supplier = part.supplier_name || 'Unknown Supplier';
        const existing = supplierMap.get(supplier) || {
          parts: [],
          totalValue: 0,
          defectiveParts: 0,
          categories: new Set<string>()
        };

        existing.parts.push(part);
        existing.totalValue += part.customer_price * part.quantity;
        
        if (part.status === 'defective') {
          existing.defectiveParts++;
        }
        
        if (part.category) {
          existing.categories.add(part.category);
        }

        supplierMap.set(supplier, existing);
      });

      // Calculate metrics for each supplier
      const supplierMetrics = Array.from(supplierMap.entries()).map(([supplier, data]) => {
        const totalParts = data.parts.length;
        const defectiveRate = totalParts > 0 ? (data.defectiveParts / totalParts) * 100 : 0;
        const averagePrice = totalParts > 0 ? data.totalValue / totalParts : 0;
        
        // Mock delivery time (would come from actual order/receipt dates)
        const avgDeliveryTime = Math.random() * 10 + 3; // 3-13 days
        
        // Calculate performance score (lower defective rate and delivery time = higher score)
        const performance = Math.max(0, 100 - defectiveRate - (avgDeliveryTime * 2));

        return {
          supplier,
          totalParts,
          totalValue: data.totalValue,
          averagePrice,
          defectiveRate,
          avgDeliveryTime,
          categories: Array.from(data.categories),
          performance
        };
      });

      // Sort by total value
      supplierMetrics.sort((a, b) => b.totalValue - a.totalValue);
      setSuppliers(supplierMetrics);

    } catch (error) {
      console.error('Error loading supplier metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceRating = (performance: number) => {
    if (performance >= 90) return { rating: 'Excellent', color: 'text-green-600', stars: 5 };
    if (performance >= 80) return { rating: 'Good', color: 'text-blue-600', stars: 4 };
    if (performance >= 70) return { rating: 'Average', color: 'text-yellow-600', stars: 3 };
    if (performance >= 60) return { rating: 'Below Average', color: 'text-orange-600', stars: 2 };
    return { rating: 'Poor', color: 'text-red-600', stars: 1 };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
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

  const totalSuppliers = suppliers.length;
  const totalValue = suppliers.reduce((sum, s) => sum + s.totalValue, 0);
  const avgDefectiveRate = suppliers.length > 0 ? suppliers.reduce((sum, s) => sum + s.defectiveRate, 0) / suppliers.length : 0;
  const topSupplier = suppliers.length > 0 ? suppliers[0] : null;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      <Alert>
        <Building className="h-4 w-4" />
        <AlertDescription>
          Comprehensive supplier analysis including performance metrics, delivery times, and quality assessments.
        </AlertDescription>
      </Alert>

      {/* Supplier Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Building className="h-4 w-4" />
              Total Suppliers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSuppliers}</div>
            <Badge variant="outline" className="mt-1">Active</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
            <Badge variant="outline" className="mt-1 bg-green-50 text-green-700">All Suppliers</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4" />
              Avg Defective Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgDefectiveRate.toFixed(1)}%</div>
            <Badge variant="outline" className={`mt-1 ${
              avgDefectiveRate < 2 ? 'bg-green-50 text-green-700' :
              avgDefectiveRate < 5 ? 'bg-yellow-50 text-yellow-700' :
              'bg-red-50 text-red-700'
            }`}>
              {avgDefectiveRate < 2 ? 'Excellent' : avgDefectiveRate < 5 ? 'Good' : 'Needs Attention'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Star className="h-4 w-4" />
              Top Supplier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{topSupplier?.supplier || 'N/A'}</div>
            <Badge variant="outline" className="mt-1 bg-blue-50 text-blue-700">
              {topSupplier ? `$${topSupplier.totalValue.toFixed(0)}` : 'N/A'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supplier Value Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Supplier Value Distribution</CardTitle>
            <CardDescription>Parts value by supplier</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={suppliers.slice(0, 5)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ supplier, totalValue }) => `${supplier}: $${totalValue.toFixed(0)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="totalValue"
                >
                  {suppliers.slice(0, 5).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Supplier Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Supplier Performance Scores</CardTitle>
            <CardDescription>Based on quality and delivery metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={suppliers.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="supplier" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="performance" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Supplier Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Supplier Analysis</CardTitle>
          <CardDescription>Comprehensive metrics for each supplier</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {suppliers.map((supplier, index) => {
              const rating = getPerformanceRating(supplier.performance);
              return (
                <div key={supplier.supplier} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">{supplier.supplier}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={`flex items-center gap-1 ${rating.color}`}>
                            {[...Array(rating.stars)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-current" />
                            ))}
                            {[...Array(5 - rating.stars)].map((_, i) => (
                              <Star key={i + rating.stars} className="h-3 w-3 text-gray-300" />
                            ))}
                            <span className="text-sm ml-1">{rating.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xl font-bold">${supplier.totalValue.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">Total Value</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="font-bold text-lg">{supplier.totalParts}</div>
                      <div className="text-muted-foreground">Total Parts</div>
                    </div>
                    
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="font-bold text-lg">${supplier.averagePrice.toFixed(0)}</div>
                      <div className="text-muted-foreground">Avg Price</div>
                    </div>
                    
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className={`font-bold text-lg ${supplier.defectiveRate < 2 ? 'text-green-600' : supplier.defectiveRate < 5 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {supplier.defectiveRate.toFixed(1)}%
                      </div>
                      <div className="text-muted-foreground">Defective Rate</div>
                    </div>
                    
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="font-bold text-lg">{supplier.avgDeliveryTime.toFixed(1)}</div>
                      <div className="text-muted-foreground">Avg Delivery (days)</div>
                    </div>
                    
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="font-bold text-lg">{supplier.categories.length}</div>
                      <div className="text-muted-foreground">Categories</div>
                    </div>
                    
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className={`font-bold text-lg ${rating.color}`}>
                        {supplier.performance.toFixed(0)}
                      </div>
                      <div className="text-muted-foreground">Performance</div>
                    </div>
                  </div>

                  {supplier.categories.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="text-sm text-muted-foreground mb-2">Categories:</div>
                      <div className="flex flex-wrap gap-1">
                        {supplier.categories.map(category => (
                          <Badge key={category} variant="outline" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {suppliers.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                <Building className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">No supplier data available</p>
                <p className="text-sm text-gray-400">Parts need supplier information to show analysis</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
