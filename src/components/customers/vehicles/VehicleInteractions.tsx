
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MessageSquare } from 'lucide-react';
import { InteractionType, InteractionStatus } from '@/types/interaction';

// Define a simplified interface just for this component to avoid circular dependencies
interface VehicleInteraction {
  id: string;
  customer_id: string;
  customer_name: string;
  date: string;
  type: InteractionType;
  description: string;
  staff_member_id: string;
  staff_member_name: string;
  status: InteractionStatus;
  notes?: string;
  related_work_order_id?: string;
  follow_up_date?: string;
  follow_up_completed?: boolean;
  created_at?: string;
  updated_at?: string;
  vehicle_id?: string;
}

export const VehicleInteractions: React.FC<{ vehicleId: string }> = ({ vehicleId }) => {
  const [interactions, setInteractions] = useState<VehicleInteraction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicleInteractions = async () => {
      try {
        const { data, error } = await supabase
          .from('customer_interactions')
          .select('*')
          .eq('vehicle_id', vehicleId)
          .order('date', { ascending: false });
        
        if (error) {
          console.error('Error fetching vehicle interactions:', error);
          setInteractions([]);
        } else {
          // Handle the data with proper type casting
          setInteractions(data as VehicleInteraction[] || []);
        }
      } catch (error) {
        console.error('Error in fetchVehicleInteractions:', error);
        setInteractions([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVehicleInteractions();
  }, [vehicleId]);

  if (loading) {
    return <div className="p-4 text-center">Loading interactions...</div>;
  }

  if (interactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <MessageSquare className="w-16 h-16 mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">No Interactions Found</h3>
        <p className="text-muted-foreground">There are no interactions recorded for this vehicle.</p>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Staff</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {interactions.map((interaction) => (
            <TableRow key={interaction.id}>
              <TableCell>{new Date(interaction.date).toLocaleDateString()}</TableCell>
              <TableCell>{interaction.type}</TableCell>
              <TableCell>{interaction.staff_member_name}</TableCell>
              <TableCell>{interaction.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};
