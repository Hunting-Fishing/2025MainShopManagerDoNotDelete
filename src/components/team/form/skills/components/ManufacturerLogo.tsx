
import React, { useEffect, useState } from 'react';
import { Car } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ManufacturerLogoProps {
  manufacturer: string;
  className?: string;
}

export const ManufacturerLogo = ({ manufacturer, className = "h-5 w-5" }: ManufacturerLogoProps) => {
  const [loaded, setLoaded] = useState(false);
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  
  // Normalize the manufacturer name to match our icon filenames
  const normalizedName = manufacturer.toLowerCase().trim()
    .replace(/[\s-]+/g, '-') // Replace spaces and hyphens with single hyphen
    .replace(/[^a-z0-9-]/g, ''); // Remove any other special characters
  
  useEffect(() => {
    const loadIcon = async () => {
      try {
        const { data, error } = await supabase.storage
          .from('Automotive-Icons')
          .getPublicUrl(`${normalizedName}.svg`);
          
        if (error) {
          console.error('Error loading manufacturer icon:', error);
          setLoaded(true);
          return;
        }

        if (data) {
          setIconUrl(data.publicUrl);
          setLoaded(true);
        }
      } catch (err) {
        console.error('Error loading manufacturer icon:', err);
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
