
import { useState, useEffect } from 'react';
import { LoyaltyTier } from '@/types/loyalty';
import { useShopId } from '@/hooks/useShopId';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { getShopTiers } from '@/services/loyalty';

export function useLoyaltyTiers() {
  const [tiers, setTiers] = useState<LoyaltyTier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingTier, setIsAddingTier] = useState(false);
  const [editingTier, setEditingTier] = useState<LoyaltyTier | null>(null);
  const { shopId } = useShopId();

  useEffect(() => {
    const loadTiers = async () => {
      if (!shopId) return;
      
      setIsLoading(true);
      try {
        const tiersData = await getShopTiers(shopId);
        setTiers(tiersData);
      } catch (error) {
        console.error('Error loading loyalty tiers:', error);
        toast.error('Failed to load loyalty tiers');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTiers();
  }, [shopId]);

  const handleAddTier = async (tier: LoyaltyTier) => {
    if (!shopId) return;
    
    setIsSaving(true);
    try {
      const newTier = { ...tier, shop_id: shopId };
      const { data, error } = await supabase
        .from('loyalty_tiers')
        .insert(newTier)
        .select()
        .single();
        
      if (error) throw error;
      
      setTiers([...tiers, data]);
      setIsAddingTier(false);
      toast.success('Loyalty tier created successfully');
    } catch (error) {
      console.error('Error adding loyalty tier:', error);
      toast.error('Failed to create loyalty tier');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateTier = async (tier: LoyaltyTier) => {
    if (!tier.id) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('loyalty_tiers')
        .update(tier)
        .eq('id', tier.id);
        
      if (error) throw error;
      
      setTiers(tiers.map(t => t.id === tier.id ? tier : t));
      setEditingTier(null);
      toast.success('Loyalty tier updated successfully');
    } catch (error) {
      console.error('Error updating loyalty tier:', error);
      toast.error('Failed to update loyalty tier');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTier = async (tier: LoyaltyTier) => {
    if (!tier.id) return;
    
    if (!window.confirm(`Are you sure you want to delete the ${tier.name} tier?`)) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('loyalty_tiers')
        .delete()
        .eq('id', tier.id);
        
      if (error) throw error;
      
      setTiers(tiers.filter(t => t.id !== tier.id));
      toast.success('Loyalty tier deleted successfully');
    } catch (error) {
      console.error('Error deleting loyalty tier:', error);
      toast.error('Failed to delete loyalty tier');
    }
  };

  const handleEditTier = (tier: LoyaltyTier) => {
    setEditingTier(tier);
    setIsAddingTier(false);
  };

  const handleCancelEdit = () => {
    setIsAddingTier(false);
    setEditingTier(null);
  };

  return {
    tiers,
    isLoading,
    isSaving,
    isAddingTier,
    editingTier,
    setIsAddingTier,
    setEditingTier,
    handleAddTier,
    handleUpdateTier,
    handleDeleteTier,
    handleEditTier,
    handleCancelEdit
  };
}
