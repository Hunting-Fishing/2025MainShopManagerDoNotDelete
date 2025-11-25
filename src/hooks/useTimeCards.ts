import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useShopId } from './useShopId';
import { useToast } from './use-toast';
import type { TimeCardEntry } from '@/types/phase5';

export function useTimeCards(employeeId?: string) {
  const { shopId } = useShopId();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [timeCards, setTimeCards] = useState<TimeCardEntry[]>([]);

  useEffect(() => {
    if (shopId) {
      fetchTimeCards();
    }
  }, [shopId, employeeId]);

  const fetchTimeCards = async () => {
    if (!shopId) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('time_card_entries')
        .select('*')
        .eq('shop_id', shopId)
        .order('clock_in_time', { ascending: false });

      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTimeCards(data as any || []);
    } catch (error: any) {
      console.error('Error fetching time cards:', error);
      toast({
        title: 'Error',
        description: 'Failed to load time cards',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const clockIn = async (employeeId: string, hourlyRate?: number) => {
    if (!shopId) return;

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('time_card_entries')
        .insert([{
          shop_id: shopId,
          employee_id: employeeId,
          clock_in_time: new Date().toISOString(),
          hourly_rate: hourlyRate,
          status: 'active'
        }])
        .select()
        .single();

      if (error) throw error;
      
      await fetchTimeCards();
      toast({
        title: 'Success',
        description: 'Clocked in successfully'
      });
      return data;
    } catch (error: any) {
      console.error('Error clocking in:', error);
      toast({
        title: 'Error',
        description: 'Failed to clock in',
        variant: 'destructive'
      });
    }
  };

  const clockOut = async (timeCardId: string) => {
    try {
      const clockOutTime = new Date().toISOString();
      
      // Get the time card to calculate hours
      const { data: timeCard } = await supabase
        .from('time_card_entries')
        .select('*')
        .eq('id', timeCardId)
        .single();

      if (!timeCard) throw new Error('Time card not found');

      const clockInTime = new Date(timeCard.clock_in_time);
      const clockOutDate = new Date(clockOutTime);
      const totalHours = (clockOutDate.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);
      
      const regularHours = Math.min(totalHours, 8);
      const overtimeHours = Math.max(0, totalHours - 8);
      const totalPay = timeCard.hourly_rate 
        ? (regularHours * timeCard.hourly_rate) + (overtimeHours * timeCard.hourly_rate * 1.5)
        : null;

      const { error } = await supabase
        .from('time_card_entries')
        .update({
          clock_out_time: clockOutTime,
          total_hours: totalHours,
          regular_hours: regularHours,
          overtime_hours: overtimeHours,
          total_pay: totalPay,
          status: 'completed'
        })
        .eq('id', timeCardId);

      if (error) throw error;
      
      await fetchTimeCards();
      toast({
        title: 'Success',
        description: 'Clocked out successfully'
      });
    } catch (error: any) {
      console.error('Error clocking out:', error);
      toast({
        title: 'Error',
        description: 'Failed to clock out',
        variant: 'destructive'
      });
    }
  };

  const approveTimeCard = async (timeCardId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('time_card_entries')
        .update({
          status: 'approved',
          approved_by: userData.user.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', timeCardId);

      if (error) throw error;
      
      await fetchTimeCards();
      toast({
        title: 'Success',
        description: 'Time card approved'
      });
    } catch (error: any) {
      console.error('Error approving time card:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve time card',
        variant: 'destructive'
      });
    }
  };

  return {
    loading,
    timeCards,
    clockIn,
    clockOut,
    approveTimeCard,
    refetch: fetchTimeCards
  };
}
