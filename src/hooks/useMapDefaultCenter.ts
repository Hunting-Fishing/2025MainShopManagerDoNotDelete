import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useGeolocation } from './useGeolocation';

// Default fallback: Center of continental US
const US_CENTER: [number, number] = [-98.5795, 39.8283];

export type MapCenterSource = 'driver' | 'shop' | 'fallback';

export interface MapCenterResult {
  center: [number, number];
  source: MapCenterSource;
  isLoading: boolean;
  error: string | null;
  shopLocation: [number, number] | null;
  driverLocation: [number, number] | null;
  requestDriverLocation: () => Promise<void>;
  usingDriverLocation: boolean;
  sourceLabel: string;
}

interface UseMapDefaultCenterOptions {
  shopId?: string;
  enableDriverLocation?: boolean;
  autoRequestDriverLocation?: boolean;
}

export function useMapDefaultCenter({
  shopId,
  enableDriverLocation = true,
  autoRequestDriverLocation = false,
}: UseMapDefaultCenterOptions = {}): MapCenterResult {
  const [driverLocation, setDriverLocation] = useState<[number, number] | null>(null);
  const [usingDriverLocation, setUsingDriverLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  const { getCurrentLocation, isLoading: geoLoading, error: geoError } = useGeolocation();

  // Fetch shop location
  const { data: shopData, isLoading: shopLoading } = useQuery({
    queryKey: ['shop-location', shopId],
    queryFn: async () => {
      if (!shopId) return null;
      
      const { data, error } = await supabase
        .from('shops')
        .select('latitude, longitude, address, city, state')
        .eq('id', shopId)
        .single();
      
      if (error) {
        console.warn('Failed to fetch shop location:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!shopId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Derive shop location coordinates
  const shopLocation: [number, number] | null = 
    shopData?.longitude && shopData?.latitude
      ? [shopData.longitude, shopData.latitude]
      : null;

  // Request driver location
  const requestDriverLocation = useCallback(async () => {
    if (!enableDriverLocation) return;
    
    setLocationError(null);
    
    try {
      const position = await getCurrentLocation();
      const coords: [number, number] = [
        position.coords.longitude,
        position.coords.latitude,
      ];
      setDriverLocation(coords);
      setUsingDriverLocation(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get location';
      setLocationError(message);
      setUsingDriverLocation(false);
    }
  }, [enableDriverLocation, getCurrentLocation]);

  // Auto-request driver location on mount if enabled
  useEffect(() => {
    if (autoRequestDriverLocation && enableDriverLocation) {
      requestDriverLocation();
    }
  }, [autoRequestDriverLocation, enableDriverLocation, requestDriverLocation]);

  // Determine the center based on priority
  const getCenter = (): { center: [number, number]; source: MapCenterSource } => {
    // Priority 1: Driver location (if enabled and available)
    if (usingDriverLocation && driverLocation) {
      return { center: driverLocation, source: 'driver' };
    }
    
    // Priority 2: Shop/Business location
    if (shopLocation) {
      return { center: shopLocation, source: 'shop' };
    }
    
    // Priority 3: Fallback to US center
    return { center: US_CENTER, source: 'fallback' };
  };

  const { center, source } = getCenter();

  // Get user-friendly source label
  const getSourceLabel = (): string => {
    switch (source) {
      case 'driver':
        return 'Centered on your location';
      case 'shop':
        return 'Centered on business location';
      case 'fallback':
        return 'Default view';
    }
  };

  return {
    center,
    source,
    isLoading: shopLoading || geoLoading,
    error: locationError || geoError,
    shopLocation,
    driverLocation,
    requestDriverLocation,
    usingDriverLocation,
    sourceLabel: getSourceLabel(),
  };
}
