import { useState, useEffect, useCallback } from 'react';
import { CarMake, CarModel } from '@/types/vehicle';
import { fetchMakes, fetchModels as fetchVehicleModels } from '@/services/vehicleDataService';

export const useVehicleData = () => {
  const [makes, setMakes] = useState<CarMake[]>([]);
  const [models, setModels] = useState<CarModel[]>([]);
  const [isLoadingMakes, setIsLoadingMakes] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [makesError, setMakesError] = useState<string | null>(null);
  const [modelsError, setModelsError] = useState<string | null>(null);

  // Fetch makes on mount
  useEffect(() => {
    const loadMakes = async () => {
      setIsLoadingMakes(true);
      setMakesError(null);
      
      try {
        console.log('Loading vehicle makes...');
        const fetchedMakes = await fetchMakes();
        console.log('Vehicle makes loaded:', fetchedMakes);
        setMakes(fetchedMakes);
      } catch (error) {
        console.error('Error loading makes:', error);
        setMakesError(error instanceof Error ? error.message : 'Failed to load makes');
      } finally {
        setIsLoadingMakes(false);
      }
    };

    loadMakes();
  }, []);

  // Fetch models for a specific make
  const fetchModels = useCallback(async (makeId: string) => {
    if (!makeId) {
      setModels([]);
      return;
    }

    setIsLoadingModels(true);
    setModelsError(null);
    
    try {
      console.log('Loading models for make:', makeId);
      const fetchedModels = await fetchVehicleModels(makeId);
      console.log('Models loaded:', fetchedModels);
      setModels(fetchedModels);
    } catch (error) {
      console.error('Error loading models:', error);
      setModelsError(error instanceof Error ? error.message : 'Failed to load models');
      setModels([]);
    } finally {
      setIsLoadingModels(false);
    }
  }, []);

  return {
    makes,
    models,
    isLoadingMakes,
    isLoadingModels,
    makesError,
    modelsError,
    fetchModels
  };
};