import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';

export interface WeatherDay {
  id?: string;
  forecast_date: string;
  temperature_high: number | null;
  temperature_low: number | null;
  precipitation_chance: number | null;
  wind_speed: number | null;
  humidity: number | null;
  conditions: string | null;
  is_suitable_for_work: boolean | null;
  suitability?: 'good' | 'marginal' | 'poor';
}

interface WeatherLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

interface CachedWeather {
  forecast: WeatherDay[];
  location: WeatherLocation;
  fetched_at: string;
}

// Default location (can be overridden by shop settings)
const DEFAULT_LOCATION: WeatherLocation = {
  latitude: 37.7749,
  longitude: -122.4194,
  address: 'San Francisco, CA',
};

// Cache duration in hours
const CACHE_DURATION_HOURS = 6;

export function usePowerWashingWeather() {
  const queryClient = useQueryClient();

  // Get saved location from localStorage (or could be from shop settings)
  const getSavedLocation = (): WeatherLocation => {
    try {
      const saved = localStorage.getItem('pw_weather_location');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error reading saved location:', e);
    }
    return DEFAULT_LOCATION;
  };

  // Check if cached weather is still valid
  const getCachedWeather = (): CachedWeather | null => {
    try {
      const cached = localStorage.getItem('pw_weather_cache');
      if (cached) {
        const data = JSON.parse(cached) as CachedWeather;
        const fetchedAt = new Date(data.fetched_at);
        const now = new Date();
        const hoursDiff = (now.getTime() - fetchedAt.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff < CACHE_DURATION_HOURS) {
          return data;
        }
      }
    } catch (e) {
      console.error('Error reading cached weather:', e);
    }
    return null;
  };

  // Save weather to cache
  const cacheWeather = (data: CachedWeather) => {
    try {
      localStorage.setItem('pw_weather_cache', JSON.stringify(data));
    } catch (e) {
      console.error('Error caching weather:', e);
    }
  };

  // Main weather query
  const weatherQuery = useQuery({
    queryKey: ['power-washing-weather'],
    queryFn: async (): Promise<{ forecast: WeatherDay[]; location: WeatherLocation; lastUpdated: string }> => {
      // Check cache first
      const cached = getCachedWeather();
      const location = getSavedLocation();
      
      // If cache is valid and location matches, use cached data
      if (cached && 
          cached.location.latitude === location.latitude && 
          cached.location.longitude === location.longitude) {
        console.log('Using cached weather data');
        return {
          forecast: cached.forecast,
          location: cached.location,
          lastUpdated: cached.fetched_at,
        };
      }

      console.log('Fetching fresh weather data for:', location);

      // Fetch from edge function
      const { data, error } = await supabase.functions.invoke('get-weather-forecast', {
        body: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
      });

      if (error) {
        console.error('Error fetching weather:', error);
        throw new Error(error.message || 'Failed to fetch weather data');
      }

      if (!data.success) {
        throw new Error(data.error || 'Weather API returned an error');
      }

      // Cache the result
      const cacheData: CachedWeather = {
        forecast: data.forecast,
        location: {
          ...location,
          latitude: data.location.latitude,
          longitude: data.location.longitude,
        },
        fetched_at: data.fetched_at,
      };
      cacheWeather(cacheData);

      return {
        forecast: data.forecast,
        location: cacheData.location,
        lastUpdated: data.fetched_at,
      };
    },
    staleTime: CACHE_DURATION_HOURS * 60 * 60 * 1000, // Match cache duration
    retry: 2,
  });

  // Mutation to update location
  const updateLocationMutation = useMutation({
    mutationFn: async (newLocation: WeatherLocation) => {
      // Save new location
      localStorage.setItem('pw_weather_location', JSON.stringify(newLocation));
      
      // Clear cache to force refresh
      localStorage.removeItem('pw_weather_cache');
      
      return newLocation;
    },
    onSuccess: () => {
      // Invalidate and refetch weather data
      queryClient.invalidateQueries({ queryKey: ['power-washing-weather'] });
      toast.success('Weather location updated');
    },
    onError: (error) => {
      console.error('Error updating location:', error);
      toast.error('Failed to update weather location');
    },
  });

  // Force refresh weather data
  const refreshWeather = async () => {
    // Clear cache
    localStorage.removeItem('pw_weather_cache');
    // Refetch
    await queryClient.invalidateQueries({ queryKey: ['power-washing-weather'] });
  };

  return {
    weatherData: weatherQuery.data?.forecast ?? [],
    location: weatherQuery.data?.location ?? getSavedLocation(),
    lastUpdated: weatherQuery.data?.lastUpdated,
    isLoading: weatherQuery.isLoading,
    isError: weatherQuery.isError,
    error: weatherQuery.error,
    refetch: weatherQuery.refetch,
    refreshWeather,
    updateLocation: updateLocationMutation.mutate,
    isUpdatingLocation: updateLocationMutation.isPending,
  };
}
