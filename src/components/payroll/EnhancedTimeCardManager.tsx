import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTimeCards } from '@/hooks/useTimeCards';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useShopId } from '@/hooks/useShopId';
import { format } from 'date-fns';
import { 
  CheckCircle, 
  Search,
  Filter,
  Edit,
  User
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { TimeCardEditDialog } from './TimeCardEditDialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TimeCardWithProfile {
  id: string;
  employee_id: string;
  clock_in_time: string;
  clock_out_time: string | null;
  total_hours: number | null;
  overtime_hours: number | null;
  total_pay: number | null;
  status: string;
  employee_name?: string;
}

export function EnhancedTimeCardManager() {
  const { shopId } = useShopId();
  const { approveTimeCard, refetch } = useTimeCards();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');
  const [editingTimeCard, setEditingTimeCard] = useState<any>(null);

  // Fetch time cards
  const { data: timeCardsRaw, isLoading } = useQuery({
    queryKey: ['time-cards-raw', shopId],
    queryFn: async () => {
      if (!shopId) return [];
      
      const { data, error } = await supabase
        .from('time_card_entries')
        .select('*')
        .eq('shop_id', shopId)
        .order('clock_in_time', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!shopId,
  });

  // Fetch profiles separately
  const { data: profiles } = useQuery({
    queryKey: ['profiles-list', shopId],
    queryFn: async () => {
      if (!shopId) return [];
      
      const { data } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, job_title')
        .eq('shop_id', shopId);
      
      return data || [];
    },
    enabled: !!shopId,
  });

  // Merge time cards with profile names
  const timeCardsWithNames: TimeCardWithProfile[] = React.useMemo(() => {
    if (!timeCardsRaw || !profiles) return [];
    
    return timeCardsRaw.map(tc => {
      const profile = profiles.find(p => p.id === tc.employee_id);
      return {
        ...tc,
        employee_name: profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown',
      };
    });
  }, [timeCardsRaw, profiles]);

  // Get unique employees for filter
  const employees = React.useMemo(() => {
    return profiles || [];
  }, [profiles]);

  // Filter time cards
  const filteredTimeCards = React.useMemo(() => {
    return timeCardsWithNames.filter(tc => {
      if (statusFilter !== 'all' && tc.status !== statusFilter) return false;
      if (employeeFilter !== 'all' && tc.employee_id !== employeeFilter) return false;
      if (searchTerm && !tc.employee_name?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [timeCardsWithNames, statusFilter, employeeFilter, searchTerm]);

  // Calculate totals
  const totals = React.useMemo(() => {
    return filteredTimeCards.reduce((acc, tc) => ({
      hours: acc.hours + (tc.total_hours || 0),
      overtime: acc.overtime + (tc.overtime_hours || 0),
      pay: acc.pay + (tc.total_pay || 0),
    }), { hours: 0, overtime: 0, pay: 0 });
  }, [filteredTimeCards]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'completed': return 'secondary';
      case 'approved': return 'outline';
      default: return 'outline';
    }
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
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
              </SelectContent>
            </Select>

            <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by employee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Hours</p>
              <p className="text-2xl font-bold">{totals.hours.toFixed(1)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Overtime Hours</p>
              <p className="text-2xl font-bold text-orange-500">{totals.overtime.toFixed(1)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Pay</p>
              <p className="text-2xl font-bold text-green-600">${totals.pay.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Cards List */}
      <Card>
        <CardHeader>
          <CardTitle>Time Cards ({filteredTimeCards.length})</CardTitle>
          <CardDescription>
            Review and approve employee time entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {filteredTimeCards.map((tc) => (
                <div 
                  key={tc.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{tc.employee_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(tc.clock_in_time), 'MMM d, yyyy • h:mm a')}
                        {tc.clock_out_time && (
                          <> - {format(new Date(tc.clock_out_time), 'h:mm a')}</>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">
                        {tc.total_hours?.toFixed(2) || '—'} hrs
                      </p>
                      {tc.overtime_hours && tc.overtime_hours > 0 && (
                        <p className="text-sm text-orange-500">
                          +{tc.overtime_hours.toFixed(2)} OT
                        </p>
                      )}
                      {tc.total_pay && (
                        <p className="text-sm text-green-600">
                          ${tc.total_pay.toFixed(2)}
                        </p>
                      )}
                    </div>

                    <Badge variant={getStatusColor(tc.status)}>
                      {tc.status}
                    </Badge>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingTimeCard(tc)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      {tc.status === 'completed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => approveTimeCard(tc.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {filteredTimeCards.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No time cards found
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingTimeCard && (
        <TimeCardEditDialog
          timeCard={editingTimeCard}
          open={!!editingTimeCard}
          onOpenChange={(open) => !open && setEditingTimeCard(null)}
          onSave={() => {
            setEditingTimeCard(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
