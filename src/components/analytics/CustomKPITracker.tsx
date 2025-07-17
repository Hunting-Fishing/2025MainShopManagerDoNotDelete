import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Target, TrendingUp, TrendingDown, MoreVertical, AlertTriangle, CheckCircle } from 'lucide-react';

interface CustomKPITrackerProps {
  data: any;
  isLoading: boolean;
  onKPIClick: (kpi: string) => void;
}

export function CustomKPITracker({ data, isLoading, onKPIClick }: CustomKPITrackerProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-muted rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  // Mock KPI data - in real implementation, this would come from the hook
  const kpis = [
    {
      id: 'revenue_target',
      name: 'Monthly Revenue Target',
      current: 75000,
      target: 100000,
      unit: 'currency',
      category: 'financial',
      trend: 'up',
      change: 12.5,
      status: 'on-track',
      lastUpdated: '2 hours ago'
    },
    {
      id: 'customer_satisfaction',
      name: 'Customer Satisfaction',
      current: 4.7,
      target: 4.8,
      unit: 'rating',
      category: 'customer',
      trend: 'up',
      change: 3.2,
      status: 'warning',
      lastUpdated: '1 hour ago'
    },
    {
      id: 'work_order_completion',
      name: 'Work Order Completion Rate',
      current: 92,
      target: 95,
      unit: 'percentage',
      category: 'operational',
      trend: 'down',
      change: -2.1,
      status: 'behind',
      lastUpdated: '30 minutes ago'
    },
    {
      id: 'technician_efficiency',
      name: 'Technician Efficiency',
      current: 87,
      target: 85,
      unit: 'percentage',
      category: 'operational',
      trend: 'up',
      change: 5.4,
      status: 'ahead',
      lastUpdated: '45 minutes ago'
    },
    {
      id: 'parts_availability',
      name: 'Parts Availability',
      current: 94,
      target: 98,
      unit: 'percentage',
      category: 'inventory',
      trend: 'up',
      change: 1.8,
      status: 'on-track',
      lastUpdated: '1 hour ago'
    },
    {
      id: 'response_time',
      name: 'Average Response Time',
      current: 15,
      target: 12,
      unit: 'minutes',
      category: 'operational',
      trend: 'down',
      change: -8.3,
      status: 'behind',
      lastUpdated: '20 minutes ago'
    }
  ];

  const categories = [
    { value: 'all', label: 'All KPIs' },
    { value: 'financial', label: 'Financial' },
    { value: 'customer', label: 'Customer' },
    { value: 'operational', label: 'Operational' },
    { value: 'inventory', label: 'Inventory' }
  ];

  const filteredKPIs = selectedCategory === 'all' 
    ? kpis 
    : kpis.filter(kpi => kpi.category === selectedCategory);

  const formatValue = (value: number, unit: string) => {
    switch (unit) {
      case 'currency': return `$${value.toLocaleString()}`;
      case 'percentage': return `${value}%`;
      case 'rating': return `${value.toFixed(1)} ★`;
      case 'minutes': return `${value} min`;
      default: return value.toString();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ahead': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'on-track': return <Target className="h-4 w-4 text-primary" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'behind': return <AlertTriangle className="h-4 w-4 text-error" />;
      default: return <Target className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ahead': return 'success';
      case 'on-track': return 'default';
      case 'warning': return 'warning';
      case 'behind': return 'destructive';
      default: return 'secondary';
    }
  };

  const getProgressValue = (current: number, target: number, unit: string) => {
    if (unit === 'minutes') {
      // For time-based metrics, lower is better
      return Math.min((target / current) * 100, 100);
    }
    return Math.min((current / target) * 100, 100);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {categories.map(category => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.value)}
            >
              {category.label}
            </Button>
          ))}
        </div>
        
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add KPI
        </Button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredKPIs.map((kpi) => {
          const progressValue = getProgressValue(kpi.current, kpi.target, kpi.unit);
          
          return (
            <Card 
              key={kpi.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onKPIClick(kpi.id)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(kpi.status)}
                  <CardTitle className="text-sm font-medium">
                    {kpi.name}
                  </CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onKPIClick(kpi.id)}>
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>Edit Target</DropdownMenuItem>
                    <DropdownMenuItem>Set Alert</DropdownMenuItem>
                    <DropdownMenuItem>Remove KPI</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-2xl font-bold">
                    {formatValue(kpi.current, kpi.unit)}
                  </span>
                  <Badge variant={getStatusColor(kpi.status) as any}>
                    {kpi.status.replace('-', ' ')}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Target:</span>
                    <span>{formatValue(kpi.target, kpi.unit)}</span>
                  </div>
                  
                  <Progress 
                    value={progressValue} 
                    className="h-2"
                  />
                  
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">
                      {progressValue.toFixed(0)}% of target
                    </span>
                    <div className="flex items-center gap-1">
                      {kpi.trend === 'up' ? (
                        <TrendingUp className="h-3 w-3 text-success" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-error" />
                      )}
                      <span className={`${kpi.trend === 'up' ? 'text-success' : 'text-error'}`}>
                        {kpi.change > 0 ? '+' : ''}{kpi.change.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Updated {kpi.lastUpdated}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">KPI Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-success">{kpis.filter(k => k.status === 'ahead').length}</p>
              <p className="text-sm text-muted-foreground">Ahead of Target</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{kpis.filter(k => k.status === 'on-track').length}</p>
              <p className="text-sm text-muted-foreground">On Track</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-warning">{kpis.filter(k => k.status === 'warning').length}</p>
              <p className="text-sm text-muted-foreground">Needs Attention</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-error">{kpis.filter(k => k.status === 'behind').length}</p>
              <p className="text-sm text-muted-foreground">Behind Target</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}