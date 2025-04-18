
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
        
        // First, check if the file exists in the bucket
        const { data: fileData, error: fileError } = await supabase.storage
          .from('Automotive-Icons')
          .list('', {
            search: `${normalizedName}.svg`
          });
        
        if (fileError) {
          console.error('Error checking file existence:', fileError);
          setLoadError(true);
          return;
        }

        const fileExists = fileData && fileData.length > 0;
        
        if (fileExists) {
          // If file exists, get the public URL
          const { data } = await supabase.storage
            .from('Automotive-Icons')
            .getPublicUrl(`${normalizedName}.svg`);
            
          if (data && data.publicUrl) {
            console.log(`Icon found for ${manufacturer}:`, data.publicUrl);
            setIconUrl(data.publicUrl);
          } else {
            console.log(`No icon URL returned for ${manufacturer}`);
            setLoadError(true);
          }
        } else {
          console.log(`No icon found for ${manufacturer} (${normalizedName}.svg)`);
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
      onError={() => setLoadError(true)}
    />
  );
};
