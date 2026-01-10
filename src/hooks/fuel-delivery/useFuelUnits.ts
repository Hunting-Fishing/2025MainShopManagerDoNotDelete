import { useState, useEffect, useCallback } from 'react';

export type UnitSystem = 'imperial' | 'metric';
export type VolumeUnit = 'gallons' | 'litres';

interface FuelUnitPreferences {
  unitSystem: UnitSystem;
  volumeUnit: VolumeUnit;
}

const STORAGE_KEY = 'fuel-delivery-unit-preferences';

const DEFAULT_PREFERENCES: FuelUnitPreferences = {
  unitSystem: 'imperial',
  volumeUnit: 'gallons',
};

// Conversion constants
const GALLONS_TO_LITRES = 3.78541;
const LITRES_TO_GALLONS = 0.264172;

export function useFuelUnits() {
  const [preferences, setPreferences] = useState<FuelUnitPreferences>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return DEFAULT_PREFERENCES;
      }
    }
    return DEFAULT_PREFERENCES;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  const setUnitSystem = useCallback((system: UnitSystem) => {
    setPreferences(prev => ({
      ...prev,
      unitSystem: system,
      volumeUnit: system === 'metric' ? 'litres' : 'gallons',
    }));
  }, []);

  const setVolumeUnit = useCallback((unit: VolumeUnit) => {
    setPreferences(prev => ({
      ...prev,
      volumeUnit: unit,
      unitSystem: unit === 'litres' ? 'metric' : 'imperial',
    }));
  }, []);

  // Convert gallons to the current display unit
  const convertFromGallons = useCallback((gallons: number): number => {
    if (preferences.volumeUnit === 'litres') {
      return gallons * GALLONS_TO_LITRES;
    }
    return gallons;
  }, [preferences.volumeUnit]);

  // Convert from current display unit to gallons (for storage)
  const convertToGallons = useCallback((value: number): number => {
    if (preferences.volumeUnit === 'litres') {
      return value * LITRES_TO_GALLONS;
    }
    return value;
  }, [preferences.volumeUnit]);

  // Format a volume value with the appropriate unit label
  const formatVolume = useCallback((gallons: number, decimals: number = 1): string => {
    const converted = convertFromGallons(gallons);
    const formatted = converted.toFixed(decimals);
    return `${formatted} ${preferences.volumeUnit === 'litres' ? 'L' : 'gal'}`;
  }, [convertFromGallons, preferences.volumeUnit]);

  // Get the unit label
  const getUnitLabel = useCallback((short: boolean = true): string => {
    if (short) {
      return preferences.volumeUnit === 'litres' ? 'L' : 'gal';
    }
    return preferences.volumeUnit === 'litres' ? 'Litres' : 'Gallons';
  }, [preferences.volumeUnit]);

  // Get price label (per litre or per gallon)
  const getPriceLabel = useCallback((short: boolean = true): string => {
    if (short) {
      return preferences.volumeUnit === 'litres' ? '/L' : '/gal';
    }
    return preferences.volumeUnit === 'litres' ? 'per Litre' : 'per Gallon';
  }, [preferences.volumeUnit]);

  return {
    unitSystem: preferences.unitSystem,
    volumeUnit: preferences.volumeUnit,
    setUnitSystem,
    setVolumeUnit,
    convertFromGallons,
    convertToGallons,
    formatVolume,
    getUnitLabel,
    getPriceLabel,
    isMetric: preferences.unitSystem === 'metric',
  };
}
