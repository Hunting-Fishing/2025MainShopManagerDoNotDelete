
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
  const normalizedName = getStandardizedManufacturerName(manufacturer);
  
  useEffect(() => {
    const loadIcon = async () => {
      try {
        console.log(`Attempting to load icon for: ${manufacturer} (normalized: ${normalizedName})`);
        
        // The icon filename format based on the Supabase storage screenshot (lowercase, no hyphens)
        const iconFilename = `${normalizedName.replace(/-/g, '')}.svg`;
        
        // Get the public URL using the vehicle-icons bucket with Automotive-Icons subfolder
        const { data } = await supabase.storage
          .from('vehicle-icons')
          .getPublicUrl(`Automotive-Icons/${iconFilename}`);
          
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
          // Try alternative format if the first attempt failed
          const alternativeFilename = `${normalizedName}.svg`;
          const { data: altData } = await supabase.storage
            .from('vehicle-icons')
            .getPublicUrl(`Automotive-Icons/${alternativeFilename}`);
            
          if (altData && altData.publicUrl) {
            console.log(`Icon found for ${manufacturer} using alternative name:`, altData.publicUrl);
            setIconUrl(altData.publicUrl);
          } else {
            console.log(`No icon URL returned for ${manufacturer}`);
            setLoadError(true);
          }
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

export default ManufacturerLogo;
