
import React, { useEffect, useState } from 'react';
import { Car } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getStandardizedManufacturerName } from '@/utils/countryCodeMapper';

interface ManufacturerLogoProps {
  manufacturer: string;
  className?: string;
}

export const ManufacturerLogo = ({ manufacturer, className = "h-5 w-5" }: ManufacturerLogoProps) => {
  const [loaded, setLoaded] = useState(false);
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  
  // Normalize the manufacturer name to match our icon filenames
  const normalizedName = getStandardizedManufacturerName(manufacturer)
    .replace(/[\s-]+/g, '-') // Replace spaces and hyphens with single hyphen
    .replace(/[^a-z0-9-]/g, ''); // Remove any other special characters
  
  useEffect(() => {
    const loadIcon = async () => {
      try {
        console.log(`Attempting to load icon for: ${manufacturer} (normalized: ${normalizedName})`);
        
        // Get the public URL directly
        const { data } = await supabase.storage
          .from('Automotive-Icons')
          .getPublicUrl(`${normalizedName}.svg`);
          
        if (data && data.publicUrl) {
          console.log(`Icon found for ${manufacturer}:`, data.publicUrl);
          setIconUrl(data.publicUrl);
          
          // Verify the URL is accessible with a HEAD request
          fetch(data.publicUrl, { method: 'HEAD' })
            .then(response => {
              if (!response.ok) {
                console.error(`Icon URL is not accessible: ${data.publicUrl}`);
                setLoadError(true);
              }
            })
            .catch(err => {
              console.error(`Error checking icon URL: ${err}`);
              setLoadError(true);
            });
        } else {
          console.log(`No icon URL returned for ${manufacturer} (${normalizedName}.svg)`);
          setLoadError(true);
        }
      } catch (err) {
        console.error(`Error loading manufacturer icon for ${manufacturer}:`, err);
        setLoadError(true);
      } finally {
        setLoaded(true);
      }
    };

    setLoaded(false);
    setLoadError(false);
    setIconUrl(null);
    loadIcon();
  }, [manufacturer, normalizedName]);

  if (!loaded) {
    return <Car className={className} />;
  }

  if (loadError || !iconUrl) {
    return <Car className={className} style={{ opacity: 0.5 }} />;
  }

  return (
    <img 
      src={iconUrl} 
      alt={`${manufacturer} logo`}
      className={className}
      onError={() => {
        console.error(`Failed to load image for ${manufacturer} from ${iconUrl}`);
        setLoadError(true);
      }}
    />
  );
};
