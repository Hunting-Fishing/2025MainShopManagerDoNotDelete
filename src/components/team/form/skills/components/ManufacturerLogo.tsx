
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
  
  // Normalize the manufacturer name to match our icon filenames
  const normalizedName = getStandardizedManufacturerName(manufacturer)
    .replace(/[\s-]+/g, '-') // Replace spaces and hyphens with single hyphen
    .replace(/[^a-z0-9-]/g, ''); // Remove any other special characters
  
  useEffect(() => {
    const loadIcon = async () => {
      try {
        // getPublicUrl doesn't return an error, just the data with publicUrl
        const { data } = await supabase.storage
          .from('Automotive-Icons')
          .getPublicUrl(`${normalizedName}.svg`);
          
        if (data) {
          setIconUrl(data.publicUrl);
        }
      } catch (err) {
        console.error('Error loading manufacturer icon:', err);
      } finally {
        setLoaded(true);
      }
    };

    loadIcon();
  }, [normalizedName]);

  if (!loaded) {
    return <Car className={className} />;
  }

  if (!iconUrl) {
    return <Car className={className} style={{ opacity: 0.5 }} />;
  }

  return (
    <img 
      src={iconUrl} 
      alt={`${manufacturer} logo`}
      className={className}
      onError={() => setIconUrl(null)}
    />
  );
};
