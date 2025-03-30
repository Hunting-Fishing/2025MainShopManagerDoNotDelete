
import { useState, useEffect, useCallback } from 'react';
import { CarMake, CarModel, VinDecodeResult } from '@/types/vehicle';
import { mockMakes } from '@/data/vehicleMakes';
import { mockModelsByMake } from '@/data/vehicleModels';
import { decodeVin as decodeVinUtil } from '@/utils/vehicleUtils';

/**
 * Hook to provide vehicle data functionality including makes, models, years,
 * and VIN decoding capabilities
 */
export const useVehicleData = () => {
  const [makes, setMakes] = useState<CarMake[]>([]);
  const [models, setModels] = useState<CarModel[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMake, setSelectedMake] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');

  // Load years (from current year back to 1950)
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const yearsList = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i);
    setYears(yearsList);
  }, []);

  // Load makes on mount (now using mock data)
  useEffect(() => {
    setLoading(true);
    try {
      // Use our mock data instead of API
      setMakes(mockMakes);
      setLoading(false);
    } catch (err) {
      console.error("Error setting mock makes:", err);
      setError("Could not load vehicle makes");
      setLoading(false);
    }
  }, []);

  // Function to fetch models for a selected make
  const fetchModels = useCallback((make: string) => {
    if (!make) return;
    
    setLoading(true);
    setError(null);
    setSelectedMake(make);
    setSelectedModel('');
    
    try {
      // Get models from our mock data
      const modelsForMake = mockModelsByMake[make] || [];
      setModels(modelsForMake);
      setLoading(false);
    } catch (err) {
      console.error("Error setting mock models:", err);
      setError("Could not load vehicle models");
      setLoading(false);
    }
  }, []);

  // Function to decode VIN and return vehicle information - now async
  const decodeVin = useCallback(async (vin: string): Promise<VinDecodeResult | null> => {
    setLoading(true);
    try {
      const result = await decodeVinUtil(vin);
      setLoading(false);
      return result;
    } catch (error) {
      console.error("Error in decodeVin:", error);
      setError("Failed to decode VIN");
      setLoading(false);
      return null;
    }
  }, []);

  return {
    makes,
    models,
    years,
    loading,
    error,
    selectedMake,
    selectedModel,
    selectedYear,
    setSelectedModel,
    setSelectedYear,
    fetchModels,
    decodeVin
  };
};
