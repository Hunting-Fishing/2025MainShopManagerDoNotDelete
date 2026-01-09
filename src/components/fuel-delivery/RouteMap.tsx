import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Navigation, Clock, Route, MapPin, Fuel, AlertTriangle } from 'lucide-react';
import { useRouteOptimization, Location, RouteOptimizationResult } from '@/hooks/useMapbox';
import { cn } from '@/lib/utils';

// Get token from environment
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN;

interface RouteMapProps {
  origin?: [number, number];
  destinations: Location[];
  onOptimizedRoute?: (result: RouteOptimizationResult) => void;
  className?: string;
  showOptimizeButton?: boolean;
  autoOptimize?: boolean;
}

export function RouteMap({
  origin,
  destinations,
  onOptimizedRoute,
  className,
  showOptimizeButton = true,
  autoOptimize = false,
}: RouteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [optimizedResult, setOptimizedResult] = useState<RouteOptimizationResult | null>(null);
  
  const routeOptimization = useRouteOptimization();

  // Default origin (can be set to shop location)
  const defaultOrigin: [number, number] = origin || [-98.5795, 39.8283]; // Center of US

  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: defaultOrigin,
      zoom: destinations.length > 0 ? 10 : 4,
      pitch: 45,
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

  // Update markers when destinations change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add origin marker
    if (origin) {
      const originEl = document.createElement('div');
      originEl.className = 'origin-marker';
      originEl.innerHTML = `
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 border-2 border-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </div>
      `;
      
      const originMarker = new mapboxgl.Marker(originEl)
        .setLngLat(origin)
        .setPopup(new mapboxgl.Popup().setHTML('<strong>Start Location</strong>'))
        .addTo(map.current);
      
      markersRef.current.push(originMarker);
    }

    // Add destination markers
    const displayOrder = optimizedResult?.optimizedOrder || destinations;
    
    displayOrder.forEach((dest, index) => {
      const el = document.createElement('div');
      const priorityColor = dest.priority === 'high' ? 'from-red-500 to-rose-600' : 
                           dest.priority === 'low' ? 'from-slate-400 to-slate-500' :
                           'from-orange-500 to-amber-600';
      
      el.innerHTML = `
        <div class="relative">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br ${priorityColor} flex items-center justify-center shadow-lg border-2 border-white text-white font-bold text-sm">
            ${index + 1}
          </div>
          ${dest.priority === 'high' ? '<div class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>' : ''}
        </div>
      `;

      const marker = new mapboxgl.Marker(el)
        .setLngLat(dest.coordinates)
        .setPopup(
          new mapboxgl.Popup().setHTML(`
            <div class="p-2">
              <strong>${dest.name || `Stop ${index + 1}`}</strong>
              <p class="text-sm text-gray-600">${dest.address}</p>
              ${dest.priority === 'high' ? '<span class="text-xs text-red-500 font-medium">⚠️ Priority</span>' : ''}
            </div>
          `)
        )
        .addTo(map.current!);

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (destinations.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      if (origin) bounds.extend(origin);
      destinations.forEach(dest => bounds.extend(dest.coordinates));
      
      map.current.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        maxZoom: 14,
      });
    }
  }, [destinations, mapLoaded, optimizedResult, origin]);

  // Draw route line
  useEffect(() => {
    if (!map.current || !mapLoaded || !optimizedResult?.optimizedRoute?.geometry) return;

    const sourceId = 'optimized-route';
    const layerId = 'optimized-route-line';

    // Remove existing route
    if (map.current.getLayer(layerId)) {
      map.current.removeLayer(layerId);
    }
    if (map.current.getSource(sourceId)) {
      map.current.removeSource(sourceId);
    }

    // Add new route
    map.current.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: optimizedResult.optimizedRoute.geometry as GeoJSON.Geometry,
      },
    });
    map.current.addLayer({
      id: layerId,
      type: 'line',
      source: sourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#f97316',
        'line-width': 4,
        'line-opacity': 0.8,
      },
    });

  }, [optimizedResult, mapLoaded]);

  // Auto-optimize on mount if enabled
  useEffect(() => {
    if (autoOptimize && origin && destinations.length > 0 && !optimizedResult) {
      handleOptimize();
    }
  }, [autoOptimize, origin, destinations]);

  const handleOptimize = async () => {
    if (!origin || destinations.length === 0) return;

    try {
      const result = await routeOptimization.mutateAsync({
        origin,
        destinations,
        returnToOrigin: true,
      });
      
      setOptimizedResult(result);
      onOptimizedRoute?.(result);
    } catch (error) {
      console.error('Route optimization failed:', error);
    }
  };

  if (!MAPBOX_TOKEN) {
    return (
      <Card className={cn("", className)}>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mb-3 text-amber-500" />
            <p className="font-medium">Mapbox Token Required</p>
            <p className="text-sm text-center mt-1">
              Add VITE_MAPBOX_PUBLIC_TOKEN to your environment variables
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Map */}
      <Card className="overflow-hidden">
        <div ref={mapContainer} className="h-[400px] w-full" />
      </Card>

      {/* Controls & Stats */}
      <div className="flex flex-wrap gap-3">
        {showOptimizeButton && origin && destinations.length > 1 && (
          <Button
            onClick={handleOptimize}
            disabled={routeOptimization.isPending}
            className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
          >
            {routeOptimization.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <Route className="h-4 w-4 mr-2" />
                Optimize Route
              </>
            )}
          </Button>
        )}

        {optimizedResult && (
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1.5">
              <Navigation className="h-3.5 w-3.5 text-orange-500" />
              {optimizedResult.optimizedRoute.distanceMiles} mi
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1.5">
              <Clock className="h-3.5 w-3.5 text-blue-500" />
              {optimizedResult.optimizedRoute.durationMinutes} min
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1.5">
              <MapPin className="h-3.5 w-3.5 text-emerald-500" />
              {destinations.length} stops
            </Badge>
          </div>
        )}
      </div>

      {/* Route Details */}
      {optimizedResult?.legs && optimizedResult.legs.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Route className="h-4 w-4 text-orange-500" />
              Optimized Route Order
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {optimizedResult.legs.map((leg, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="truncate max-w-[200px]">{leg.to}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span>{leg.distanceMiles} mi</span>
                    <span>{leg.durationMinutes} min</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
