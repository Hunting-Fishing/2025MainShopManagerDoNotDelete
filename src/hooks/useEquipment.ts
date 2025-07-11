import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Equipment, EquipmentStats } from '@/types/equipment';

export function useEquipment() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [stats, setStats] = useState<EquipmentStats>({
    total: 0,
    operational: 0,
    needsMaintenance: 0,
    outOfService: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEquipment = async () => {
    try {
      console.log("Fetching equipment data...");
      
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const equipmentData = data || [];
      setEquipment(equipmentData);

      // Calculate stats
      const stats: EquipmentStats = {
        total: equipmentData.length,
        operational: equipmentData.filter(item => item.status === 'operational').length,
        needsMaintenance: equipmentData.filter(item => item.status === 'maintenance').length,
        outOfService: equipmentData.filter(item => item.status === 'out_of_service').length
      };
      setStats(stats);
      
      console.log("Equipment data loaded:", equipmentData.length, "items");
      setError(null);
    } catch (err) {
      console.error('Error fetching equipment:', err);
      setError(err instanceof Error ? err.message : 'Failed to load equipment');
      setEquipment([]);
      setStats({ total: 0, operational: 0, needsMaintenance: 0, outOfService: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  return {
    equipment,
    stats,
    isLoading,
    error,
    refetch: fetchEquipment
  };
}