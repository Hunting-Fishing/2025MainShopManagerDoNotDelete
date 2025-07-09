import { useState, useEffect, useCallback } from 'react';
import { VehicleService } from '@/lib/services/VehicleService';
import { Vehicle, CreateVehicleInput, UpdateVehicleInput } from '@/lib/database/repositories/VehicleRepository';

const vehicleService = new VehicleService();

export function useCompanyAssets() {
  const [assets, setAssets] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await vehicleService.getCompanyAssets();
      setAssets(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch company assets';
      setError(errorMessage);
      console.error('Error fetching company assets:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createAsset = useCallback(async (assetData: CreateVehicleInput) => {
    try {
      // Ensure it's a company asset
      const companyAssetData = {
        ...assetData,
        owner_type: 'company' as const,
        asset_status: assetData.asset_status || 'available' as const
      };
      
      const newAsset = await vehicleService.createVehicle(companyAssetData);
      setAssets(prev => [newAsset, ...prev]);
      return newAsset;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create company asset';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const updateAsset = useCallback(async (id: string, updates: UpdateVehicleInput) => {
    try {
      const updatedAsset = await vehicleService.updateVehicle(id, updates);
      setAssets(prev => prev.map(asset => asset.id === id ? updatedAsset : asset));
      return updatedAsset;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update company asset';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const deleteAsset = useCallback(async (id: string) => {
    try {
      await vehicleService.deleteVehicle(id);
      setAssets(prev => prev.filter(asset => asset.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete company asset';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const checkoutAsset = useCallback(async (id: string, userId: string, expectedReturnDate?: string) => {
    try {
      const updates: UpdateVehicleInput = {
        checked_out_to: userId,
        checked_out_at: new Date().toISOString(),
        asset_status: 'in_use',
        expected_return_date: expectedReturnDate
      };
      
      const updatedAsset = await vehicleService.updateVehicle(id, updates);
      setAssets(prev => prev.map(asset => asset.id === id ? updatedAsset : asset));
      return updatedAsset;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to checkout asset';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const checkinAsset = useCallback(async (id: string) => {
    try {
      const updates: UpdateVehicleInput = {
        checked_out_to: undefined,
        checked_out_at: undefined,
        asset_status: 'available',
        expected_return_date: undefined
      };
      
      const updatedAsset = await vehicleService.updateVehicle(id, updates);
      setAssets(prev => prev.map(asset => asset.id === id ? updatedAsset : asset));
      return updatedAsset;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to checkin asset';
      setError(errorMessage);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  return {
    assets,
    loading,
    error,
    refetch: fetchAssets,
    createAsset,
    updateAsset,
    deleteAsset,
    checkoutAsset,
    checkinAsset
  };
}