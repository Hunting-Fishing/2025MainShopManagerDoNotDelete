
import React from 'react';
import { Car } from 'lucide-react';

// Import car logos, but handle potential import failure
let carLogos: any = {};
try {
  carLogos = require('car-makes-icons');
} catch (error) {
  console.error('Failed to load car-makes-icons:', error);
}

interface ManufacturerLogoProps {
  manufacturer: string;
  className?: string;
}

export const ManufacturerLogo = ({ manufacturer, className = "h-5 w-5" }: ManufacturerLogoProps) => {
  const normalizedName = manufacturer.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  const logoMap: { [key: string]: string } = {
    'vw': 'volkswagen',
    'chevy': 'chevrolet',
    'mercedes': 'mercedesbenz',
    'mercedesbenz': 'mercedesbenz',
    'landrover': 'land-rover'
  };

  const logoName = logoMap[normalizedName] || normalizedName;
  
  // Check if carLogos is properly loaded and contains the logo
  if (carLogos && Object.keys(carLogos).length > 0) {
    const LogoComponent = carLogos[logoName];
    if (LogoComponent) {
      return <LogoComponent className={className} />;
    }
  }

  // Fallback to a generic car icon if logo isn't available
  return <Car className={className} />;
};
