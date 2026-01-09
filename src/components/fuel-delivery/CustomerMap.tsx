import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FuelDeliveryLocation, FuelDeliveryCustomer } from '@/hooks/useFuelDelivery';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZGltZW5zaW9uYWx2ZW50dXJlcyIsImEiOiJjbWs2ZnduZzcwaTdnM2twdGVjdzJuMmMwIn0.B_pTNc8NCLb-zp5zZLvCL1bSEWTomIIrzvKRO4LF4';

interface CustomerMapProps {
  locations: FuelDeliveryLocation[];
  customers: FuelDeliveryCustomer[];
  className?: string;
  onLocationClick?: (location: FuelDeliveryLocation) => void;
}

export function CustomerMap({ locations, customers, className, onLocationClick }: CustomerMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Filter locations with valid coordinates
  const validLocations = locations.filter(loc => loc.latitude && loc.longitude);

  // Get customer name for a location
  const getCustomerName = (customerId?: string) => {
    if (!customerId) return 'Unknown';
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return 'Unknown';
    return customer.company_name || customer.contact_name || 'Unknown';
  };

  // Calculate center from valid locations
  const getCenter = (): [number, number] => {
    if (validLocations.length === 0) return [-98.5795, 39.8283]; // Center of US
    const avgLng = validLocations.reduce((sum, loc) => sum + (loc.longitude || 0), 0) / validLocations.length;
    const avgLat = validLocations.reduce((sum, loc) => sum + (loc.latitude || 0), 0) / validLocations.length;
    return [avgLng, avgLat];
  };

  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: getCenter(),
      zoom: validLocations.length > 0 ? 8 : 4,
      pitch: 30,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  // Update markers when locations change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add location markers
    validLocations.forEach((loc) => {
      const customerName = getCustomerName(loc.customer_id);
      const tankPercent = loc.tank_capacity_gallons && loc.current_level_gallons 
        ? Math.round((loc.current_level_gallons / loc.tank_capacity_gallons) * 100)
        : null;
      
      const isLowFuel = tankPercent !== null && tankPercent < 25;
      const markerColor = isLowFuel 
        ? 'from-red-500 to-rose-600' 
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
        </div>
      `;

      if (onLocationClick) {
        el.addEventListener('click', () => onLocationClick(loc));
      }

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-3 min-w-[200px]">
          <div class="font-bold text-gray-900">${customerName}</div>
          <div class="text-sm text-gray-600 mt-1">${loc.location_name || loc.address}</div>
          <div class="text-xs text-gray-500 mt-1">${loc.city || ''} ${loc.state || ''} ${loc.zip_code || ''}</div>
          <div class="mt-2 pt-2 border-t border-gray-100">
            <div class="flex items-center justify-between text-xs">
              <span class="text-gray-500">Fuel Type:</span>
              <span class="font-medium">${loc.fuel_type || 'N/A'}</span>
            </div>
            ${tankPercent !== null ? `
              <div class="flex items-center justify-between text-xs mt-1">
                <span class="text-gray-500">Tank Level:</span>
                <span class="font-medium ${isLowFuel ? 'text-red-600' : ''}">${tankPercent}%</span>
              </div>
            ` : ''}
            ${loc.tank_capacity_gallons ? `
              <div class="flex items-center justify-between text-xs mt-1">
                <span class="text-gray-500">Tank Capacity:</span>
                <span class="font-medium">${loc.tank_capacity_gallons.toLocaleString()} gal</span>
              </div>
            ` : ''}
          </div>
        </div>
      `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([loc.longitude!, loc.latitude!])
        .setPopup(popup)
        .addTo(map.current!);

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (validLocations.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      validLocations.forEach(loc => bounds.extend([loc.longitude!, loc.latitude!]));
      
      map.current.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        maxZoom: 12,
      });
    } else if (validLocations.length === 1) {
      map.current.flyTo({
        center: [validLocations[0].longitude!, validLocations[0].latitude!],
        zoom: 12,
      });
    }
  }, [locations, customers, mapLoaded]);

  if (!MAPBOX_TOKEN) {
    return (
      <Card className={cn("", className)}>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mb-3 text-amber-500" />
            <p className="font-medium">Mapbox Token Required</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Map */}
      <Card className="overflow-hidden">
        <div ref={mapContainer} className="h-[500px] w-full" />
      </Card>

      {/* Legend & Stats */}
      <div className="flex flex-wrap gap-3 items-center">
        <Badge variant="outline" className="flex items-center gap-2 px-3 py-1.5">
          <Users className="h-3.5 w-3.5 text-blue-500" />
          {validLocations.length} Locations on Map
        </Badge>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600" />
          <span>Normal</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-red-500 to-rose-600" />
          <span>Low Fuel (&lt;25%)</span>
        </div>
      </div>
    </div>
  );
}
