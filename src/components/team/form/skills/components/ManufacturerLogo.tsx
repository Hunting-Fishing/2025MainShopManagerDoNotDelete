
import React from 'react';
import * as carLogos from 'car-makes-icons';

interface ManufacturerLogoProps {
  manufacturer: string;
  className?: string;
}

export const ManufacturerLogo = ({ manufacturer, className = "h-5 w-5" }: ManufacturerLogoProps) => {
  const normalizedName = manufacturer.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Map some common variations
  const logoMap: { [key: string]: string } = {
    'vw': 'volkswagen',
    'chevy': 'chevrolet',
    'mercedes': 'mercedesbenz',
    'mercedesbenz': 'mercedesbenz',
    'landrover': 'land-rover'
  };

  const logoName = logoMap[normalizedName] || normalizedName;
  const LogoComponent = (carLogos as any)[logoName];

  if (!LogoComponent) {
    return null;
  }

  return <LogoComponent className={className} />;
};
