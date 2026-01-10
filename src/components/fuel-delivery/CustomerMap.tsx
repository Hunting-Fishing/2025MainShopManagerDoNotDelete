import React, { useEffect, useMemo, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Users, AlertTriangle, Calendar, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FuelDeliveryLocation, FuelDeliveryCustomer } from '@/hooks/useFuelDelivery';
import { useMapboxPublicToken } from '@/hooks/useMapboxPublicToken';
import { validateMapboxPublicToken } from '@/lib/mapbox/validateMapboxPublicToken';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sun', short: 'S' },
  { value: 1, label: 'Mon', short: 'M' },
  { value: 2, label: 'Tue', short: 'T' },
  { value: 3, label: 'Wed', short: 'W' },
  { value: 4, label: 'Thu', short: 'T' },
  { value: 5, label: 'Fri', short: 'F' },
  { value: 6, label: 'Sat', short: 'S' },
];

const FREQUENCY_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi_weekly', label: 'Bi-Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'on_demand', label: 'On Demand' },
];

interface CustomerMapProps {
  locations: FuelDeliveryLocation[];
  customers: FuelDeliveryCustomer[];
  className?: string;
  onLocationClick?: (location: FuelDeliveryLocation) => void;
}

export function CustomerMap({ locations, customers, className, onLocationClick }: CustomerMapProps) {
  const { token, setToken, hasEnvToken, isLoading: isLoadingToken } = useMapboxPublicToken();
  const [tokenInput, setTokenInput] = useState(token);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Filter state
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [selectedFrequency, setSelectedFrequency] = useState<string>('all');
  const [showLowFuelOnly, setShowLowFuelOnly] = useState(false);

  // Fetch business location from settings
  const { data: settings } = useQuery({
    queryKey: ['fuel-delivery-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fuel_delivery_settings')
        .select('business_latitude, business_longitude')
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    setTokenInput(token);
  }, [token]);

  // Build a combined list of markers from locations + customers (fallback)
  const allMarkerData = useMemo(() => {
    const markers: Array<{
      id: string;
      type: 'location' | 'customer';
      latitude: number;
      longitude: number;
      customerId?: string;
      locationName?: string;
      address?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      fuelType?: string;
      tankCapacity?: number;
      currentLevel?: number;
      deliveryDays?: number[];
      deliveryFrequency?: string;
    }> = [];

    // Add all locations with coordinates
    locations.forEach(loc => {
      if (loc.latitude && loc.longitude) {
        markers.push({
          id: loc.id,
          type: 'location',
          latitude: loc.latitude,
          longitude: loc.longitude,
          customerId: loc.customer_id,
          locationName: loc.location_name,
          address: loc.address,
          city: loc.city,
          state: loc.state,
          zipCode: loc.zip_code,
          fuelType: loc.fuel_type,
          tankCapacity: loc.tank_capacity_gallons,
          currentLevel: loc.current_level_gallons,
          deliveryDays: loc.delivery_days,
          deliveryFrequency: loc.delivery_frequency,
        });
      }
    });

    // Add customers with coordinates who don't have a location entry (fallback)
    const locationCustomerIds = new Set(locations.map(l => l.customer_id).filter(Boolean));
    customers.forEach(cust => {
      if (cust.billing_latitude && cust.billing_longitude && !locationCustomerIds.has(cust.id)) {
        markers.push({
          id: `customer-${cust.id}`,
          type: 'customer',
          latitude: cust.billing_latitude,
          longitude: cust.billing_longitude,
          customerId: cust.id,
          locationName: 'Primary Location',
          address: cust.billing_address,
          fuelType: cust.preferred_fuel_type,
        });
      }
    });

    return markers;
  }, [locations, customers]);

  // Filter markers based on criteria
  const filteredMarkers = useMemo(() => {
    return allMarkerData.filter((marker) => {
      // Filter by selected days (only applicable to locations)
      if (selectedDays.length > 0) {
        const markerDays = marker.deliveryDays || [];
        const hasMatchingDay = selectedDays.some((day) => markerDays.includes(day));
        if (!hasMatchingDay && marker.type === 'location') return false;
        // For customers without location, show them if no day filter applied to their non-existent schedule
        if (marker.type === 'customer') return true; // Always show customers when filtering by days
      }

      // Filter by frequency (only applicable to locations)
      if (selectedFrequency !== 'all') {
        if (marker.type === 'location' && marker.deliveryFrequency !== selectedFrequency) return false;
        // Show customers regardless of frequency since they don't have one set
      }

      // Filter by low fuel (only applicable to locations with tank data)
      if (showLowFuelOnly) {
        const tankPercent =
          marker.tankCapacity && marker.currentLevel
            ? (marker.currentLevel / marker.tankCapacity) * 100
            : null;
        if (tankPercent === null || tankPercent >= 25) return false;
      }

      return true;
    });
  }, [allMarkerData, selectedDays, selectedFrequency, showLowFuelOnly]);

  // Get customer name for a location
  const getCustomerName = (customerId?: string) => {
    if (!customerId) return 'Unknown';
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return 'Unknown';
    return customer.company_name || customer.contact_name || 'Unknown';
  };

  // Calculate center from filtered markers or use business location
  const getCenter = (): [number, number] => {
    // First priority: use business location from settings if available
    if (settings?.business_longitude && settings?.business_latitude) {
      return [settings.business_longitude, settings.business_latitude];
    }
    // Second priority: center of markers if available
    if (filteredMarkers.length > 0) {
      const avgLng =
        filteredMarkers.reduce((sum, m) => sum + m.longitude, 0) /
        filteredMarkers.length;
      const avgLat =
        filteredMarkers.reduce((sum, m) => sum + m.latitude, 0) /
        filteredMarkers.length;
      return [avgLng, avgLat];
    }
    // Fallback: Center of US
    return [-98.5795, 39.8283];
  };

  // Format delivery schedule for display
  const formatSchedule = (marker: typeof allMarkerData[0]) => {
    const days = marker.deliveryDays || [];
    const dayNames = days
      .map((d) => DAYS_OF_WEEK.find((dw) => dw.value === d)?.label || '')
      .join(', ');
    const freq = FREQUENCY_OPTIONS.find((f) => f.value === marker.deliveryFrequency)?.label || 'Not set';
    return `${freq}${dayNames ? ` (${dayNames})` : ''}`;
  };

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      if (!mapContainer.current || !token) return;

      setMapLoaded(false);
      setTokenError(null);

      // Proactively validate the token so we can show a clear UI instead of a blank map.
      const validation = await validateMapboxPublicToken({ token, styleId: 'mapbox/dark-v11' });
      if (cancelled) return;

      if (!validation.ok) {
        setTokenError(validation.message || 'Invalid Mapbox token.');
        return;
      }

      mapboxgl.accessToken = token;

      // Determine zoom level based on available data
      const hasBusinessLocation = settings?.business_longitude && settings?.business_latitude;
      const defaultZoom = hasBusinessLocation ? 10 : (filteredMarkers.length > 0 ? 8 : 4);

      const instance = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: getCenter(),
        zoom: defaultZoom,
        pitch: 30,
      });

      map.current = instance;

      instance.addControl(new mapboxgl.NavigationControl(), 'top-right');
      instance.addControl(new mapboxgl.FullscreenControl(), 'top-right');

      instance.on('load', () => {
        setMapLoaded(true);
      });

      instance.on('error', (e) => {
        const err: any = (e as any)?.error;
        if (!err) return;
        const msg = (err?.message || String(err) || '').toLowerCase();
        if (err?.status === 401 || err?.status === 403 || msg.includes('invalid token') || msg.includes('not authorized')) {
          setTokenError(
            'Mapbox rejected this token. Verify it is a public token (pk.*) and that any URL restrictions allow this domain.'
          );
        }
      });
    };

    init();

    return () => {
      cancelled = true;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.current?.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, settings?.business_latitude, settings?.business_longitude]);

  // Update markers when filtered markers change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add markers
    filteredMarkers.forEach((markerData) => {
      const customerName = getCustomerName(markerData.customerId);
      const tankPercent =
        markerData.tankCapacity && markerData.currentLevel
          ? Math.round((markerData.currentLevel / markerData.tankCapacity) * 100)
          : null;

      const isLowFuel = tankPercent !== null && tankPercent < 25;
      const isCustomerFallback = markerData.type === 'customer';
      
      // Use different colors: green for customer fallback, blue for locations, red for low fuel
      const markerColor = isLowFuel 
        ? 'from-red-500 to-rose-600' 
        : isCustomerFallback 
          ? 'from-green-500 to-emerald-600' 
          : 'from-blue-500 to-indigo-600';

      const el = document.createElement('div');
      el.className = 'cursor-pointer';
      el.innerHTML = `
        <div class="relative group">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br ${markerColor} flex items-center justify-center shadow-lg border-2 border-white transition-transform hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="0">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
          ${isLowFuel ? '<div class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center animate-pulse"><span class="text-white text-[8px] font-bold">!</span></div>' : ''}
          ${isCustomerFallback ? '<div class="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center"><span class="text-white text-[8px] font-bold">C</span></div>' : ''}
        </div>
      `;

      const schedule = formatSchedule(markerData);
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-3 min-w-[220px]">
          <div class="font-bold text-gray-900">${customerName}</div>
          <div class="text-sm text-gray-600 mt-1">${markerData.locationName || markerData.address}</div>
          <div class="text-xs text-gray-500 mt-1">${markerData.city || ''} ${markerData.state || ''} ${markerData.zipCode || ''}</div>
          ${isCustomerFallback ? '<div class="text-xs text-yellow-600 mt-1 font-medium">📍 Customer address (no location set)</div>' : ''}
          <div class="mt-2 pt-2 border-t border-gray-100">
            <div class="flex items-center justify-between text-xs">
              <span class="text-gray-500">Schedule:</span>
              <span class="font-medium text-blue-600">${schedule}</span>
            </div>
            <div class="flex items-center justify-between text-xs mt-1">
              <span class="text-gray-500">Fuel Type:</span>
              <span class="font-medium">${markerData.fuelType || 'N/A'}</span>
            </div>
            ${tankPercent !== null ? `
              <div class="flex items-center justify-between text-xs mt-1">
                <span class="text-gray-500">Tank Level:</span>
                <span class="font-medium ${isLowFuel ? 'text-red-600' : ''}">${tankPercent}%</span>
              </div>
            ` : ''}
            ${markerData.tankCapacity ? `
              <div class="flex items-center justify-between text-xs mt-1">
                <span class="text-gray-500">Tank Capacity:</span>
                <span class="font-medium">${markerData.tankCapacity.toLocaleString()} gal</span>
              </div>
            ` : ''}
          </div>
        </div>
      `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([markerData.longitude, markerData.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (filteredMarkers.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      filteredMarkers.forEach((m) => bounds.extend([m.longitude, m.latitude]));

      map.current.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        maxZoom: 12,
      });
    } else if (filteredMarkers.length === 1) {
      map.current.flyTo({
        center: [filteredMarkers[0].longitude, filteredMarkers[0].latitude],
        zoom: 12,
      });
    }
  }, [filteredMarkers, customers, mapLoaded]);

  // Toggle day selection
  const toggleDay = (day: number) => {
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const saveToken = () => {
    const next = tokenInput.trim();
    setToken(next);
    setTokenError(null);
  };

  // Show loading state while fetching token
  if (isLoadingToken) {
    return (
      <div className={cn('flex flex-col gap-4', className)}>
        <Card>
          <CardContent className="p-8 flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-muted-foreground">Loading map...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Token prompt (needed for tiles/styles) */}
      {(!token || tokenError) && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Mapbox public token required</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  The map can't load until a valid Mapbox token is provided.
                  {' '}
                  <a className="underline" href="https://account.mapbox.com/access-tokens/" target="_blank" rel="noreferrer">
                    Get a token
                  </a>
                  .
                </p>
                {tokenError && <p className="text-xs text-destructive mt-1">{tokenError}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mapbox-public-token">Mapbox public token</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  id="mapbox-public-token"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="pk.eyJ..."
                  autoComplete="off"
                />
                <Button type="button" onClick={saveToken} className="sm:w-28">
                  Save
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {hasEnvToken
                  ? 'This project already has VITE_MAPBOX_PUBLIC_TOKEN set; you may be using a browser-stored token overriding it.'
                  : 'Saved in this browser only. For production, set VITE_MAPBOX_PUBLIC_TOKEN.'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Days of Week Filter */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Delivery Days
            </div>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <Button
                  key={day.value}
                  variant={selectedDays.includes(day.value) ? 'default' : 'outline'}
                  size="sm"
                  className="w-12 h-8"
                  onClick={() => toggleDay(day.value)}
                >
                  {day.label}
                </Button>
              ))}
              {selectedDays.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDays([])}
                  className="text-muted-foreground"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Frequency Filter */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Filter className="h-4 w-4 text-muted-foreground" />
              Delivery Frequency
            </div>
            <ToggleGroup
              type="single"
              value={selectedFrequency}
              onValueChange={(v) => v && setSelectedFrequency(v)}
              className="justify-start flex-wrap"
            >
              {FREQUENCY_OPTIONS.map((freq) => (
                <ToggleGroupItem key={freq.value} value={freq.value} size="sm" className="px-3">
                  {freq.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-3">
            <Button
              variant={showLowFuelOnly ? 'destructive' : 'outline'}
              size="sm"
              onClick={() => setShowLowFuelOnly(!showLowFuelOnly)}
            >
              <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
              Low Fuel Only
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Map */}
      <Card className="overflow-hidden">
        <div className="relative h-[500px] w-full">
          <div ref={mapContainer} className="absolute inset-0" />
          {!token && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground p-6 text-center">
              Enter a Mapbox token above to load the map.
            </div>
          )}
          {tokenError && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground p-6 text-center">
              Map failed to load. Please update the token above.
            </div>
          )}
        </div>
      </Card>

      {/* Legend & Stats */}
      <div className="flex flex-wrap gap-3 items-center">
        <Badge variant="outline" className="flex items-center gap-2 px-3 py-1.5">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          {filteredMarkers.length} of {allMarkerData.length} Locations/Customers
        </Badge>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600" />
          <span>Location</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-green-500 to-emerald-600" />
          <span>Customer (no location)</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-red-500 to-rose-600" />
          <span>Low Fuel (&lt;25%)</span>
        </div>
      </div>
    </div>
  );
}
