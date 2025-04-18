
import React, { useEffect, useState } from 'react';
import { Car } from 'lucide-react';
import 'car-makes-icons/dist/style.css';

interface ManufacturerLogoProps {
  manufacturer: string;
  className?: string;
}

export const ManufacturerLogo = ({ manufacturer, className = "h-5 w-5" }: ManufacturerLogoProps) => {
  const [loaded, setLoaded] = useState(false);
  
  // Normalize the manufacturer name to match the format in car-makes-icons
  const normalizedName = manufacturer.toLowerCase().trim();
  
  // Map of common manufacturer name variants to their standardized names in the car-makes-icons package
  const logoMap: { [key: string]: string } = {
    'vw': 'volkswagen',
    'chevy': 'chevrolet',
    'mercedes': 'mercedesbenz',
    'mercedes-benz': 'mercedesbenz',
    'landrover': 'land-rover',
    'land rover': 'land-rover',
    'alfa': 'alfaromeo',
    'alfa romeo': 'alfaromeo',
    'aston': 'astonmartin',
    'aston martin': 'astonmartin'
  };
  
  // Get the correct logo name
  const logoName = logoMap[normalizedName] || normalizedName;
  
  // Check if the icon exists in the CSS library
  useEffect(() => {
    // Add a small delay to ensure CSS is loaded
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  if (!loaded) {
    return <Car className={className} />;
  }

  // This is how car-makes-icons is meant to be used - with CSS classes
  return (
    <div 
      className={`car-make-icon car-make-icon-${logoName}`} 
      style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      {/* Fallback if CSS doesn't work */}
      <Car className={className} style={{ opacity: 0.5 }} />
    </div>
  );
};
