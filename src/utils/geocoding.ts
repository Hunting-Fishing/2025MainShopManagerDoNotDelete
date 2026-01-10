/**
 * Geocoding utility using Mapbox API
 */

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoibG92YWJsZS1kZXYiLCJhIjoiY200aGd0NnJyMGFwbTJscjE4NWpxMXptOSJ9.oQFUL7tXenYPGUouQRznow';

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

/**
 * Geocode an address string to get coordinates
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  if (!address || address.trim().length < 5) {
    return null;
  }

  try {
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=1`
    );

    if (!response.ok) {
      console.error('Geocoding request failed:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      return {
        longitude: feature.center[0],
        latitude: feature.center[1],
        formattedAddress: feature.place_name || address
      };
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}
