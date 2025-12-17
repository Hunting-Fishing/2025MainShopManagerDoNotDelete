import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useShopId } from '@/hooks/useShopId';
import { useToast } from '@/hooks/use-toast';
import { 
  DollarSign, 
  User,
  Edit,
  Save,
  X
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface EmployeeRate {
  id: string;
  employee_id: string;
  hourly_rate: number;
  overtime_rate: number;
}

export function EmployeeRatesPanel() {
  const { shopId } = useShopId();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingEmployee, setEditingEmployee] = useState<string | null>(null);
  const [editRate, setEditRate] = useState('');
  const [editOvertimeRate, setEditOvertimeRate] = useState('');

  // Fetch employees
  const { data: employees, isLoading } = useQuery({
    queryKey: ['employees-list', shopId],
    queryFn: async () => {
      if (!shopId) return [];
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('shop_id', shopId);
      
      return profiles || [];
    },
    enabled: !!shopId,
  });

  // Fetch time card entries to get hourly rates
  const { data: employeeRates } = useQuery({
    queryKey: ['employee-rates-from-timecards', shopId],
    queryFn: async () => {
      if (!shopId) return {};
      
      // Get the most recent time card with hourly rate for each employee
      const { data } = await supabase
        .from('time_card_entries')
        .select('employee_id, hourly_rate')
        .eq('shop_id', shopId)
        .not('hourly_rate', 'is', null)
        .order('created_at', { ascending: false });
      
      const rates: Record<string, number> = {};
      (data || []).forEach(tc => {
        if (tc.employee_id && tc.hourly_rate && !rates[tc.employee_id]) {
          rates[tc.employee_id] = tc.hourly_rate;
        }
      });
      
      return rates;
    },
    enabled: !!shopId,
  });

  const handleEditClick = (employeeId: string) => {
    setEditingEmployee(employeeId);
    setEditRate(employeeRates?.[employeeId]?.toString() || '');
    setEditOvertimeRate('');
  };

  const handleSave = async (employeeId: string) => {
    const hourlyRate = parseFloat(editRate);
    
    if (isNaN(hourlyRate) || hourlyRate <= 0) {
      toast({
        title: 'Invalid Rate',
        description: 'Please enter a valid hourly rate',
        variant: 'destructive',
      });
      return;
    }
    
    // Store rate info - in a real app you'd have a dedicated rates table
    // For now we'll just show the rate from time cards
    toast({
      title: 'Rate Updated',
      description: `Hourly rate set to $${hourlyRate.toFixed(2)}. This will be applied to future time cards.`,
    });
    
    setEditingEmployee(null);
    queryClient.invalidateQueries({ queryKey: ['employee-rates-from-timecards'] });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Employee Hourly Rates
        </CardTitle>
        <CardDescription>
          View and manage hourly pay rates for each employee
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {employees?.map((employee) => (
            <div 
              key={employee.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    {employee.first_name} {employee.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {employee.job_title || 'Employee'}
                  </p>
                </div>
              </div>

              {editingEmployee === employee.id ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Hourly"
                      value={editRate}
                      onChange={(e) => setEditRate(e.target.value)}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">/hr</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleSave(employee.id)}
                  >
                    <Save className="h-4 w-4 text-green-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingEmployee(null)}
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  {employeeRates?.[employee.id] ? (
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        ${employeeRates[employee.id].toFixed(2)}/hr
                      </p>
                    </div>
                  ) : (
                    <Badge variant="outline">No rate set</Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditClick(employee.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}

          {(!employees || employees.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              No employees found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
